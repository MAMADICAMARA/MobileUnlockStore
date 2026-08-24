// back/controllers/paymentController.js
const Payment = require('../models/Payment');
const User = require('../models/User');
const PaymentProvider    = require('../models/PaymentProvider');
const PaymentTransaction = require('../models/PaymentTransaction');
const PaymentSettings    = require('../models/PaymentSettings');
const { getPaymentService } = require('../services/payment');
const { generateInternalRef, decryptApiKeys, calculateFees, withRef } = require('../utils/paymentHelpers');

// Montant minimum autorisé pour une recharge de compte (en FG) — doit rester
// synchronisé avec MIN_AMOUNT dans front/src/pages/client/AddFundsPage.jsx
const MIN_PAYMENT_AMOUNT = 100000;

/**
 * @desc    Ajouter un paiement (simulation)
 * @route   POST /api/payments
 * @access  Private
 */
exports.addPayment = async (req, res) => {
  const { amount, type } = req.body;

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < MIN_PAYMENT_AMOUNT) {
    return res.status(400).json({
      message: `Le montant minimum autorisé est de ${new Intl.NumberFormat('fr-FR').format(MIN_PAYMENT_AMOUNT)} FG.`,
    });
  }

  try {
    // Créer le paiement (statut simulé à "Réussi")
    const payment = await Payment.create({
      user: req.user._id,
      amount: parsedAmount,
      type: type || 'Carte',
      status: 'Réussi',
    });
    // $inc garantit l'atomicité : pas de race condition si deux paiements arrivent simultanément
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: parsedAmount } },
      { new: true }
    );
    res.status(201).json({ payment, newBalance: updatedUser.balance });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du paiement.' });
  }
};

/**
 * @desc    Récupérer l'historique des paiements de l'utilisateur
 * @route   GET /api/payments/my-payments
 * @access  Private
 */
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements.' });
  }
};

// ════════════════════════════════════════════════════════════════════════
// SYSTÈME DE PAIEMENT AUTOMATIQUE (providers configurables) — NOUVEAU
// ════════════════════════════════════════════════════════════════════════

const sanitizeProvider = (provider) => {
  const obj = provider.toObject ? provider.toObject() : provider;
  if (obj.apiKeys) obj.apiKeys = { hasKeys: Boolean(obj.apiKeys.key1 || obj.apiKeys.key2) };
  return obj;
};

/**
 * @desc  Liste des providers de paiement — admin voit tout, client ne voit
 *        que les providers actifs (et sans les clés API).
 * @route GET /api/payments/providers
 * @access Private (client ou admin)
 */
exports.getAllProviders = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isActive: true };
    const providers = await PaymentProvider.find(filter).sort({ name: 1 });
    res.json({ success: true, data: providers.map(sanitizeProvider) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des providers.' });
  }
};

/**
 * @desc  Paramètres généraux du paiement automatique (interrupteur + frais)
 * @route GET /api/payments/settings
 * @access Public (le client doit savoir si l'auto-paiement est activé)
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await PaymentSettings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des paramètres.' });
  }
};

/**
 * @desc  Initier un paiement automatique
 * @route POST /api/payments/initiate
 * @body  { providerId, amount }
 * @access Private (client)
 */
exports.initiatePayment = async (req, res) => {
  try {
    const settings = await PaymentSettings.getSettings();
    if (!settings.automaticPaymentEnabled) {
      return res.status(400).json({ success: false, message: 'Le paiement automatique n\'est pas activé.' });
    }

    const { providerId, amount } = req.body;
    const parsedAmount = Number(amount);

    const provider = await PaymentProvider.findById(providerId);
    if (!provider || !provider.isActive) {
      return res.status(400).json({ success: false, message: 'Ce provider de paiement n\'est pas disponible.' });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount < provider.limits.minAmount || parsedAmount > provider.limits.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Le montant doit être compris entre ${provider.limits.minAmount} et ${provider.limits.maxAmount} ${provider.limits.currency}.`,
      });
    }

    const { fees, type, percentage, fixedAmount, totalAmount } = calculateFees(parsedAmount, settings.fees);
    const internalRef = generateInternalRef();
    const rate = provider.limits.exchangeRateToProviderCurrency || 1;
    const amountInProviderCurrency = provider.limits.currency === 'GNF' ? null : Math.round((totalAmount / rate) * 100) / 100;

    const transaction = await PaymentTransaction.create({
      userId: req.user._id,
      providerId: provider._id,
      amount: parsedAmount,
      amountInProviderCurrency,
      currency: provider.limits.currency,
      internalRef,
      amountRequested: parsedAmount,
      amountCharged: totalAmount,
      amountCredited: parsedAmount,
      fees: { amount: fees, type, percentage, fixedAmount },
    });

    const service = getPaymentService(provider.slug);
    const apiKeys = decryptApiKeys(provider);
    const webhookUrl = `${process.env.SITE_BASE_URL}/api/payments/webhook/${provider.slug}`;
    const providerWithWebhook = {
      ...provider.toObject(),
      config: {
        ...provider.config,
        returnUrl: withRef(provider.config.returnUrl, internalRef),
        cancelUrl: withRef(provider.config.cancelUrl, internalRef),
        extraParams: { ...provider.config.extraParams, webhookUrl },
      },
    };

    const result = await service.initiate({ transaction, provider: providerWithWebhook, apiKeys });

    transaction.paymentUrl      = result.paymentUrl;
    transaction.providerRef     = result.providerRef;
    transaction.providerOrderId = result.providerOrderId;
    transaction.providerResponse = result.raw;
    await transaction.save();

    res.status(201).json({ success: true, paymentUrl: result.paymentUrl, internalRef });
  } catch (error) {
    console.error('❌ Erreur initiatePayment:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de l\'initiation du paiement.' });
  }
};

/**
 * @desc  Vérifier le statut d'une transaction (utilisé par les pages de retour)
 * @route GET /api/payments/status/:transactionId
 * @access Private (propriétaire ou admin)
 */
exports.verifyPaymentStatus = async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findOne({ internalRef: req.params.transactionId }).populate('providerId', 'name slug');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction non trouvée.' });

    if (transaction.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé.' });
    }

    // Si toujours en attente, on interroge le provider pour rafraîchir (utile
    // pour les redirections de retour, avant qu'un éventuel webhook n'arrive).
    if (transaction.status === 'pending') {
      try {
        const provider = await PaymentProvider.findById(transaction.providerId);
        const service = getPaymentService(provider.slug);
        const apiKeys = decryptApiKeys(provider);
        const { confirmAndCredit } = require('../utils/paymentHelpers');
        const { status } = await service.checkStatus({ transaction, provider, apiKeys });
        if (status !== 'pending') {
          await confirmAndCredit({ internalRef: transaction.internalRef, providerStatus: status, rawResponse: { source: 'status-check' } });
        }
      } catch (err) {
        console.warn('[PAYMENT] Vérification statut échouée (non bloquant):', err.message);
      }
    }

    const fresh = await PaymentTransaction.findOne({ internalRef: req.params.transactionId });
    res.json({ success: true, data: fresh });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification du statut.' });
  }
};

/**
 * @desc  Historique des transactions de paiement du client connecté
 * @route GET /api/payments/my-transactions
 * @access Private (client)
 */
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find({ userId: req.user._id })
      .populate('providerId', 'name slug type logoUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de l\'historique.' });
  }
};

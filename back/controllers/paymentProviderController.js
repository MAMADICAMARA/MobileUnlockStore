// back/controllers/paymentProviderController.js
// Administration des providers de paiement, des paramètres généraux et de
// l'historique des transactions. Toutes ces routes sont protégées admin.
const PaymentProvider    = require('../models/PaymentProvider');
const PaymentTransaction = require('../models/PaymentTransaction');
const PaymentSettings    = require('../models/PaymentSettings');
const { encrypt } = require('../utils/encryption');
const { decryptApiKeys } = require('../utils/paymentHelpers');
const { getPaymentService } = require('../services/payment');

// Les 4 providers connus sont pré-créés (seed) — l'admin les configure, il
// ne peut pas en ajouter/supprimer d'autres (cf. maquette section 6.1 du
// cahier des charges, qui montre les 4 lignes même "non configurées").
const KNOWN_PROVIDERS = [
  { name: 'PayDunya',   slug: 'paydunya',   type: 'mobile_money', supportedMethods: ['Orange Money', 'MTN Mobile Money', 'Wave', 'Carte bancaire'] },
  { name: 'CinetPay',   slug: 'cinetpay',   type: 'mobile_money', supportedMethods: ['Orange Money', 'MTN', 'Moov', 'Wave'] },
  { name: 'Binance Pay', slug: 'binancepay', type: 'crypto',      supportedMethods: ['USDT', 'BNB', 'BTC'] },
  { name: 'Stripe',     slug: 'stripe',     type: 'card',         supportedMethods: ['Visa', 'Mastercard'] },
];

const seedPaymentProviders = async () => {
  const config = {
    returnUrl: process.env.PAYMENT_SUCCESS_URL || '',
    cancelUrl: process.env.PAYMENT_CANCEL_URL || '',
  };
  for (const p of KNOWN_PROVIDERS) {
    await PaymentProvider.findOneAndUpdate(
      { slug: p.slug },
      { $setOnInsert: { ...p, isActive: false, config } },
      { upsert: true }
    );
  }
};

const sanitizeProvider = (provider) => {
  const obj = provider.toObject ? provider.toObject() : provider;
  if (obj.apiKeys) {
    obj.apiKeys = {
      hasKey1: Boolean(obj.apiKeys.key1),
      hasKey2: Boolean(obj.apiKeys.key2),
      hasKey3: Boolean(obj.apiKeys.key3),
      hasKey4: Boolean(obj.apiKeys.key4),
      hasWebhookSecret: Boolean(obj.apiKeys.webhookSecret),
    };
  }
  return obj;
};

// ════════════════════════════════════════════════════════════════════════
// PROVIDERS
// ════════════════════════════════════════════════════════════════════════

exports.getProviderById = async (req, res) => {
  try {
    const provider = await PaymentProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider non trouvé.' });
    res.json({ success: true, data: sanitizeProvider(provider) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du provider.' });
  }
};

exports.updateProvider = async (req, res) => {
  try {
    const provider = await PaymentProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider non trouvé.' });

    const payload = { ...req.body };

    // Ne chiffrer/écraser que les clés effectivement fournies en clair —
    // un champ vide dans le formulaire signifie "ne pas changer".
    if (payload.apiKeys) {
      const merged = { ...provider.apiKeys.toObject() };
      for (const field of ['key1', 'key2', 'key3', 'key4', 'webhookSecret']) {
        if (payload.apiKeys[field]) merged[field] = encrypt(payload.apiKeys[field]);
      }
      payload.apiKeys = merged;
    }

    Object.assign(provider, payload);
    await provider.save();
    res.json({ success: true, data: sanitizeProvider(provider) });
  } catch (error) {
    console.error('Erreur updateProvider:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du provider.' });
  }
};

exports.toggleProvider = async (req, res) => {
  try {
    const provider = await PaymentProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider non trouvé.' });
    provider.isActive = !provider.isActive;
    await provider.save();
    res.json({ success: true, isActive: provider.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du changement de statut.' });
  }
};

exports.testProviderConnection = async (req, res) => {
  try {
    const provider = await PaymentProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider non trouvé.' });

    const apiKeys = decryptApiKeys(provider);
    if (!apiKeys.key1 || !apiKeys.key2) {
      return res.json({ success: false, message: 'Clés API incomplètes.' });
    }

    // Test réel : tente une initiation avec le montant minimum, sans jamais
    // exposer d'URL de paiement à l'admin — on vérifie juste que l'appel
    // à l'API du provider aboutit (identifiants + endpoints valides).
    const service = getPaymentService(provider.slug);
    const fakeTransaction = {
      internalRef: `TEST-${Date.now()}`,
      amountCharged: provider.limits.minAmount || 100000,
      amountInProviderCurrency: provider.limits.currency === 'GNF' ? null : 1,
      currency: provider.limits.currency,
    };
    const providerWithWebhook = {
      ...provider.toObject(),
      config: { ...provider.config, extraParams: { ...provider.config.extraParams, webhookUrl: `${process.env.SITE_BASE_URL}/api/payments/webhook/${provider.slug}` } },
    };
    await service.initiate({ transaction: fakeTransaction, provider: providerWithWebhook, apiKeys });

    res.json({ success: true, message: '✅ Connexion réussie.' });
  } catch (error) {
    res.json({ success: false, message: `❌ Erreur : ${error.response?.data?.message || error.message}` });
  }
};

// ════════════════════════════════════════════════════════════════════════
// PARAMÈTRES GÉNÉRAUX
// ════════════════════════════════════════════════════════════════════════

exports.updateSettings = async (req, res) => {
  try {
    const settings = await PaymentSettings.getSettings();
    Object.assign(settings, req.body, { updatedBy: req.user._id });
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour des paramètres.' });
  }
};

// ════════════════════════════════════════════════════════════════════════
// TRANSACTIONS (historique admin)
// ════════════════════════════════════════════════════════════════════════

exports.getAllTransactions = async (req, res) => {
  try {
    const { providerId, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (providerId) filter.providerId = providerId;
    if (status)      filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      PaymentTransaction.find(filter)
        .populate('userId', 'name email')
        .populate('providerId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PaymentTransaction.countDocuments(filter),
    ]);

    const stats = await PaymentTransaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amountCredited' } } },
    ]);

    res.json({
      success: true,
      data: transactions,
      stats,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des transactions.' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('providerId', 'name slug');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction non trouvée.' });
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de la transaction.' });
  }
};

module.exports.seedPaymentProviders = seedPaymentProviders;

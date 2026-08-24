// back/utils/paymentHelpers.js
// Logique partagée entre paymentController.js et paymentWebhookController.js :
// calcul des frais, déchiffrement des clés, et crédit atomique idempotent.
const mongoose = require('mongoose');
const crypto   = require('crypto');
const User               = require('../models/User');
const PaymentTransaction = require('../models/PaymentTransaction');
const PaymentProvider    = require('../models/PaymentProvider');
const Notification       = require('../models/Notification');
const { decrypt } = require('./encryption');

const generateInternalRef = () => `TX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// Ajoute ?ref=... (ou &ref=... si l'URL a déjà une query string) — permet à
// la page de retour du client de retrouver la transaction quel que soit le
// provider, même ceux qui ne rajoutent pas leurs propres paramètres.
const withRef = (url, ref) => {
  if (!url) return url;
  return `${url}${url.includes('?') ? '&' : '?'}ref=${ref}`;
};

const decryptApiKeys = (provider) => ({
  key1: provider.apiKeys.key1 ? decrypt(provider.apiKeys.key1) : '',
  key2: provider.apiKeys.key2 ? decrypt(provider.apiKeys.key2) : '',
  key3: provider.apiKeys.key3 ? decrypt(provider.apiKeys.key3) : '',
  key4: provider.apiKeys.key4 ? decrypt(provider.apiKeys.key4) : '',
  webhookSecret: provider.apiKeys.webhookSecret ? decrypt(provider.apiKeys.webhookSecret) : '',
});

// amount : montant que le client veut voir crédité sur son solde (GNF)
const calculateFees = (amount, feesConfig) => {
  if (!feesConfig?.enabled) {
    return { fees: 0, type: null, percentage: 0, fixedAmount: 0, totalAmount: amount };
  }

  let fees = 0;
  if (feesConfig.type === 'percentage' || feesConfig.type === 'both') {
    fees += amount * (feesConfig.percentage / 100);
  }
  if (feesConfig.type === 'fixed' || feesConfig.type === 'both') {
    fees += feesConfig.fixedAmount;
  }
  fees = Math.round(fees);

  const totalAmount = feesConfig.appliedTo === 'client' ? amount + fees : amount;

  return { fees, type: feesConfig.type, percentage: feesConfig.percentage, fixedAmount: feesConfig.fixedAmount, totalAmount };
};

const notifyUser = async (userId, title, message, type = 'info') => {
  try { await Notification.create({ userId, title, message, type }); } catch { /* non bloquant */ }
};

const notifyAllAdmins = async (title, message, type = 'info') => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(a => Notification.create({ userId: a._id, title, message, type }).catch(() => {})));
  } catch { /* non bloquant */ }
};

/**
 * Confirme et crédite une transaction de façon atomique et idempotente.
 * Utilise une transaction MongoDB (le cluster est un vrai replica set) pour
 * garantir que le marquage "credited" et le crédit du solde utilisateur
 * réussissent ou échouent ENSEMBLE — pas de fenêtre où l'un a eu lieu sans
 * l'autre, contrairement à deux écritures séparées.
 *
 * @returns {'credited'|'already_processed'|'not_found'}
 */
const confirmAndCredit = async ({ internalRef, providerStatus, rawResponse }) => {
  const session = await mongoose.startSession();
  let outcome = 'not_found';
  let transaction = null;

  try {
    await session.withTransaction(async () => {
      transaction = await PaymentTransaction.findOne({ internalRef }).session(session);
      if (!transaction) { outcome = 'not_found'; return; }

      if (transaction.credited || transaction.status !== 'pending') {
        outcome = 'already_processed';
        return;
      }

      if (providerStatus !== 'completed') {
        transaction.status = 'failed';
        transaction.webhookReceivedAt = new Date();
        transaction.webhookData = rawResponse;
        await transaction.save({ session });
        outcome = 'failed';
        return;
      }

      transaction.status = 'completed';
      transaction.credited = true;
      transaction.creditedAt = new Date();
      transaction.webhookReceivedAt = new Date();
      transaction.webhookData = rawResponse;
      await transaction.save({ session });

      await User.findByIdAndUpdate(
        transaction.userId,
        { $inc: { balance: transaction.amountCredited } },
        { session }
      );

      await PaymentProvider.findByIdAndUpdate(
        transaction.providerId,
        {
          $inc: { 'stats.totalTransactions': 1, 'stats.totalAmount': transaction.amountCredited },
        },
        { session }
      );

      outcome = 'credited';
    });
  } finally {
    await session.endSession();
  }

  if (outcome === 'credited' && transaction) {
    await notifyUser(
      transaction.userId,
      '✅ Solde rechargé',
      `Votre solde a été crédité de ${new Intl.NumberFormat('fr-FR').format(transaction.amountCredited)} FG.`,
      'success'
    );
    await notifyAllAdmins(
      '💰 Recharge confirmée',
      `Transaction ${transaction.internalRef} confirmée — ${new Intl.NumberFormat('fr-FR').format(transaction.amountCredited)} FG créditée.`,
      'success'
    );
  } else if (outcome === 'failed' && transaction) {
    await notifyUser(
      transaction.userId,
      '❌ Paiement échoué',
      'Votre paiement a échoué ou a été annulé. Réessayez.',
      'error'
    );
  }

  return outcome;
};

module.exports = { generateInternalRef, decryptApiKeys, calculateFees, confirmAndCredit, notifyUser, notifyAllAdmins, withRef };

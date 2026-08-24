// back/services/payment/cinetpay.js
// Intégration CinetPay — Checkout API.
// Sources vérifiées : docs.cinetpay.com/api/1.0-en/checkout/initialisation,
// /checkout/notification et /checkout/verification.
const axios = require('axios');

const PAYMENT_URL = 'https://api-checkout.cinetpay.com/v2/payment';
const CHECK_URL    = 'https://api-checkout.cinetpay.com/v2/payment/check';

// ─── Initier un paiement ────────────────────────────────────────────────────
const initiate = async ({ transaction, provider, apiKeys }) => {
  const body = {
    apikey:         apiKeys.key1,
    site_id:        apiKeys.key2,
    transaction_id: transaction.internalRef, // CinetPay nous renverra ce même ID (cpm_trans_id) sur le webhook
    amount:         transaction.amountInProviderCurrency || transaction.amountCharged,
    currency:       transaction.currency || 'XOF',
    description:    `Recharge solde MobileUnlockStore — ${transaction.internalRef}`,
    notify_url:     provider.config.extraParams?.webhookUrl,
    return_url:     provider.config.returnUrl,
    channels:       'ALL',
    lang:           'fr',
  };

  const { data } = await axios.post(PAYMENT_URL, body, { timeout: 30000 });

  if (data.code !== '201' && data.code !== '00') {
    throw new Error(data.message || 'Erreur CinetPay lors de la création du paiement.');
  }

  return {
    paymentUrl:      data.data?.payment_url,
    providerRef:     data.data?.payment_token,
    providerOrderId: transaction.internalRef, // CinetPay identifie par notre transaction_id, pas un ID à eux
    raw:             data,
  };
};

// ─── Vérifier le statut réel (OBLIGATOIRE avant de créditer — CinetPay ne
// transmet jamais le statut dans le webhook lui-même, pour éviter les attaques
// de type "faux webhook") ─────────────────────────────────────────────────
const checkStatus = async ({ transaction, apiKeys }) => {
  const body = {
    apikey:         apiKeys.key1,
    site_id:        apiKeys.key2,
    transaction_id: transaction.internalRef,
  };
  const { data } = await axios.post(CHECK_URL, body, { timeout: 15000 });

  const rawStatus = data.data?.status; // "ACCEPTED" | "REFUSED" | ...
  const status = data.code === '00' && rawStatus === 'ACCEPTED' ? 'completed'
    : rawStatus ? 'failed' : 'pending';

  return { status, raw: data };
};

// ─── Vérifier un webhook entrant ────────────────────────────────────────────
// Le webhook CinetPay ne contient volontairement pas le statut du paiement —
// il ne sert qu'à déclencher une vérification via checkStatus().
const verifyWebhook = async ({ body, provider, apiKeys }) => {
  const internalRef = body.cpm_trans_id;
  if (!internalRef) return { valid: false };

  // On ne fait pas confiance au corps du webhook : on re-vérifie nous-mêmes.
  const { status, raw } = await checkStatus({
    transaction: { internalRef },
    provider,
    apiKeys,
  });

  return { valid: true, internalRef, status, raw };
};

module.exports = { initiate, checkStatus, verifyWebhook };

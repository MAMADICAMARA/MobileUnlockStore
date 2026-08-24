// back/services/payment/paydunya.js
// Intégration PayDunya — Checkout Invoice API.
// Sources vérifiées : endpoints sandbox/prod et en-têtes PAYDUNYA-*-KEY confirmés
// via developers.paydunya.com/doc/EN/dmp et le SDK officiel paydunya-node-master.
// ⚠️ Le format exact de la sérialisation de la réponse "data" en IPN (voir
// verifyWebhook) et le chemin précis de l'URL de checkout doivent être
// reconfirmés lors des premiers tests en sandbox — la documentation officielle
// bloque l'accès automatisé (403), ces valeurs viennent de sources secondaires.
const axios  = require('axios');
const crypto = require('crypto');

const BASE_URL = {
  sandbox:    'https://app.paydunya.com/sandbox-api/v1',
  production: 'https://app.paydunya.com/api/v1',
};

const buildHeaders = (apiKeys) => ({
  'Content-Type':        'application/json',
  'PAYDUNYA-MASTER-KEY':  apiKeys.key1, // Master Key
  'PAYDUNYA-PUBLIC-KEY':  apiKeys.key2, // Public Key
  'PAYDUNYA-PRIVATE-KEY': apiKeys.key3, // Private Key
  'PAYDUNYA-TOKEN':       apiKeys.key4, // Token
});

// ─── Initier un paiement ────────────────────────────────────────────────────
const initiate = async ({ transaction, provider, apiKeys }) => {
  const baseUrl = BASE_URL[provider.environment];
  const body = {
    invoice: {
      total_amount: transaction.amountInProviderCurrency || transaction.amountCharged,
      description: `Recharge solde MobileUnlockStore — ${transaction.internalRef}`,
    },
    store: { name: 'MobileUnlockStore' },
    actions: {
      cancel_url:   provider.config.cancelUrl,
      return_url:   provider.config.returnUrl,
      callback_url: provider.config.extraParams?.webhookUrl,
    },
    custom_data: { internalRef: transaction.internalRef },
  };

  const { data } = await axios.post(`${baseUrl}/checkout-invoice/create`, body, {
    headers: buildHeaders(apiKeys),
    timeout: 30000,
  });

  if (data.response_code !== '00') {
    throw new Error(data.response_text || 'Erreur PayDunya lors de la création de la facture.');
  }

  return {
    paymentUrl:      data.response_text?.startsWith('http') ? data.response_text : `https://paydunya.com/checkout/invoice/${data.token}`,
    providerRef:     data.token,
    providerOrderId: data.token,
    raw:             data,
  };
};

// ─── Vérifier le statut d'une facture (polling / fallback) ─────────────────
const checkStatus = async ({ transaction, provider, apiKeys }) => {
  const baseUrl = BASE_URL[provider.environment];
  const { data } = await axios.get(`${baseUrl}/checkout-invoice/confirm/${transaction.providerOrderId}`, {
    headers: buildHeaders(apiKeys),
    timeout: 15000,
  });
  const status = data.status === 'completed' ? 'completed' : data.status === 'cancelled' ? 'failed' : 'pending';
  return { status, raw: data };
};

// ─── Vérifier un webhook IPN entrant ────────────────────────────────────────
// PayDunya envoie du application/x-www-form-urlencoded avec un champ "data"
// (déjà parsé par express.urlencoded() global de app.js). Le hash renvoyé est
// simplement sha512(masterKey) — il prouve que l'appelant connaît la clé, il
// ne signe pas le contenu du message.
const verifyWebhook = ({ body, apiKeys }) => {
  let payload = body.data;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { payload = null; }
  }
  if (!payload) return { valid: false };

  const expectedHash = crypto.createHash('sha512').update(apiKeys.key1).digest('hex');
  const receivedHash = payload.hash;
  let valid = false;
  try {
    valid = Boolean(receivedHash) && crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(receivedHash));
  } catch {
    valid = false;
  }
  if (!valid) return { valid: false };

  const internalRef = payload.custom_data?.internalRef;
  const status = payload.status === 'completed' ? 'completed' : 'failed';
  return { valid: true, internalRef, status, raw: payload };
};

module.exports = { initiate, checkStatus, verifyWebhook };

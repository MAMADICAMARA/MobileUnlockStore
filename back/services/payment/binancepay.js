// back/services/payment/binancepay.js
// Intégration Binance Pay — Create Order API (v3) + Webhook.
// Sources vérifiées : developers.binance.com/docs/binance-pay/api-common
// (règles de signature communes) et /docs/binance-pay/webhook-common.
const axios  = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://bpay.binanceapi.com';

const randomNonce = () => crypto.randomBytes(16).toString('hex'); // 32 caractères

// Format imposé par Binance : timestamp + "\n" + nonce + "\n" + body + "\n"
const sign = (timestamp, nonce, bodyStr, secretKey) =>
  crypto.createHmac('sha512', secretKey).update(`${timestamp}\n${nonce}\n${bodyStr}\n`).digest('hex').toUpperCase();

// ─── Initier un paiement ────────────────────────────────────────────────────
const initiate = async ({ transaction, provider, apiKeys }) => {
  const timestamp = Date.now().toString();
  const nonce = randomNonce();

  const body = {
    env: { terminalType: 'WEB' },
    merchantTradeNo: transaction.internalRef,
    orderAmount: transaction.amountInProviderCurrency || transaction.amountCharged,
    currency: transaction.currency || 'USDT',
    goods: {
      goodsType: '02',
      goodsCategory: 'Z000',
      referenceGoodsId: transaction.internalRef,
      goodsName: 'Recharge solde MobileUnlockStore',
    },
    returnUrl: provider.config.returnUrl,
    cancelUrl: provider.config.cancelUrl,
  };
  const bodyStr = JSON.stringify(body);

  const { data } = await axios.post(`${BASE_URL}/binancepay/openapi/v3/order`, bodyStr, {
    headers: {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': apiKeys.key1, // API Key
      'BinancePay-Signature': sign(timestamp, nonce, bodyStr, apiKeys.key2), // Secret Key
    },
    timeout: 30000,
  });

  if (data.status !== 'SUCCESS') {
    throw new Error(data.errorMessage || 'Erreur Binance Pay lors de la création de la commande.');
  }

  return {
    paymentUrl:      data.data?.checkoutUrl,
    providerRef:     data.data?.prepayId,
    providerOrderId: transaction.internalRef, // Binance nous renvoie merchantTradeNo dans le webhook
    raw:             data,
  };
};

// ─── Vérifier le statut manuellement ────────────────────────────────────────
// ⚠️ Endpoint non re-confirmé par une source primaire dans cette session
// (connexions bloquées vers developers.binance.com) — Binance Pay repose
// principalement sur le webhook ; cette fonction est un filet de sécurité
// pour le polling manuel et doit être vérifiée avant usage en production.
const checkStatus = async ({ transaction, apiKeys }) => {
  const timestamp = Date.now().toString();
  const nonce = randomNonce();
  const body = { merchantTradeNo: transaction.internalRef };
  const bodyStr = JSON.stringify(body);

  const { data } = await axios.post(`${BASE_URL}/binancepay/openapi/v2/order/query`, bodyStr, {
    headers: {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': apiKeys.key1,
      'BinancePay-Signature': sign(timestamp, nonce, bodyStr, apiKeys.key2),
    },
    timeout: 15000,
  });

  const bizStatus = data.data?.status;
  const status = bizStatus === 'PAID' ? 'completed' : bizStatus === 'CANCELED' || bizStatus === 'ERROR' ? 'failed' : 'pending';
  return { status, raw: data };
};

// ─── Vérifier un webhook entrant ────────────────────────────────────────────
const verifyWebhook = ({ rawBody, headers, apiKeys }) => {
  const timestamp = headers['binancepay-timestamp'];
  const nonce      = headers['binancepay-nonce'];
  const signature  = headers['binancepay-signature'];
  if (!timestamp || !nonce || !signature || !rawBody) return { valid: false };

  const expected = sign(timestamp, nonce, rawBody, apiKeys.key2);
  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    valid = false;
  }
  if (!valid) return { valid: false };

  let payload;
  try { payload = JSON.parse(rawBody); } catch { return { valid: false }; }

  let data = payload.data;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = {}; }
  }

  const status = payload.bizStatus === 'PAY_SUCCESS' ? 'completed' : 'failed';
  return { valid: true, internalRef: data?.merchantTradeNo, status, raw: payload };
};

// Réponse d'accusé de réception attendue par Binance Pay
const ACK_RESPONSE = { returnCode: 'SUCCESS', returnMessage: null };

module.exports = { initiate, checkStatus, verifyWebhook, ACK_RESPONSE };

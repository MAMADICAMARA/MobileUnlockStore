// back/services/providerService.js
// Moteur d'exécution automatique — envoie une commande à l'API du fournisseur
// configuré par l'admin, et gère les résultats/échecs/retries.
const axios = require('axios');
const Order      = require('../models/Order');
const User        = require('../models/User');
const Notification = require('../models/Notification');
const { decrypt } = require('../utils/encryption');

// ─── Notifier tous les comptes admin ───────────────────────────────────────
// Chaque admin reçoit la notification sur son propre compte (cohérent avec
// la cloche NotificationBell existante, qui interroge /api/notifications/me).
const notifyAllAdmins = async ({ title, message, type = 'info' }) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(a =>
      Notification.create({ userId: a._id, title, message, type }).catch(() => {})
    ));
  } catch (err) {
    console.warn('⚠️ Notification admin non envoyée:', err.message);
  }
};

const notifyUser = async ({ userId, title, message, type = 'info' }) => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (err) {
    console.warn('⚠️ Notification client non envoyée:', err.message);
  }
};

// ─── Construction des headers d'authentification ───────────────────────────
const buildAuthHeaders = (provider, apiKey) => {
  const { authType, authHeader } = provider.apiConfig;
  if (authType === 'bearer') {
    return { Authorization: `Bearer ${apiKey}` };
  }
  if (authType === 'basic') {
    return { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` };
  }
  // api_key
  return { [authHeader || 'X-API-Key']: apiKey };
};

// ─── Construction du corps de la requête via fieldMapping ──────────────────
const buildRequestBody = (order, provider, providerServiceCode) => {
  const sourceData = {
    ...(order.userSubmittedData instanceof Map
      ? Object.fromEntries(order.userSubmittedData)
      : (order.userSubmittedData || {})),
    service_code: providerServiceCode,
  };

  const body = {};
  for (const mapping of provider.fieldMapping || []) {
    const value = sourceData[mapping.siteField];
    if (value !== undefined && value !== null && value !== '') {
      body[mapping.providerField] = value;
    } else if (mapping.defaultValue) {
      body[mapping.providerField] = mapping.defaultValue;
    } else if (mapping.required) {
      throw new Error(`Champ requis manquant pour le fournisseur: ${mapping.siteField}`);
    }
  }
  return body;
};

// ─── Traduction statut fournisseur → statut du site ────────────────────────
const mapProviderStatus = (provider, providerStatus) => {
  const match = (provider.statusMapping || []).find(
    m => m.providerStatus?.toLowerCase() === String(providerStatus || '').toLowerCase()
  );
  return match ? match.siteStatus : 'En cours';
};

// ─── Rembourser et clôturer une commande définitivement échouée ────────────
const handleFinalFailure = async (order, provider) => {
  order.status = 'Échoué';

  if (provider?.retryConfig?.autoRefundOnFailure) {
    try {
      const user = await User.findById(order.userId);
      if (user) {
        user.balance += order.amount;
        await user.save();
        order.status = 'Remboursé';
        await notifyUser({
          userId: order.userId,
          title: '💸 Commande remboursée',
          message: `Votre commande "${order.serviceDetails?.name || 'Service'}" a échoué chez le fournisseur. Vous avez été remboursé automatiquement.`,
          type: 'warning',
        });
      }
    } catch (err) {
      console.error('[PROVIDER] Erreur remboursement automatique:', err.message);
    }
  } else {
    await notifyUser({
      userId: order.userId,
      title: '❌ Commande échouée',
      message: `Votre commande "${order.serviceDetails?.name || 'Service'}" n'a pas pu être traitée. Contactez le support.`,
      type: 'error',
    });
  }

  await notifyAllAdmins({
    title: '⚠️ Commande échouée définitivement',
    message: `La commande #${order._id} (${order.serviceDetails?.name || 'Service'}) a échoué chez ${provider?.name || 'le fournisseur'} après ${order.retryCount} tentative(s).`,
    type: 'error',
  });

  await order.save();
};

// ─── Envoi d'une commande au fournisseur ───────────────────────────────────
const sendOrderToProvider = async (order, providerServiceLink) => {
  const provider = providerServiceLink.providerId?.apiConfig
    ? providerServiceLink.providerId
    : await require('../models/Provider').findById(providerServiceLink.providerId);

  if (!provider) {
    console.error('[PROVIDER] Fournisseur introuvable pour la commande', order._id);
    return;
  }

  try {
    const apiKey = decrypt(provider.apiConfig.apiKey);
    const body = buildRequestBody(order, provider, providerServiceLink.providerServiceCode);
    const headers = buildAuthHeaders(provider, apiKey);
    const url = `${provider.apiConfig.baseUrl}${provider.apiConfig.orderEndpoint}`;

    const response = provider.apiConfig.httpMethod === 'GET'
      ? await axios.get(url, { headers, params: body, timeout: 30000 })
      : await axios.post(url, body, { headers, timeout: 30000 });

    const { orderIdField, statusField } = provider.trackingConfig;
    const data = response.data || {};

    order.providerId        = provider._id;
    order.providerOrderId   = data[orderIdField] ?? null;
    order.providerResponse  = data;
    order.providerStatus    = data[statusField] ?? null;
    order.providerError     = null;
    order.sentToProviderAt  = new Date();
    order.status            = 'En cours';

    if (provider.trackingConfig.mode !== 'webhook') {
      order.nextRetryAt = new Date(
        Date.now() + (provider.trackingConfig.pollingIntervalMinutes || 15) * 60 * 1000
      );
    }

    await order.save();

    await notifyAllAdmins({
      title: '📤 Commande envoyée au fournisseur',
      message: `Commande #${order._id} (${order.serviceDetails?.name || 'Service'}) envoyée à ${provider.name}.`,
      type: 'info',
    });

  } catch (err) {
    const maxRetries   = provider.retryConfig?.maxRetries ?? 3;
    const retryDelays  = provider.retryConfig?.retryDelays?.length ? provider.retryConfig.retryDelays : [60, 300, 900];

    order.retryCount    = (order.retryCount || 0) + 1;
    order.providerError = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    order.lastRetryAt   = new Date();

    if (order.retryCount >= maxRetries) {
      await handleFinalFailure(order, provider);
    } else {
      const delaySeconds = retryDelays[Math.min(order.retryCount - 1, retryDelays.length - 1)];
      order.nextRetryAt = new Date(Date.now() + delaySeconds * 1000);
      await order.save();
      console.warn(`[PROVIDER] Échec envoi commande ${order._id}, tentative ${order.retryCount}/${maxRetries}: ${err.message}`);
    }
  }
};

// ─── Mise à jour d'une commande à partir d'une réponse fournisseur ─────────
// Utilisé à la fois par le webhook et par le polling.
const updateOrderFromProviderResponse = async (order, provider, providerStatus, result) => {
  const siteStatus = mapProviderStatus(provider, providerStatus);

  order.providerStatus = providerStatus ?? order.providerStatus;
  order.status = siteStatus;

  if (result) {
    if (!(order.deliveryData instanceof Map)) {
      order.deliveryData = new Map(Object.entries(order.deliveryData || {}));
    }
    order.deliveryData.set('unlockCode', result);
  }

  if (siteStatus === 'Terminé') {
    order.completedAt = order.completedAt || new Date();
    await order.save();

    await notifyUser({
      userId: order.userId,
      title: '✅ Votre déblocage est prêt !',
      message: `Votre commande "${order.serviceDetails?.name || 'Service'}" est terminée${result ? ` — code: ${result}` : ''}.`,
      type: 'success',
    });
    await notifyAllAdmins({
      title: '✅ Commande terminée',
      message: `Commande #${order._id} terminée par ${provider.name} — résultat livré au client.`,
      type: 'success',
    });
  } else if (['Échoué', 'Rejeté'].includes(siteStatus)) {
    await notifyAllAdmins({
      title: '❌ Commande rejetée par le fournisseur',
      message: `Commande #${order._id} : statut "${providerStatus}" reçu de ${provider.name}.`,
      type: 'error',
    });
    if (provider.retryConfig?.autoRefundOnFailure) {
      await handleFinalFailure(order, provider);
    } else {
      await order.save();
      await notifyUser({
        userId: order.userId,
        title: '❌ Commande échouée',
        message: `Votre commande "${order.serviceDetails?.name || 'Service'}" a échoué.`,
        type: 'error',
      });
    }
  } else {
    await order.save();
  }
};

module.exports = {
  sendOrderToProvider,
  handleFinalFailure,
  updateOrderFromProviderResponse,
  mapProviderStatus,
  buildAuthHeaders,
  notifyAllAdmins,
  notifyUser,
};

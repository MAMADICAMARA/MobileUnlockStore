// back/services/pollingService.js
// Vérifie régulièrement le statut des commandes envoyées aux fournisseurs
// dont le mode de suivi est "polling" (ou "both").
const axios = require('axios');
const Order = require('../models/Order');
const { decrypt } = require('../utils/encryption');
const { updateOrderFromProviderResponse, buildAuthHeaders } = require('./providerService');

const startPolling = () => {
  const intervalMs = parseInt(process.env.POLLING_INTERVAL_MS) || 300000;

  setInterval(async () => {
    let orders;
    try {
      orders = await Order.find({
        providerId: { $exists: true, $ne: null },
        status: 'En cours',
        nextRetryAt: { $lte: new Date() },
      }).populate('providerId');
    } catch (err) {
      console.error('[POLLING] Erreur récupération des commandes:', err.message);
      return;
    }

    for (const order of orders) {
      try {
        const provider = order.providerId;
        if (!provider || provider.trackingConfig.mode === 'webhook') continue;
        if (!order.providerOrderId || !provider.apiConfig.statusEndpoint) continue;

        const apiKey = decrypt(provider.apiConfig.apiKey);
        const url = provider.apiConfig.baseUrl
          + provider.apiConfig.statusEndpoint.replace('{order_id}', order.providerOrderId);

        const response = await axios.get(url, {
          headers: buildAuthHeaders(provider, apiKey),
          timeout: 15000,
        });

        const providerStatus = response.data?.[provider.trackingConfig.statusField];
        const result          = response.data?.[provider.trackingConfig.resultField];

        await updateOrderFromProviderResponse(order, provider, providerStatus, result);

        if (order.status === 'En cours') {
          order.nextRetryAt = new Date(Date.now() + (provider.trackingConfig.pollingIntervalMinutes || 15) * 60 * 1000);
          await order.save();
        }
      } catch (err) {
        console.error(`[POLLING] Erreur commande ${order._id}:`, err.message);
      }
    }
  }, intervalMs);

  console.log(`✅ Service de polling démarré (intervalle: ${intervalMs}ms)`);
};

module.exports = { startPolling };

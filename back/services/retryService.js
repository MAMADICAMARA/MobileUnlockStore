// back/services/retryService.js
// Relance automatiquement les commandes dont l'envoi au fournisseur a échoué,
// jusqu'à épuisement du nombre de tentatives (géré dans sendOrderToProvider).
const Order           = require('../models/Order');
const ProviderService = require('../models/ProviderService');
const { sendOrderToProvider } = require('./providerService');

const startRetryService = () => {
  const intervalMs = parseInt(process.env.RETRY_CHECK_INTERVAL_MS) || 60000;

  setInterval(async () => {
    let orders;
    try {
      orders = await Order.find({
        // ⚠️ providerError est remis à null en cas de succès : on filtre sur $ne: null
        // (et non $exists: true) pour ne pas re-tenter des commandes déjà réussies.
        providerError: { $ne: null },
        status: { $nin: ['Terminé', 'Remboursé', 'Échoué', 'Rejeté', 'Annulé'] },
        nextRetryAt: { $lte: new Date() },
      });
    } catch (err) {
      console.error('[RETRY] Erreur récupération des commandes:', err.message);
      return;
    }

    for (const order of orders) {
      try {
        const link = await ProviderService.findOne({ serviceId: order.serviceId, isActive: true }).populate('providerId');
        if (!link || !link.providerId?.isActive) continue;

        console.log(`[RETRY] Nouvelle tentative commande ${order._id}`);
        await sendOrderToProvider(order, link);
      } catch (err) {
        console.error(`[RETRY] Erreur commande ${order._id}:`, err.message);
      }
    }
  }, intervalMs);

  console.log(`✅ Service de retry démarré (intervalle: ${intervalMs}ms)`);
};

module.exports = { startRetryService };

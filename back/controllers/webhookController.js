// back/controllers/webhookController.js
// Reçoit les callbacks des fournisseurs — endpoint PUBLIC (pas de JWT),
// sécurisé par vérification de signature HMAC (voir verifyWebhookSignature).
const crypto = require('crypto');
const Provider = require('../models/Provider');
const Order    = require('../models/Order');
const { updateOrderFromProviderResponse } = require('../services/providerService');

const verifyWebhookSignature = (body, receivedSignature, secret) => {
  if (!receivedSignature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSignature));
  } catch {
    return false; // longueurs différentes → signature invalide
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const { providerSlug } = req.params;

    // 1. Identifier le fournisseur
    const provider = await Provider.findOne({ slug: providerSlug });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });
    }

    // 2. Vérifier la signature du webhook
    const receivedSignature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
    if (provider.trackingConfig.webhookSecret) {
      const valid = verifyWebhookSignature(req.body, receivedSignature, provider.trackingConfig.webhookSecret);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Signature invalide' });
      }
    }

    // 3. Extraire les données
    const { orderIdField, statusField, resultField } = provider.trackingConfig;
    const providerOrderId = req.body[orderIdField];
    const providerStatus  = req.body[statusField];
    const result           = req.body[resultField];

    if (!providerOrderId) {
      return res.status(400).json({ success: false, message: 'ID de commande fournisseur manquant' });
    }

    // 4. Trouver la commande correspondante
    const order = await Order.findOne({ providerOrderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    // 5-7. Mapper le statut, mettre à jour la commande, notifier
    await updateOrderFromProviderResponse(order, provider, providerStatus, result);

    // 8. Toujours répondre rapidement
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur webhook fournisseur:', error);
    res.status(200).json({ success: false, message: 'Erreur de traitement (déjà accusée réception)' });
  }
};

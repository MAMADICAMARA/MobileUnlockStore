// back/controllers/paymentWebhookController.js
// Reçoit les callbacks des providers de paiement — endpoint PUBLIC (pas de
// JWT), sécurisé par la vérification propre à chaque provider (voir
// back/services/payment/*.js verifyWebhook()).
const PaymentProvider = require('../models/PaymentProvider');
const { decryptApiKeys, confirmAndCredit } = require('../utils/paymentHelpers');
const { getPaymentService } = require('../services/payment');

exports.handleWebhook = async (req, res) => {
  try {
    const { providerSlug } = req.params;
    const provider = await PaymentProvider.findOne({ slug: providerSlug });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider non trouvé.' });

    const apiKeys = decryptApiKeys(provider);
    const service = getPaymentService(providerSlug);

    const result = await service.verifyWebhook({
      body: req.body,
      rawBody: req.rawBody ? req.rawBody.toString('utf8') : undefined,
      headers: req.headers,
      provider,
      apiKeys,
    });

    if (!result.valid) {
      return res.status(401).json({ success: false, message: 'Signature invalide.' });
    }

    // Certains événements (ex: Stripe autres que checkout.session.completed)
    // sont valides mais n'ont rien à créditer — on accuse juste réception.
    if (result.status === 'ignored' || !result.internalRef) {
      return res.status(200).json(providerSlug === 'binancepay' ? service.ACK_RESPONSE : { success: true });
    }

    await confirmAndCredit({
      internalRef: result.internalRef,
      providerStatus: result.status,
      rawResponse: result.raw,
    });

    // Toujours répondre rapidement — format d'accusé spécifique pour Binance Pay.
    res.status(200).json(providerSlug === 'binancepay' ? service.ACK_RESPONSE : { success: true });
  } catch (error) {
    console.error('Erreur webhook paiement:', error.message);
    // On accuse quand même réception pour éviter des re-livraisons en boucle
    // côté provider ; l'erreur est loguée pour investigation manuelle.
    res.status(200).json({ success: false, message: 'Erreur de traitement (déjà accusée réception).' });
  }
};

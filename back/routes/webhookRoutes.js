// back/routes/webhookRoutes.js
// Endpoint PUBLIC — les fournisseurs appellent ce endpoint pour livrer un résultat.
// Sécurité assurée par vérification de signature HMAC (voir webhookController.js),
// pas par JWT puisque l'appelant est un système externe.
const express = require('express');
const router  = express.Router();
const { handleWebhook } = require('../controllers/webhookController');

router.post('/:providerSlug', handleWebhook);

module.exports = router;

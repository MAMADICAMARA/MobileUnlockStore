// back/routes/providerRoutes.js
// Gestion des fournisseurs API — toutes les routes sont protégées admin.
// (Le webhook public vit séparément dans webhookRoutes.js)
const express = require('express');
const router  = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const providerController = require('../controllers/providerController');

// ─── Fournisseurs ───────────────────────────────────────────────────────────
router.get('/providers',           protect, admin, providerController.getAllProviders);
router.post('/providers',          protect, admin, providerController.createProvider);
router.get('/providers/:id',       protect, admin, providerController.getProviderById);
router.put('/providers/:id',       protect, admin, providerController.updateProvider);
router.delete('/providers/:id',    protect, admin, providerController.deleteProvider);
router.post('/providers/:id/test', protect, admin, providerController.testProviderConnection);

// ─── Associations service ↔ fournisseur ────────────────────────────────────
router.get('/provider-services',        protect, admin, providerController.getAllProviderServices);
router.post('/provider-services',       protect, admin, providerController.createProviderService);
router.put('/provider-services/:id',    protect, admin, providerController.updateProviderService);
router.delete('/provider-services/:id', protect, admin, providerController.deleteProviderService);

// ─── Tableau de bord ────────────────────────────────────────────────────────
router.get('/provider-orders',              protect, admin, providerController.getProviderOrders);
router.post('/provider-orders/:id/retry',   protect, admin, providerController.retryProviderOrder);
router.post('/provider-orders/:id/refund',  protect, admin, providerController.refundProviderOrder);

module.exports = router;

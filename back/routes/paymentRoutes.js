// back/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  addPayment, getMyPayments,
  getAllProviders, getSettings, initiatePayment, verifyPaymentStatus, getMyTransactions,
} = require('../controllers/paymentController');
const {
  getProviderById, updateProvider, toggleProvider, testProviderConnection,
  updateSettings, getAllTransactions, getTransactionById,
} = require('../controllers/paymentProviderController');
const { handleWebhook } = require('../controllers/paymentWebhookController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/payments
// @desc    Ajouter un paiement (ancien flux — conservé tel quel)
router.post('/', protect, addPayment);

// @route   GET /api/payments/my-payments
// @desc    Lister les paiements de l'utilisateur (ancien flux — conservé tel quel)
router.get('/my-payments', protect, getMyPayments);

// ─── Paramètres généraux (interrupteur global + frais) ─────────────────────
router.get('/settings', getSettings); // public — le client doit savoir si l'auto-paiement est actif
router.put('/settings', protect, admin, updateSettings);

// ─── Providers de paiement ──────────────────────────────────────────────────
router.get('/providers',            protect, getAllProviders); // client : actifs seulement / admin : tous
router.get('/providers/:id',        protect, admin, getProviderById);
router.put('/providers/:id',        protect, admin, updateProvider);
router.patch('/providers/:id/toggle', protect, admin, toggleProvider);
router.post('/providers/:id/test',  protect, admin, testProviderConnection);

// ─── Paiement client ────────────────────────────────────────────────────────
router.post('/initiate',                  protect, initiatePayment);
router.get('/status/:transactionId',      protect, verifyPaymentStatus);
router.get('/my-transactions',            protect, getMyTransactions);

// ─── Historique admin ───────────────────────────────────────────────────────
router.get('/transactions',      protect, admin, getAllTransactions);
router.get('/transactions/:id',  protect, admin, getTransactionById);

// ─── Webhooks — PUBLIC, sécurisé par signature propre à chaque provider ────
router.post('/webhook/:providerSlug', handleWebhook);

module.exports = router;

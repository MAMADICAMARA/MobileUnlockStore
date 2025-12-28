// back/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { addPayment, getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/payments
// @desc    Ajouter un paiement
router.post('/', protect, addPayment);

// @route   GET /api/payments/my-payments
// @desc    Lister les paiements de l'utilisateur
router.get('/my-payments', protect, getMyPayments);

module.exports = router;

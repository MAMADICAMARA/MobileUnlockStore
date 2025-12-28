// back/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/support/tickets
// @desc    Créer un ticket
router.post('/tickets', protect, createTicket);

// @route   GET /api/support/tickets
// @desc    Lister les tickets de l'utilisateur
router.get('/tickets', protect, getMyTickets);

module.exports = router;

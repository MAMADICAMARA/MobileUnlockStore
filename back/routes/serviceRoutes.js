// back/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { getServices } = require('../controllers/serviceController');

/**
 * @route   GET /api/services
 * @desc    Récupérer la liste de tous les services disponibles
 * @access  Public
 */
router.get('/', getServices);

module.exports = router;

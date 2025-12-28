// back/routes/licenseRoutes.js
const express = require('express');
const router = express.Router();
const { getMyLicenses } = require('../controllers/licenseController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/licenses/my-licenses
// @desc    Lister les licences de l'utilisateur
router.get('/my-licenses', protect, getMyLicenses);

module.exports = router;

// back/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/userController');
const { getProfile } = require('../controllers/authController'); // Importer le contrôleur de profil
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
// @desc    Récupérer le profil de l'utilisateur connecté
router.get('/api/auth/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Mettre à jour le profil utilisateur
router.put('/profile', protect, updateProfile);

// @route   PUT /api/users/change-password
// @desc    Changer le mot de passe utilisateur
router.put('/change-password', protect, changePassword);

module.exports = router;

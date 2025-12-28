const express = require('express');
const router = express.Router();
const {
  register,
  verifySignupCode,
  login,
  verifyOtp,
  resendOtp,
  getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Inscrire un nouvel utilisateur
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/verify-signup-code
 * @desc    Vérifier le code d'inscription
 */
router.post('/verify-signup-code', verifySignupCode);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion étape 1 (envoi OTP)
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Connexion étape 2 (vérification OTP)
 */
router.post('/verify-otp', verifyOtp);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Renvoyer un OTP
 */
router.post('/resend-otp', resendOtp);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtenir le profil de l'utilisateur authentifié
 */
router.get('/profile', protect, getProfile);

module.exports = router;

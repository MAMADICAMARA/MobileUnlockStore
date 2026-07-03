
// back/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  getProfile,
  setup2FA,
  enable2FA,
  disable2FA,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ─── Authentification ─────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ─── Profil ───────────────────────────────────────────────────────────────────
router.get('/profile', protect, getProfile);

// ─── 2FA TOTP ─────────────────────────────────────────────────────────────────
router.post('/2fa/setup',   protect, setup2FA);
router.post('/2fa/enable',  protect, enable2FA);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const {
//   register,
//   verifySignupCode,
//   login,
//   verifyOtp,
//   resendOtp,
//   getProfile
// } = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware');

// /**
//  * @route   POST /api/auth/register
//  * @desc    Inscrire un nouvel utilisateur
//  */
// router.post('/register', register);

// /**
//  * @route   POST /api/auth/verify-signup-code
//  * @desc    Vérifier le code d'inscription
//  */
// router.post('/verify-signup-code', verifySignupCode);

// /**
//  * @route   POST /api/auth/login
//  * @desc    Connexion étape 1 (envoi OTP)
//  */
// router.post('/login', login);

// /**
//  * @route   POST /api/auth/verify-otp
//  * @desc    Connexion étape 2 (vérification OTP)
//  */
// router.post('/verify-otp', verifyOtp);

// /**
//  * @route   POST /api/auth/resend-otp
//  * @desc    Renvoyer un OTP
//  */
// router.post('/resend-otp', resendOtp);
// router.post('/2fa/setup',   protect, setup2FA);    // Générer QR code
// router.post('/2fa/enable',  protect, enable2FA);   // Activer après scan
// router.post('/2fa/disable', protect, disable2FA);  // Désactiver
 
// /**
//  * @route   GET /api/auth/profile
//  * @desc    Obtenir le profil de l'utilisateur authentifié
//  */
// router.get('/profile', protect, getProfile);

// module.exports = router;

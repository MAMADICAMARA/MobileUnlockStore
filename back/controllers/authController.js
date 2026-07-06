// back/controllers/authController.js
const User     = require('../models/User');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { generateSecret, generateURI, verify } = require('otplib');
const QRCode  = require('qrcode');

// Tolérance de 30s (±1 pas de temps) pour absorber le décalage d'horloge entre
// le serveur et l'appareil de l'utilisateur — équivalent à l'ancien `window: 1`.
const TOTP_EPOCH_TOLERANCE = 30;

// ─── Générer le token JWT ─────────────────────────────────────────────────────
const generateToken = (id, role, email, name, isMaintenanceAllowed) => {
  return jwt.sign(
    { id, _id: id, role, email, name, isMaintenanceAllowed },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const user = await User.create({ name, email, password, role: 'client' });

    const token = generateToken(user._id, user.role, user.email, user.name, user.isMaintenanceAllowed);

    res.status(201).json({
      token,
      _id:                 user._id,
      name:                user.name,
      email:               user.email,
      role:                user.role,
      balance:             user.balance,
      isMaintenanceAllowed: user.isMaintenanceAllowed,
      twoFactorEnabled:    user.twoFactorEnabled,
    });
  } catch (error) {
    console.error('Erreur register:', error.message);
    res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    // Sélectionner twoFactorSecret explicitement (select: false dans le schéma)
    const user = await User.findOne({ email })
      .select('+password +twoFactorSecret');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Votre compte est désactivé. Contactez l\'administrateur.' });
    }

    // ✅ Si 2FA activé — vérifier le code TOTP
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        // Signaler au frontend qu'il doit demander le code 2FA
        return res.status(200).json({ twoFactorRequired: true });
      }

      const { valid } = await verify({
        token:          twoFactorCode,
        secret:         user.twoFactorSecret,
        epochTolerance: TOTP_EPOCH_TOLERANCE,
      });

      if (!valid) {
        return res.status(401).json({ message: 'Code 2FA invalide ou expiré.' });
      }
    }

    const token = generateToken(user._id, user.role, user.email, user.name, user.isMaintenanceAllowed);

    console.log(`✅ Login: ${user.email} (${user.role})`);

    res.json({
      token,
      _id:                  user._id,
      name:                 user.name,
      email:                user.email,
      role:                 user.role,
      balance:              user.balance,
      isMaintenanceAllowed: user.isMaintenanceAllowed,
      twoFactorEnabled:     user.twoFactorEnabled,
    });
  } catch (error) {
    console.error('Erreur login:', error.message);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id)
      .select('name email role balance isActive isMaintenanceAllowed twoFactorEnabled createdAt');

    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur getProfile:', error.message);
    res.status(500).json({ success: false, message: 'Erreur profil' });
  }
};

// ─── 2FA : GÉNÉRER LE SECRET + QR CODE ───────────────────────────────────────
const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user   = await User.findById(userId).select('+twoFactorSecret');

    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA déjà activé sur ce compte.' });
    }

    // Générer un secret base32 compatible Google Authenticator
    const secret  = generateSecret();
    const otpauth = generateURI({ issuer: 'MobileUnlockStore', label: user.email, secret });

    // Sauvegarder le secret (non encore activé)
    user.twoFactorSecret  = secret;
    user.twoFactorEnabled = false;
    await user.save();

    // Générer le QR code en base64
    const qrCodeDataURL = await QRCode.toDataURL(otpauth);

    res.json({
      success: true,
      qrCode:  qrCodeDataURL,
      secret,  // affiché pour saisie manuelle si le QR ne fonctionne pas
    });
  } catch (error) {
    console.error('Erreur setup2FA:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la configuration 2FA.' });
  }
};

// ─── 2FA : ACTIVER (après scan du QR code) ───────────────────────────────────
const enable2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const userId   = req.user.id || req.user._id;

    if (!code) return res.status(400).json({ success: false, message: 'Code requis.' });

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    if (!user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Lancez d\'abord la configuration 2FA.' });
    }

    // Vérifier que le code correspond bien au secret
    const { valid } = await verify({
      token:          String(code),
      secret:         user.twoFactorSecret,
      epochTolerance: TOTP_EPOCH_TOLERANCE,
    });

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Code invalide. Vérifiez votre application.' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    console.log(`🔐 2FA activé pour ${user.email}`);

    res.json({ success: true, message: '2FA activé avec succès.' });
  } catch (error) {
    console.error('Erreur enable2FA:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'activation 2FA.' });
  }
};

// ─── 2FA : DÉSACTIVER ────────────────────────────────────────────────────────
const disable2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const userId   = req.user.id || req.user._id;

    if (!code) return res.status(400).json({ success: false, message: 'Code requis pour désactiver le 2FA.' });

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    const { valid } = await verify({
      token:          String(code),
      secret:         user.twoFactorSecret,
      epochTolerance: TOTP_EPOCH_TOLERANCE,
    });

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Code invalide.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret  = undefined;
    await user.save();

    console.log(`🔓 2FA désactivé pour ${user.email}`);

    res.json({ success: true, message: '2FA désactivé.' });
  } catch (error) {
    console.error('Erreur disable2FA:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la désactivation 2FA.' });
  }
};

module.exports = { register, login, getProfile, setup2FA, enable2FA, disable2FA };
// // back/controllers/authController.js
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const sendEmail = require('../utils/sendEmail');

// // Le JWT contient uniquement les données d'identité et d'autorisation.
// // Le solde (balance) est exclu : il change après chaque transaction et serait
// // obsolète dès la première commande. Le frontend le lit toujours depuis l'API.
// const generateToken = (id, role, email, name, isMaintenanceAllowed) => {
//   const payload = { id, _id: id, role, email, name, isMaintenanceAllowed };
//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
// };

// const generateOtp = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // ---------------- REGISTER ----------------
// const register = async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     if (!name || !email || !password) {
//       return res.status(400).json({ status: 'error', message: 'Veuillez fournir un nom, email et mot de passe.' });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ status: 'error', message: 'Cet email est déjà utilisé.' });
//     }

//     // ────────────────────────────── OTP / EMAIL EN PAUSE ──────────────────────────────
//     // const code = generateOtp();
//     // ────────────────────────────────────────────────────────────────────────────────

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: 'client',
//       balance: 0,
//       // signupCode: code,                    // ← COMMENTÉ
//       // signupCodeExpires: Date.now() + 5 * 60 * 1000,  // ← COMMENTÉ
//       isActive: true                             // ← forcé à true pour bypass vérif email temporairement
//       // isActive: false                    // ← ancienne valeur
//     });

//     // ────────────────────────────── OTP / EMAIL EN PAUSE ──────────────────────────────
//     /*
//     try {
//       await sendEmail(
//         user.email,
//         "Code de confirmation d'inscription",
//         `Bonjour ${user.name},\nVotre code est : ${code}\nIl expire dans 5 minutes.`
//       );
//       console.log("Email d'inscription envoyé à:", user.email, "Code:", code);
//     } catch (mailErr) {
//       console.error("Erreur envoi email inscription:", mailErr);
//     }
//     */
//     // ────────────────────────────────────────────────────────────────────────────────

//     res.status(201).json({ 
//       status: 'success', 
//       message: 'Inscription réussie.'   // ← message adapté (plus de code à envoyer)
//       // message: 'Code d\'inscription envoyé à votre email.'
//     });
//   } catch (error) {
//     console.error("Erreur register:", error);
//     res.status(500).json({ status: 'error', message: 'Erreur serveur lors de l\'inscription.' });
//   }
// };

// // ---------------- VERIFY SIGNUP CODE ----------------
// const verifySignupCode = async (req, res) => {
//   // Fonction mise en pause temporairement
//   res.status(200).json({ 
//     status: 'info', 
//     message: 'Vérification par code temporairement désactivée (inscription directe).' 
//   });

//   /*
//   const { email, code } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || user.signupCode !== code || user.signupCodeExpires < Date.now()) {
//       return res.status(400).json({ status: 'error', message: 'Code invalide ou expiré.' });
//     }
//     user.isActive = true;
//     user.signupCode = undefined;
//     user.signupCodeExpires = undefined;
//     await user.save();
//     res.status(200).json({ status: 'success', message: 'Inscription confirmée.' });
//   } catch (error) {
//     console.error("verifySignupCode error:", error);
//     res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
//   }
//   */
// };

// // ---------------- LOGIN ----------------
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect.' });
//     }

//     if (typeof user.matchPassword !== 'function') {
//       return res.status(500).json({ status: 'error', message: 'Erreur serveur: méthode de validation de mot de passe indisponible.' });
//     }

//     const passwordMatch = await user.matchPassword(password);
//     if (!passwordMatch) {
//       return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect.' });
//     }

//     // ✅ BLOCAGE CIBLÉ — empêcher la connexion d'un compte suspendu par un admin
//     // (re-vérifié aussi dans authMiddleware.protect pour les requêtes déjà connectées)
//     if (user.isActive === false) {
//       return res.status(403).json({
//         status: 'error',
//         code: 'ACCOUNT_BLOCKED',
//         message: 'Votre compte a été suspendu par l\'administrateur. Veuillez contacter le support pour plus d\'informations.',
//       });
//     }

//     // ────────────────────────────── OTP / EMAIL EN PAUSE ──────────────────────────────
//     /*
//     const useOtp = process.env.ENABLE_LOGIN_OTP !== 'false';

//     if (useOtp) {
//       if (user.otpCode && user.otpExpires && user.otpExpires > Date.now()) {
//         return res.status(200).json({
//           status: 'otp_sent',
//           message: 'Un code a déjà été envoyé à cet email. Vérifiez votre boîte de réception.'
//         });
//       }

//       const otp = generateOtp();
//       user.otpCode = otp;
//       user.otpExpires = Date.now() + 5 * 60 * 1000;
//       await user.save();

//       try {
//         await sendEmail(
//           user.email,
//           "Code OTP de connexion",
//           `Bonjour ${user.name},\nVotre code de connexion est : ${otp}\nIl expire dans 5 minutes.`
//         );
//         console.log("Email OTP envoyé à:", user.email, "Code:", otp);
//       } catch (mailErr) {
//         console.error("Erreur envoi email OTP:", mailErr);
//       }

//       return res.status(200).json({
//         status: 'otp_sent',
//         message: 'Le code a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.'
//       });
//     }
//     */
//     // ────────────────────────────────────────────────────────────────────────────────

//     const token = generateToken(user._id, user.role, user.email, user.name, user.isMaintenanceAllowed);
//     return res.status(200).json({
//       status: 'success',
//       message: 'Connexion réussie.',
//       token,
//       // Le balance est envoyé dans le body de la réponse (pas dans le JWT)
//       // → le frontend le stocke dans localStorage et l'affiche immédiatement
//       user: {
//         _id:                 user._id,
//         name:                user.name,
//         email:               user.email,
//         role:                user.role,
//         balance:             user.balance,
//         isMaintenanceAllowed: user.isMaintenanceAllowed,
//       },
//     });
//   } catch (error) {
//     console.error("login error:", error);
//     res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la connexion.' });
//   }
// };

// // ---------------- VERIFY OTP ----------------
// const verifyOtp = async (req, res) => {
//   // Fonction mise en pause temporairement
//   res.status(200).json({ 
//     status: 'info', 
//     message: 'Vérification OTP temporairement désactivée.' 
//   });

//   /*
//   const { email, otp } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ status: 'error', message: 'OTP invalide ou expiré.' });
//     }
//     user.otpCode = undefined;
//     user.otpExpires = undefined;
//     await user.save();
//     const token = generateToken(user._id, user.role, user.email, user.name, user.balance);
//     res.status(200).json({ status: 'success', message: 'Connexion réussie.', token });
//   } catch (error) {
//     console.error("verifyOtp error:", error);
//     res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
//   }
//   */
// };

// // ---------------- RESEND OTP ----------------
// const resendOtp = async (req, res) => {
//   // Fonction mise en pause temporairement
//   res.status(200).json({ 
//     status: 'info', 
//     message: 'Renvoi OTP temporairement désactivé.' 
//   });

//   /*
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });

//     const otp = generateOtp();
//     user.otpCode = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     try {
//       await sendEmail(
//         user.email,
//         "Nouveau code OTP",
//         `Votre nouveau code est : ${otp}\nIl expire dans 5 minutes.`
//       );
//       console.log("Nouveau OTP envoyé à:", user.email, "Code:", otp);
//     } catch (mailErr) {
//       console.error("Erreur envoi nouveau OTP:", mailErr);
//     }

//     res.status(200).json({ status: 'success', message: 'Nouveau OTP envoyé à votre email.' });
//   } catch (error) {
//     console.error("resendOtp error:", error);
//     res.status(500).json({ status: 'error', message: 'Erreur serveur lors du renvoi OTP.' });
//   }
//   */
// };

// // ---------------- GET PROFILE ----------------
// const getProfile = async (req, res) => {
//   try {
//     // Whitelist explicite : on n'expose jamais password, otpCode, signupCode,
//     // refreshToken ou tout autre champ sensible interne.
//     const user = await User.findById(req.user.id).select(
//       'name email role balance isActive isMaintenanceAllowed createdAt'
//     );
//     if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });
//     res.status(200).json({ status: 'success', user });
//   } catch (error) {
//     console.error('getProfile error:', error);
//     res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
//   }
// };

// // ---------------- EXPORT ----------------
// module.exports = {
//   register,
//   verifySignupCode,
//   login,
//   verifyOtp,
//   resendOtp,
//   getProfile
// };

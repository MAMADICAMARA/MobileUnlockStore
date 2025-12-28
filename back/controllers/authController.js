// back/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

/**
 * Génère un token JWT signé avec les informations de l'utilisateur.
 */
const generateToken = (id, role, email, name, balance) => {
  // Inclure id ET _id dans le payload pour être tolérant avec différents middlewares/clients
  const payload = { id, _id: id, role, email, name, balance };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Génère un code OTP à 6 chiffres
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Inscrire un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Veuillez fournir un nom, email et mot de passe.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Cet email est déjà utilisé.' });
    }

    const code = generateOtp();

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      balance: 0,
      signupCode: code,
      signupCodeExpires: Date.now() + 5 * 60 * 1000,
      isActive: false
    });

    await sendEmail(user.email, 'Code de confirmation d\'inscription', `Bonjour ${user.name},\nVotre code est : ${code}\nIl expire dans 5 minutes.`);

    res.status(201).json({ status: 'success', message: 'Code d\'inscription envoyé à votre email.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de l\'inscription.' });
  }
};

/**
 * @desc    Vérifier le code d'inscription et activer le compte
 * @route   POST /api/auth/verify-signup-code
 * @access  Public
 */
const verifySignupCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });

    if (user.signupCode !== code) return res.status(400).json({ status: 'error', message: 'Code invalide.' });
    if (user.signupCodeExpires < Date.now()) return res.status(400).json({ status: 'error', message: 'Code expiré.' });

    user.signupCode = undefined;
    user.signupCodeExpires = undefined;
    user.isActive = true;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Compte activé avec succès.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la vérification.' });
  }
};

/**
 * @desc    Connexion étape 1 : vérifier email+password puis générer/envoi OTP
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ne pas utiliser .lean() ici : on a besoin des méthodes d'instance (matchPassword)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect.' });
    }

    // S'assure que la méthode d'instance est disponible (sécurité si modèle mal chargé)
    if (typeof user.matchPassword !== 'function') {
      return res.status(500).json({ status: 'error', message: 'Erreur serveur: méthode de validation de mot de passe indisponible.' });
    }
    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect.' });
    }

    // Décider si on utilise OTP pour la connexion (par défaut activé)
    const useOtp = process.env.ENABLE_LOGIN_OTP !== 'false';

    if (!useOtp) {
      // Génération directe du token (comportement de contournement/dev)
      const token = generateToken(user._id, user.role, user.email, user.name, user.balance);
      return res.status(200).json({
        status: 'success',
        message: 'Connexion réussie.',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance
        }
      });
    }

    // Si un OTP existe et n'est pas expiré, ne pas générer un nouveau :
    if (user.otpCode && user.otpExpires && user.otpExpires > Date.now()) {
      // Indiquer au frontend que le code est déjà envoyé (le modal doit l'indiquer à l'utilisateur)
      return res.status(200).json({
        status: 'otp_sent',
        message: 'Un code a déjà été envoyé à cet email. Vérifiez votre boîte de réception.'
      });
    }

    // Générer et stocker un nouvel OTP
    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Envoyer l'email contenant l'OTP (si sendEmail fonctionne)
    try {
      await sendEmail(user.email, 'Code OTP de connexion', `Bonjour ${user.name},\nVotre code de connexion est : ${otp}\nIl expire dans 5 minutes.`);
    } catch (mailErr) {
      console.error('Erreur envoi email OTP:', mailErr);
      // On continue : l'OTP est stocké en base même si l'envoi a échoué.
    }

    // Répondre pour indiquer que l'OTP a été envoyé (ou stocké)
    return res.status(200).json({
      status: 'otp_sent',
      message: 'Le code a été envoyé à votre adresse email (ou est disponible). Veuillez vérifier votre boîte de réception.'
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la connexion.' });
  }
};

/**
 * @desc    Connexion étape 2 : vérifier OTP et renvoyer token
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });

    if (user.otpCode !== otp) return res.status(400).json({ status: 'error', message: 'OTP invalide.' });
    if (user.otpExpires < Date.now()) return res.status(400).json({ status: 'error', message: 'OTP expiré.' });

    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role, user.email, user.name, user.balance);

    // Retourner le token ET les infos utilisateur afin que le frontend initialise l'état user immédiatement
    return res.status(200).json({
      status: 'success',
      message: 'Connexion réussie.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la vérification OTP.' });
  }
};

/**
 * @desc    Renvoyer un OTP si expiré
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, 'Nouveau code OTP', `Votre nouveau code est : ${otp}\nIl expire dans 5 minutes.`);

    res.status(200).json({ status: 'success', message: 'Nouveau OTP envoyé à votre email.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors du renvoi OTP.' });
  }
};

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    // Tolérance : prioriser req.user (middleware), sinon tenter de décoder le token Authorization
    let userId = req?.user?._id || req?.user?.id || req?.user?.userId;
    if (!userId) {
      // Essayer d'extraire depuis l'en-tête Authorization "Bearer <token>"
      const authHeader = req.headers?.authorization || req.headers?.Authorization;
      if (!authHeader || typeof authHeader !== 'string') {
        return res.status(401).json({ status: 'error', message: 'Non autorisé. Token manquant.' });
      }
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ status: 'error', message: 'En-tête Authorization mal formé.' });
      }
      const token = parts[1];
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Payload peut contenir id, _id, sub, userId, etc.
        userId = payload?._id || payload?.id || payload?.sub || payload?.userId;
      } catch (verifyErr) {
        console.error('JWT verification failed in getProfile:', verifyErr.message);
        return res.status(401).json({ status: 'error', message: 'Token invalide ou expiré.' });
      }
    }
    const user = await User.findById(userId).select('-password');

    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la récupération du profil.' });
  }
};

module.exports = {
  register,
  verifySignupCode,
  login,
  verifyOtp,
  resendOtp,
  getProfile
};

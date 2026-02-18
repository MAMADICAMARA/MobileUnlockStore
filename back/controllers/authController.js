// back/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role, email, name, balance) => {
  const payload = { id, _id: id, role, email, name, balance };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------------- REGISTER ----------------
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

    // ────────────────────────────── OTP / EMAIL EN PAUSE ──────────────────────────────
    // const code = generateOtp();
    // ────────────────────────────────────────────────────────────────────────────────

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      balance: 0,
      // signupCode: code,                    // ← COMMENTÉ
      // signupCodeExpires: Date.now() + 5 * 60 * 1000,  // ← COMMENTÉ
      isActive: true                             // ← forcé à true pour bypass vérif email temporairement
      // isActive: false                    // ← ancienne valeur
    });

    // ────────────────────────────── OTP / EMAIL EN PAUSE ──────────────────────────────
    /*
    try {
      await sendEmail(
        user.email,
        "Code de confirmation d'inscription",
        `Bonjour ${user.name},\nVotre code est : ${code}\nIl expire dans 5 minutes.`
      );
      console.log("Email d'inscription envoyé à:", user.email, "Code:", code);
    } catch (mailErr) {
      console.error("Erreur envoi email inscription:", mailErr);
    }
    */
    // ────────────────────────────────────────────────────────────────────────────────

    res.status(201).json({ 
      status: 'success', 
      message: 'Inscription réussie.'   // ← message adapté (plus de code à envoyer)
      // message: 'Code d\'inscription envoyé à votre email.'
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de l\'inscription.' });
  }
};

// ---------------- VERIFY SIGNUP CODE ----------------
const verifySignupCode = async (req, res) => {
  // Fonction mise en pause temporairement
  res.status(200).json({ 
    status: 'info', 
    message: 'Vérification par code temporairement désactivée (inscription directe).' 
  });

  /*
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.signupCode !== code || user.signupCodeExpires < Date.now()) {
      return res.status(400).json({ status: 'error', message: 'Code invalide ou expiré.' });
    }
    user.isActive = true;
    user.signupCode = undefined;
    user.signupCodeExpires = undefined;
    await user.save();
    res.status(200).json({ status: 'success', message: 'Inscription confirmée.' });
  } catch (error) {
    console.error("verifySignupCode error:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
  }
  */
};

// ---------------- LOGIN ----------------
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect.' });
    }

    if (typeof user.matchPassword !== 'function') {
      return res.status(500).json({ status: 'error', message: 'Erreur serveur: méthode de validation de mot de passe indisponible.' });
    }

    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect.' });
    }

    // ────────────────────────────── OTP / EMAIL EN PAUSE ──────────────────────────────
    /*
    const useOtp = process.env.ENABLE_LOGIN_OTP !== 'false';

    if (useOtp) {
      if (user.otpCode && user.otpExpires && user.otpExpires > Date.now()) {
        return res.status(200).json({
          status: 'otp_sent',
          message: 'Un code a déjà été envoyé à cet email. Vérifiez votre boîte de réception.'
        });
      }

      const otp = generateOtp();
      user.otpCode = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      try {
        await sendEmail(
          user.email,
          "Code OTP de connexion",
          `Bonjour ${user.name},\nVotre code de connexion est : ${otp}\nIl expire dans 5 minutes.`
        );
        console.log("Email OTP envoyé à:", user.email, "Code:", otp);
      } catch (mailErr) {
        console.error("Erreur envoi email OTP:", mailErr);
      }

      return res.status(200).json({
        status: 'otp_sent',
        message: 'Le code a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.'
      });
    }
    */
    // ────────────────────────────────────────────────────────────────────────────────

    // Connexion directe (sans OTP)
    const token = generateToken(user._id, user.role, user.email, user.name, user.balance);
    return res.status(200).json({
      status: 'success',
      message: 'Connexion réussie.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, balance: user.balance }
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la connexion.' });
  }
};

// ---------------- VERIFY OTP ----------------
const verifyOtp = async (req, res) => {
  // Fonction mise en pause temporairement
  res.status(200).json({ 
    status: 'info', 
    message: 'Vérification OTP temporairement désactivée.' 
  });

  /*
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ status: 'error', message: 'OTP invalide ou expiré.' });
    }
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();
    const token = generateToken(user._id, user.role, user.email, user.name, user.balance);
    res.status(200).json({ status: 'success', message: 'Connexion réussie.', token });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
  }
  */
};

// ---------------- RESEND OTP ----------------
const resendOtp = async (req, res) => {
  // Fonction mise en pause temporairement
  res.status(200).json({ 
    status: 'info', 
    message: 'Renvoi OTP temporairement désactivé.' 
  });

  /*
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    try {
      await sendEmail(
        user.email,
        "Nouveau code OTP",
        `Votre nouveau code est : ${otp}\nIl expire dans 5 minutes.`
      );
      console.log("Nouveau OTP envoyé à:", user.email, "Code:", otp);
    } catch (mailErr) {
      console.error("Erreur envoi nouveau OTP:", mailErr);
    }

    res.status(200).json({ status: 'success', message: 'Nouveau OTP envoyé à votre email.' });
  } catch (error) {
    console.error("resendOtp error:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors du renvoi OTP.' });
  }
  */
};

// ---------------- GET PROFILE ----------------
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });
    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
  }
};

// ---------------- EXPORT ----------------
module.exports = {
  register,
  verifySignupCode,
  login,
  verifyOtp,
  resendOtp,
  getProfile
};
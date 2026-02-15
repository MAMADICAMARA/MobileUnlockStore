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

    res.status(201).json({ status: 'success', message: 'Code d\'inscription envoyé à votre email.' });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de l\'inscription.' });
  }
};

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

    const useOtp = process.env.ENABLE_LOGIN_OTP !== 'false';

    if (!useOtp) {
      const token = generateToken(user._id, user.role, user.email, user.name, user.balance);
      return res.status(200).json({
        status: 'success',
        message: 'Connexion réussie.',
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, balance: user.balance }
      });
    }

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
      message: 'Le code a été envoyé à votre adresse email (ou est disponible). Veuillez vérifier votre boîte de réception.'
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la connexion.' });
  }
};

const resendOtp = async (req, res) => {
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
};

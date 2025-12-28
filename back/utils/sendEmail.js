// back/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  // 1. Créer un transporteur dynamique suivant .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: (process.env.SMTP_SECURE === 'true') || (process.env.SMTP_PORT === '465'), // true pour 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Option TLS utile en dev si votre environnement bloque les certificats
    tls: {
      rejectUnauthorized: false
    }
  });

  // 2. Définir les options de l'e-mail
  const mailOptions = {
    from: `"GSM Guinea Unlock Store" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text
  };

  // 3. Envoyer l'e-mail
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);
    // Propager l'erreur pour que le contrôleur puisse en tenir compte
    throw error;
  }
};

module.exports = sendEmail;
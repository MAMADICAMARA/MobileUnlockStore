// back/utils/sendEmail.js
const Brevo  = require('@getbrevo/brevo');
const logger = require('./logger');
require('dotenv').config();

// ──────────────────────────────────────────────────────────────
// FONCTIONNALITÉ OTP / EMAIL MISE EN PAUSE (18/02/2026)
// Pour réactiver : décommenter le code Brevo ci-dessous
// ──────────────────────────────────────────────────────────────

/*
// Crée une instance de l'API Transactional Emails
const apiInstance = new Brevo.TransactionalEmailsApi();

// Configure la clé API (méthode correcte)
apiInstance.setApiKey(process.env.BREVO_API_KEY);
*/

/**
 * Fonction pour envoyer un OTP par email
 * @param {string} toEmail - Adresse email du destinataire
 * @param {string} otp - Code OTP à envoyer
 */
async function sendOTP(toEmail, otp) {
  // ────────────────────────────── PAUSE ACTIVE ──────────────────────────────
  logger.log(`[OTP EN PAUSE] Appel ignoré pour ${toEmail} - Code: ${otp}`);
  return true;   // Simule un succès pour ne pas casser la logique du controller
  // ─────────────────────────────────────────────────────────────────────────

  /*
  try {
    const result = await apiInstance.sendTransacEmail({
      sender: { 
        name: "MobileUnlockStore", 
        email: "mamadi.mobileunlock@gmail.com" // ⚠️ Mets ici une adresse validée dans Brevo
      },
      to: [{ email: toEmail }],
      subject: "Votre code OTP - MobileUnlockStore",
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Bonjour ! 👋</h2>
            <p>Votre code de connexion :</p>
            <h1 style="background: #f1f5f9; padding: 15px; text-align: center; letter-spacing: 6px;">
              ${otp}
            </h1>
            <p>Valide 10 minutes. Ne partagez pas !</p>
            <p>Team MobileUnlockStore</p>
          </body>
        </html>
      `,
      textContent: `Code OTP : ${otp}\nValide 10 min.\nNe partagez pas !`
    });

    console.log('✅ OTP envoyé via Brevo !');
    console.log('Réponse Brevo:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('❌ ERREUR BREVO (détaillée) :');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Réponse API:', error.response.body || error.response);
    }
    throw error;
  }
  */
}

module.exports = { sendOTP };
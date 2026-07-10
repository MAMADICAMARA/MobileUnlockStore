// back/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    // Filet de sécurité au niveau schéma — doit rester synchronisé avec
    // MIN_PAYMENT_AMOUNT dans back/controllers/paymentController.js
    min: [100000, 'Le montant minimum autorisé est de 100 000 FG.'],
  },
  status: {
    type: String,
    enum: ['Réussi', 'Échoué', 'en cours'],
    default: 'en cours',
  },
  type: {
    type: String,
    enum: ['Carte', 'PayPal', 'Autre'],
    default: 'Carte',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;

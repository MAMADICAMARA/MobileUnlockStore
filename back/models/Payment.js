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
  },
  status: {
    type: String,
    enum: ['Réussi', 'Échoué', 'En attente'],
    default: 'En attente',
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

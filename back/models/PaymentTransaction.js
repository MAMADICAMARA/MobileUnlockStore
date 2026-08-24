// back/models/PaymentTransaction.js
const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentProvider', required: true },

  amount:                   { type: Number, required: true }, // montant demandé par le client, en GNF
  amountInProviderCurrency: { type: Number, default: null },
  currency:                 { type: String, default: 'GNF' },

  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending', index: true },

  internalRef:      { type: String, required: true, unique: true, index: true },
  providerRef:      { type: String, default: null },
  providerOrderId:  { type: String, default: null },

  providerResponse: { type: mongoose.Schema.Types.Mixed, default: null },
  paymentUrl:        { type: String, default: null },

  // Idempotence — voir back/controllers/paymentController.js confirmAndCredit()
  credited:   { type: Boolean, default: false },
  creditedAt: { type: Date, default: null },

  webhookReceivedAt: { type: Date, default: null },
  webhookData:        { type: mongoose.Schema.Types.Mixed, default: null },

  // Frais applicatifs (voir PaymentSettings.fees)
  fees: {
    amount:      { type: Number, default: 0 },
    type:        { type: String, default: null },
    percentage:  { type: Number, default: 0 },
    fixedAmount: { type: Number, default: 0 },
  },
  amountRequested: { type: Number, required: true }, // ce que le client voulait créditer
  amountCharged:    { type: Number, required: true }, // ce qui a été/sera débité (avec frais)
  amountCredited:   { type: Number, required: true }, // ce qui sera crédité au solde

}, { timestamps: true });

PaymentTransactionSchema.index({ status: 1, createdAt: -1 });

const PaymentTransaction = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
module.exports = PaymentTransaction;

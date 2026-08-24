// back/models/PaymentSettings.js
// Document UNIQUE (singleton) — interrupteur global du paiement automatique
// et configuration des frais applicatifs. Même pattern que SystemSettings.js.
const mongoose = require('mongoose');

const PaymentSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },

  // false par défaut — sécurité : tant que l'admin n'a rien activé,
  // les clients ne voient que le bouton WhatsApp (comportement actuel).
  automaticPaymentEnabled: { type: Boolean, default: false },

  fees: {
    enabled:         { type: Boolean, default: false },
    type:             { type: String, enum: ['percentage', 'fixed', 'both'], default: 'percentage' },
    percentage:       { type: Number, default: 0, min: 0 },
    fixedAmount:      { type: Number, default: 0, min: 0 },
    appliedTo:        { type: String, enum: ['client', 'admin'], default: 'client' },
    displayToClient:  { type: Boolean, default: true },
  },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

PaymentSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'global' });
  if (!settings) settings = await this.create({ key: 'global' });
  return settings;
};

const PaymentSettings = mongoose.model('PaymentSettings', PaymentSettingsSchema);
module.exports = PaymentSettings;

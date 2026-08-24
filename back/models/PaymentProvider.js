// back/models/PaymentProvider.js
const mongoose = require('mongoose');

const PaymentProviderSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  slug:    { type: String, required: true, unique: true, trim: true, lowercase: true }, // paydunya | cinetpay | binancepay | stripe
  type:    { type: String, enum: ['mobile_money', 'crypto', 'card'], required: true },
  logoUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },

  // Clés API — stockées CHIFFRÉES (back/utils/encryption.js). La signification
  // de key1..key4 dépend du provider (voir back/services/payment/*.js) :
  //   paydunya   : key1=masterKey, key2=publicKey, key3=privateKey, key4=token
  //   cinetpay   : key1=apiKey,    key2=siteId
  //   binancepay : key1=apiKey (Certificate-SN), key2=secretKey, key3=merchantId
  //   stripe     : key1=publishableKey, key2=secretKey
  apiKeys: {
    key1: { type: String, default: '' },
    key2: { type: String, default: '' },
    key3: { type: String, default: '' },
    key4: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
  },

  limits: {
    minAmount: { type: Number, default: 100000 },
    maxAmount: { type: Number, default: 5000000 },
    currency:  { type: String, default: 'GNF' },
    // Taux de conversion GNF -> devise du provider, pour Stripe/Binance qui ne
    // gèrent pas le GNF. Ex: 1 USD = 8700 GNF -> exchangeRateToProviderCurrency = 8700.
    exchangeRateToProviderCurrency: { type: Number, default: 1 },
  },

  config: {
    returnUrl:   { type: String, default: '' },
    cancelUrl:   { type: String, default: '' },
    extraParams: { type: mongoose.Schema.Types.Mixed, default: {} },
  },

  supportedMethods: { type: [String], default: [] },

  quickAmounts: { type: [Number], default: [100000, 200000, 500000, 1000000, 2000000] },

  stats: {
    totalTransactions: { type: Number, default: 0 },
    totalAmount:        { type: Number, default: 0 },
    successRate:        { type: Number, default: 0 },
  },
}, { timestamps: true });

const PaymentProvider = mongoose.model('PaymentProvider', PaymentProviderSchema);
module.exports = PaymentProvider;

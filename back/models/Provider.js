// back/models/Provider.js
const mongoose = require('mongoose');

const FieldMappingSchema = new mongoose.Schema({
  siteField:     { type: String, required: true, trim: true },
  providerField: { type: String, required: true, trim: true },
  required:      { type: Boolean, default: false },
  defaultValue:  { type: String, default: '' },
}, { _id: false });

const StatusMappingSchema = new mongoose.Schema({
  providerStatus: { type: String, required: true, trim: true },
  siteStatus: {
    type: String,
    enum: ['En attente', 'En cours', 'Terminé', 'Annulé', 'Échoué', 'Rejeté', 'Remboursé'],
    required: true,
  },
}, { _id: false });

const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  description: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  apiConfig: {
    baseUrl:       { type: String, required: true },
    authType:      { type: String, enum: ['api_key', 'bearer', 'basic'], default: 'api_key' },
    apiKey:        { type: String, required: true }, // stocké chiffré (utils/encryption.js)
    authHeader:    { type: String, default: 'Authorization' },
    requestFormat: { type: String, enum: ['json', 'xml', 'form-data'], default: 'json' },
    httpMethod:    { type: String, enum: ['POST', 'GET'], default: 'POST' },
    orderEndpoint:  { type: String, required: true },
    statusEndpoint: { type: String, default: '' },
    environment:    { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
  },

  trackingConfig: {
    mode:                   { type: String, enum: ['webhook', 'polling', 'both'], default: 'polling' },
    webhookSecret:          { type: String, default: '' },
    pollingIntervalMinutes: { type: Number, default: 15, min: 1 },
    statusField:            { type: String, default: 'status' },
    orderIdField:           { type: String, default: 'order_id' },
    resultField:            { type: String, default: 'unlock_code' },
  },

  fieldMapping:  { type: [FieldMappingSchema], default: [] },
  statusMapping: { type: [StatusMappingSchema], default: [] },

  retryConfig: {
    maxRetries:           { type: Number, default: 3, min: 0 },
    retryDelays:          { type: [Number], default: [60, 300, 900] },
    autoRefundOnFailure:  { type: Boolean, default: true },
  },
}, {
  timestamps: true,
});

const Provider = mongoose.model('Provider', ProviderSchema);
module.exports = Provider;

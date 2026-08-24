// back/models/ProviderService.js
const mongoose = require('mongoose');

const ProviderServiceSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  providerServiceCode: { type: String, required: true, trim: true },
  isPrimary: { type: Boolean, default: true },
  isBackup:  { type: Boolean, default: false },
  priority:  { type: Number, default: 1 },
  isActive:  { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Un service ne peut être associé qu'une fois au même fournisseur
ProviderServiceSchema.index({ serviceId: 1, providerId: 1 }, { unique: true });

const ProviderService = mongoose.model('ProviderService', ProviderServiceSchema);
module.exports = ProviderService;

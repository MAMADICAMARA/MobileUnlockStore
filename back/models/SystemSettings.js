// back/models/SystemSettings.js
// Document UNIQUE qui stocke l'état global du système (mode maintenance, etc.)
// Pattern singleton : il n'existe qu'un seul document de ce type en base.

const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  // Clé fixe pour garantir qu'il n'y a qu'un seul document
  key: {
    type: String,
    default: 'global',
    unique: true,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
    default: 'Maintenance en cours. Notre équipe technique effectue des mises à jour pour améliorer votre service. Nous serons de retour très rapidement. Merci pour votre patience.',
  },
  maintenanceActivatedAt: {
    type: Date,
    default: null,
  },
  maintenanceActivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

/**
 * Récupère (ou crée si absent) le document unique de settings.
 * Évite d'avoir à gérer manuellement l'existence du document partout.
 */
SystemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'global' });
  if (!settings) {
    settings = await this.create({ key: 'global' });
  }
  return settings;
};

const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);
module.exports = SystemSettings;
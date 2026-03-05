// back/models/Service.js
const mongoose = require('mongoose');

/**
 * SERVICE MODEL
 * Gère les 4 catégories fixes: IMEI, Server, Rental, License
 * Les champs utilisateur sont générés automatiquement selon la catégorie
 */

// Sous-schéma pour chaque champ requis (DEPRECATED - garder pour compatibilité)
const FieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'number', 'email', 'url', 'file', 'tel', 'checkbox', 'select'],
    default: 'text',
  },
  required: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  validation: {
    type: String,
    default: '',
  },
  helpText: {
    type: String,
    default: '',
  },
  // AJOUT: Options pour les selects
  options: {
    type: [String],
    default: [],
  },
  // AJOUT: Valeur par défaut
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
  },
}, { _id: false });

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du service est requis'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif'],
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['IMEI', 'Server', 'Rental', 'License'],
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index pour recherche rapide
ServiceSchema.index({ category: 1, active: 1 });
ServiceSchema.index({ name: 'text', description: 'text' });

/**
 * Retourne les champs utilisateur requis pour une catégorie donnée
 * 
 * IMEI: [{ name: 'imei', label: 'IMEI...' }, { name: 'imageUrl', label: 'URL image...' }]
 * Server: [{ name: 'username', label: 'Username...' }, { name: 'email', label: 'Email...' }]
 * Rental: [] (aucun champ utilisateur)
 * License: [] (aucun champ utilisateur)
 */
ServiceSchema.statics.getUserFieldsForCategory = function(category) {
  const fieldsMap = {
    IMEI: [
      {
        name: 'imei',
        label: 'Numéro IMEI',
        type: 'text',
        required: true,
        validation: '^[0-9]{15}$',
        placeholder: '15 chiffres',
        helpText: 'Tapez *#06# pour obtenir votre IMEI'
      },
      {
        name: 'imageUrl',
        label: 'URL image (imgbb.com)',
        type: 'url',
        required: true,
        placeholder: 'https://imgbb.com/...',
        helpText: 'Lien direct de l\'image depuis imgbb.com'
      }
    ],
    Server: [
      {
        name: 'username',
        label: 'Nom d\'utilisateur (logiciel)',
        type: 'text',
        required: true,
        validation: '^[a-zA-Z0-9_-]{3,20}$',
        placeholder: 'votre_username',
        helpText: '3-20 caractères (lettres, chiffres, -, _)'
      },
      {
        name: 'email',
        label: 'Email (compte logiciel)',
        type: 'email',
        required: true,
        placeholder: 'user@example.com',
        helpText: 'Email du compte logiciel'
      }
    ],
    Rental: [],
    License: []
  };

  return fieldsMap[category] || [];
};

/**
 * Retourne la structure de livraison pour une catégorie donnée
 * Indique quel type de données l'admin doit fournir
 */
ServiceSchema.statics.getDeliveryFieldsForCategory = function(category) {
  const deliveryMap = {
    IMEI: ['status'], // Juste le status (pending → completed)
    Server: ['status'], // Juste le status
    Rental: ['username', 'password'], // Admin saisit ces données
    License: ['activationKey'] // Admin saisit la clé
  };

  return deliveryMap[category] || [];
};

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;
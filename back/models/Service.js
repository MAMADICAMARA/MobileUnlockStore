// back/models/Service.js
const mongoose = require('mongoose');

// Définition du schéma pour le modèle Service
const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du service est requis'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
  },
  type: {
    type: String,
    required: true,
    enum: ['IMEI', 'Licence', 'Remote', 'official unlock iphone'], // Types de services autorisés
  },
  deliveryTime: {
    type: String,
    required: [true, 'Le délai de traitement est requis'],
  },
  // Ce champ pourrait être utilisé pour stocker des champs de formulaire requis,
  // par exemple ['imei', 'serial_number']
  requiredFields: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;

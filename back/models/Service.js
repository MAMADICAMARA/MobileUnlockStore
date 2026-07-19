// back/models/Service.js
const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  label:        { type: String, required: true, trim: true },
  type:         { type: String, enum: ['text', 'number', 'email', 'url', 'file', 'tel', 'checkbox', 'select'], default: 'text' },
  required:     { type: Boolean, default: true },
  placeholder:  { type: String, default: '' },
  validation:   { type: String, default: '' },
  helpText:     { type: String, default: '' },
  options:      { type: [String], default: [] },
  defaultValue: { type: mongoose.Schema.Types.Mixed },
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
    enum: ['IMEI', 'Server', 'Rental', 'Credit'],
  },
  deliveryTime: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
    trim: true,
  },
  instructions: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },

  // ─── Quantité min/max (catégorie Credit uniquement) ───────────────────────
  // minQuantity : quantité minimale qu'un client doit commander
  // maxQuantity : quantité maximale autorisée par commande (0 = illimité)
  minQuantity: {
    type: Number,
    default: 1,
    min: [1, 'La quantité minimale doit être au moins 1'],
  },
  maxQuantity: {
    type: Number,
    default: 0, // 0 = pas de limite
    min: [0, 'La quantité maximale ne peut pas être négative'],
  },
  // ─────────────────────────────────────────────────────────────────────────

  fieldsRequired: {
    type: [FieldSchema],
    default: [],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

ServiceSchema.index({ category: 1, active: 1 });
ServiceSchema.index({ name: 'text', description: 'text' });

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;

// // back/models/Service.js
// const mongoose = require('mongoose');

// const FieldSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   label: { type: String, required: true, trim: true },
//   type: {
//     type: String,
//     enum: ['text', 'number', 'email', 'url', 'file', 'tel', 'checkbox', 'select'],
//     default: 'text',
//   },
//   required: { type: Boolean, default: true },
//   placeholder: { type: String, default: '' },
//   validation: { type: String, default: '' },
//   helpText: { type: String, default: '' },
//   options: { type: [String], default: [] },
//   defaultValue: { type: mongoose.Schema.Types.Mixed },
// }, { _id: false });

// const ServiceSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Le nom du service est requis'],
//     trim: true,
//     unique: true,
//   },
//   description: {
//     type: String,
//     required: [true, 'La description est requise'],
//     trim: true,
//   },
//   price: {
//     type: Number,
//     required: [true, 'Le prix est requis'],
//     min: [0, 'Le prix ne peut pas être négatif'],
//   },
//   category: {
//     type: String,
//     required: [true, 'La catégorie est requise'],
//     enum: ['IMEI', 'Server', 'Rental', 'Credit'],
//   },
//   deliveryTime: {
//     type: String,
//     default: '',
//   },
//   imageUrl: { // ✅ AJOUT : Stocke le lien de l'icône/image personnalisée pour le mode Desktop
//     type: String,
//     default: '',
//     trim: true,
//   },
//   instructions: {
//     type: String,
//     default: '',
//   },
//   active: {
//     type: Boolean,
//     default: true,
//   },
//   fieldsRequired: {
//     type: [FieldSchema],
//     default: [],
//   },
//   metadata: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {},
//   },
// }, {
//   timestamps: true,
// });

// ServiceSchema.index({ category: 1, active: 1 });
// ServiceSchema.index({ name: 'text', description: 'text' });

// const Service = mongoose.model('Service', ServiceSchema);

// module.exports = Service;


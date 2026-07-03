// back/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  serviceDetails: {
    name: String,
    price: Number,
    category: {
      type: String,
      enum: ['IMEI', 'Server', 'Rental', 'License'],
      required: true,
      index: true,
    }
  },

  // ✅ Statuts uniquement en français — base migrée
  status: {
    type: String,
    enum: ['en cours', 'En cours', 'Terminé', 'Annulé', 'Remboursé'],
    default: 'en cours',
    index: true,
  },

  userSubmittedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  userSubmittedDataMetadata: {
    type: [{ name: String, label: String, type: String }],
    default: [],
  },

  deliveryData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  amount: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },

  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  adminNotes: {
    type: String,
    default: '',
  },

  refundReason: { type: String, default: '' },
  refundedAt:   Date,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  processedAt: Date,
  completedAt: Date,

}, {
  timestamps: true,
});

// ─── Index ────────────────────────────────────────────────────────────────────
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'serviceDetails.category': 1, status: 1 });

// ─── Middleware dates ─────────────────────────────────────────────────────────
OrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'En cours' && !this.processedAt) {
      this.processedAt = new Date();
    }
    if (this.status === 'Terminé' && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === 'Remboursé' && !this.refundedAt) {
      this.refundedAt = new Date();
    }
  }
  next();
});

// ─── Virtual ─────────────────────────────────────────────────────────────────
OrderSchema.virtual('formattedUserData').get(function() {
  if (!this.userSubmittedData || !this.userSubmittedDataMetadata) return [];
  return this.userSubmittedDataMetadata.map(meta => ({
    label: meta.label,
    value: this.userSubmittedData.get(meta.name) || '',
    type:  meta.type,
  }));
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;

// // back/models/Order.js
// const mongoose = require('mongoose');

// const OrderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true,
//   },
//   serviceId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Service',
//     required: true,
//   },
//   serviceDetails: {
//     name: String,
//     price: Number,
//     category: {
//       type: String,
//       enum: ['IMEI', 'Server', 'Rental', 'License'],
//       required: true,
//       index: true,
//     }
//   },

//   // ✅ Statut — version commitée + statuts français + Remboursé
//   status: {
//     type: String,
//     enum: [
//       'en cours', 'En cours', 'Terminé', 'Annulé', 'Remboursé',
//       'pending', 'processing', 'completed',
//     ],
//     default: 'en cours',
//     index: true,
//   },

//   userSubmittedData: {
//     type: Map,
//     of: mongoose.Schema.Types.Mixed,
//     default: {},
//   },

//   // ✅ Métadonnées — version commitée exacte (tableau d'objets avec sous-schéma)
//   userSubmittedDataMetadata: {
//     type: [{
//       name:  String,
//       label: String,
//       type:  String,
//     }],
//     default: [],
//   },

//   deliveryData: {
//     type: Map,
//     of: mongoose.Schema.Types.Mixed,
//     default: {},
//   },

//   amount: {
//     type: Number,
//     required: true,
//   },

//   // ✅ Quantité ajoutée pour les licences
//   quantity: {
//     type: Number,
//     default: 1,
//     min: 1,
//   },

//   transactionId: {
//     type: String,
//     unique: true,
//     sparse: true,
//     index: true,
//   },

//   adminNotes: {
//     type: String,
//     default: '',
//   },

//   // ✅ Remboursement
//   refundReason: { type: String, default: '' },
//   refundedAt:   Date,
//   refundedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },

//   processedAt: Date,
//   completedAt: Date,

// }, {
//   timestamps: true,
// });

// // ─── Index ────────────────────────────────────────────────────────────────────
// OrderSchema.index({ userId: 1, createdAt: -1 });
// OrderSchema.index({ status: 1, createdAt: -1 });
// OrderSchema.index({ 'serviceDetails.category': 1, status: 1 });

// // ─── Middleware dates ─────────────────────────────────────────────────────────
// OrderSchema.pre('save', function(next) {
//   if (this.isModified('status')) {
//     if (['En cours', 'processing'].includes(this.status) && !this.processedAt) {
//       this.processedAt = new Date();
//     }
//     if (['Terminé', 'completed'].includes(this.status) && !this.completedAt) {
//       this.completedAt = new Date();
//     }
//     if (this.status === 'Remboursé' && !this.refundedAt) {
//       this.refundedAt = new Date();
//     }
//   }
//   next();
// });

// // ─── Virtual ─────────────────────────────────────────────────────────────────
// OrderSchema.virtual('formattedUserData').get(function() {
//   if (!this.userSubmittedData || !this.userSubmittedDataMetadata) return [];
//   return this.userSubmittedDataMetadata.map(meta => ({
//     label: meta.label,
//     value: this.userSubmittedData.get(meta.name) || '',
//     type:  meta.type,
//   }));
// });

// const Order = mongoose.model('Order', OrderSchema);
// module.exports = Order;
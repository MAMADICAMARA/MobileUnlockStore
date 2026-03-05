// back/models/Order.js
const mongoose = require('mongoose');

/**
 * ORDER MODEL
 * Modèle unifié pour gérer toutes les commandes
 * Aucune séparation par type de service
 * 
 * Structure:
 * - userSubmittedData: Données saisies par l'utilisateur (IMEI, username, etc.)
 * - deliveryData: Données de livraison fournies par l'admin (credentials, clés, etc.)
 * - status: pending → processing → completed
 */

const OrderSchema = new mongoose.Schema({
  // Référence à l'utilisateur
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Référence au service
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },

  // Snapshot du service au moment de la commande
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

  // Statut de la commande
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending',
    index: true,
  },

  /**
   * ✅ DONNÉES SAISIES PAR L'UTILISATEUR
   * 
   * IMEI: { imei: "123456789012345", imageUrl: "https://imgbb.com/..." }
   * Server: { username: "user", email: "user@example.com" }
   * Rental: {} (vide)
   * License: {} (vide)
   */
  userSubmittedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  /**
   * Métadonnées des champs soumis (pour affichage frontend)
   * Utile pour afficher correctement les données à l'admin et l'utilisateur
   */
  userSubmittedDataMetadata: {
    type: [{
      name: String,
      label: String,
      type: String
    }],
    default: []
  },

  /**
   * ✅ DONNÉES DE LIVRAISON (fournies par l'admin)
   * 
   * IMEI/Server: {} (pas de données supplémentaires, juste le statut)
   * Rental: { username: "...", password: "..." }
   * License: { activationKey: "..." }
   */
  deliveryData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Montant débité du solde utilisateur
  amount: {
    type: Number,
    required: true,
  },

  // ID de transaction (pour traçabilité)
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  // Notes de l'admin
  adminNotes: {
    type: String,
    default: '',
  },

  // Timestamps importantes
  processedAt: Date, // Quand l'admin a commencé le traitement
  completedAt: Date, // Quand la commande a été complétée

}, {
  timestamps: true, // createdAt, updatedAt automatiques
});

// ✅ INDEXES POUR PERFORMANCES
OrderSchema.index({ userId: 1, createdAt: -1 }); // Historique utilisateur
OrderSchema.index({ status: 1, createdAt: -1 }); // Filtre admin par statut
OrderSchema.index({ 'serviceDetails.category': 1, status: 1 }); // Filtre par catégorie
OrderSchema.index({ transactionId: 1 });

/**
 * ✅ MIDDLEWARE: Mettre à jour dates selon le statut
 */
OrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'processing' && !this.processedAt) {
      this.processedAt = new Date();
    }
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

/**
 * ✅ VIRTUAL: Formater les données pour l'affichage
 */
OrderSchema.virtual('formattedUserData').get(function() {
  if (!this.userSubmittedData || !this.userSubmittedDataMetadata) return [];
  
  return this.userSubmittedDataMetadata.map(meta => ({
    label: meta.label,
    value: this.userSubmittedData.get(meta.name) || '',
    type: meta.type
  }));
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
// src/services/orderService.js
// Import de l'instance axios centralisée pour faire les requêtes API
import api from './api';

// Objet exporté qui regroupe toutes les fonctions liées aux commandes
const orderService = {
  // ============================================
  // ROUTES CLIENTS
  // ============================================

  /**
   * Passe une nouvelle commande pour un service
   * @param {object} orderData - Les données de la commande { serviceId, userSubmittedData }
   */
  placeOrder: (orderData) => {
    console.log('📦 Place order data:', orderData);
    return api.post('/api/orders', orderData);
  },

  /**
   * Récupère les commandes de l'utilisateur connecté (avec pagination)
   * @param {object} params - { category, status, page, limit }
   */
  getMyOrders: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    const url = `/api/orders/my${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },

  /**
   * Alias pour getMyOrders (rétrocompatibilité)
   */
  getOrders: () => {
    return orderService.getMyOrders();
  },

  /**
   * Récupère l'historique détaillé des commandes (alias pour getMyOrders)
   * 🔥 CORRIGÉ: utilise maintenant /api/orders/my au lieu de /api/orders/history
   */
  getHistory: (params = {}) => {
    return orderService.getMyOrders(params);
  },

  /**
   * Récupère une commande par ID
   * @param {string} orderId - L'ID de la commande
   */
  getOrderById: (orderId) => {
    return api.get(`/api/orders/${orderId}`);
  },

  /**
   * Annule une commande quand c'est autorisé
   * @param {string} orderId - L'ID de la commande à annuler
   */
  cancelOrder: (orderId) => {
    return api.delete(`/api/orders/${orderId}`);
    // Note: votre controller utilise DELETE, pas PATCH
  },

  /**
   * Upload un document pour une commande
   * @param {string} orderId - L'ID de la commande
   * @param {File} file - Le fichier à uploader
   * @param {string} fieldName - Le nom du champ (défaut: 'document')
   */
  uploadDocument: (orderId, file, fieldName = 'document') => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('fieldName', fieldName);

    return api.post(`/api/orders/${orderId}/upload-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ============================================
  // ROUTES ADMIN (protégées)
  // ============================================

  /**
   * Récupère toutes les commandes (admin) avec filtres
   * @param {object} params - { status, page, limit, search, category, dateFrom, dateTo }
   */
  getAllOrders: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);

    const queryString = queryParams.toString();
    const url = `/api/admin/orders${queryString ? `?${queryString}` : ''}`;

    return api.get(url);
  },

  /**
   * Récupère une commande spécifique côté admin
   * @param {string} orderId - L'ID de la commande
   */
  getAdminOrderById: (orderId) => {
    return api.get(`/api/admin/orders/${orderId}`);
  },

  /**
   * Met à jour le statut d'une commande (admin)
   * @param {string} orderId - L'ID de la commande
   * @param {object} updateData - { status, deliveryData, adminNotes }
   */
  updateOrderStatus: (orderId, updateData) => {
    return api.put(`/api/admin/orders/${orderId}`, updateData);
    // Note: votre controller utilise PUT, pas PATCH
  },

  /**
   * Génère des données (clés, identifiants) pour une commande (admin)
   * @param {string} orderId - L'ID de la commande
   * @param {object} generatedData - Les données générées
   */
  generateOrderData: (orderId, generatedData) => {
    return api.post(`/api/admin/orders/${orderId}/generate`, { generatedData });
  },

  /**
   * Statistiques des commandes (admin)
   */
  getOrderStats: () => {
    return api.get('/api/admin/orders/stats');
  },

  /**
   * Export CSV des commandes (admin)
   * @param {object} filters - Les filtres à appliquer
   */
  exportOrders: (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return api.get(`/api/admin/orders/export?${queryParams}`, {
      responseType: 'blob',
    });
  },
};

// ============================================
// UTILITAIRES POUR LE FORMATAGE DES DONNÉES
// ============================================

/**
 * Formate les champs d'une commande pour l'affichage
 * @param {object} order - La commande
 * @returns {Array} Tableau de champs formatés { label, value, type }
 */
export const formatOrderFields = (order) => {
  // Choisir la metadata disponible (nouveau ou ancien)
  const metadata = order?.userSubmittedDataMetadata || order?.fieldsMetadata || [];
  // Choisir les valeurs (nouveau ou ancien)
  const values = order?.userSubmittedData || order?.fields || {};

  if (!metadata || metadata.length === 0) return [];

  return metadata.map(meta => ({
    label: meta.label,
    value: values?.[meta.name] || '',
    type: meta.type,
  }));
};

/**
 * Formate le statut d'une commande avec couleur et libellé
 * @param {string} status - Le statut brut
 * @returns {object} { label, color, bgColor, borderColor }
 */
export const formatOrderStatus = (status) => {
  // Supporter les deux formes: 'pending'/'processing'/'completed' et les anciens français
  const statusKey = (status || '').toString();

  const statusMap = {
    // Nouveaux statuts (anglais)
    'pending': {
      label: '⏳ En attente',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    },
    'processing': {
      label: '🔄 En cours',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
    },
    'completed': {
      label: '✅ Terminé',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
    },
    // Anciens statuts (français) - rétrocompatibilité
    'En attente': {
      label: '⏳ En attente',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    },
    'En cours': {
      label: '🔄 En cours',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
    },
    'Terminé': {
      label: '✅ Terminé',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
    },
    'Annulé': {
      label: '❌ Annulé',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
    },
  };

  return statusMap[statusKey] || {
    label: statusKey || '—',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  };
};

/**
 * Vérifie si une commande peut être annulée
 * @param {object} order - La commande
 * @returns {boolean} True si annulable
 */
export const isOrderCancellable = (order) => {
  const s = order?.status;
  return s === 'pending' || s === 'En attente';
};

/**
 * Vérifie si des documents peuvent être uploadés pour la commande
 * @param {object} order - La commande
 * @returns {boolean} True si upload possible
 */
export const canUploadDocuments = (order) => {
  const s = order?.status;
  const cancellableStatuses = ['pending', 'processing', 'En attente', 'En cours'];
  return order && cancellableStatuses.includes(s);
};

export default orderService;
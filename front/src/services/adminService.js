// src/services/adminService.js
import api from './api';

/**
 * Service pour gérer les opérations spécifiques à l'administration.
 */
const adminService = {
  // --- UTILISATEURS ---
  /**
   * Récupère tous les utilisateurs (clients).
   */
  getAllUsers: () => api.get('/api/admin/users'),

  // --- SERVICES AVEC CHAMPS DYNAMIQUES ---
  /**
   * Récupère tous les services.
   * @param {object} params - Paramètres optionnels (catégorie, actif, recherche)
   */
  getAllServices: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/api/admin/services${queryParams ? `?${queryParams}` : ''}`;
    return api.get(url);
  },

  /**
   * Récupère un service par son ID.
   * @param {string} serviceId - L'ID du service
   */
  getServiceById: (serviceId) => api.get(`/api/admin/services/${serviceId}`),

  /**
   * Crée un nouveau service avec champs dynamiques.
   * @param {object} serviceData - Les données complètes du service
   */
  createService: (serviceData) => api.post('/api/admin/services', serviceData),

  /**
   * Met à jour un service existant.
   * @param {string} serviceId - L'ID du service à mettre à jour
   * @param {object} serviceData - Les nouvelles données du service
   */
  updateService: (serviceId, serviceData) => api.put(`/api/admin/services/${serviceId}`, serviceData),

  /**
   * Supprime un service.
   * @param {string} serviceId - L'ID du service à supprimer
   */
  deleteService: (serviceId) => api.delete(`/api/admin/services/${serviceId}`),

  /**
   * Active/désactive un service.
   * @param {string} serviceId - L'ID du service
   * @param {boolean} active - Nouveau statut
   */
  toggleServiceStatus: (serviceId, active) => 
    api.patch(`/api/admin/services/${serviceId}/toggle`, { active }),

  // --- COMMANDES AVANCÉES ---
  /**
   * Récupère toutes les commandes avec filtres avancés.
   * @param {object} params - Filtres
   */
  getAllOrders: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/api/admin/orders${queryParams ? `?${queryParams}` : ''}`;
    return api.get(url);
  },

  /**
   * Récupère une commande par son ID.
   * @param {string} orderId - L'ID de la commande
   */
  getOrderById: (orderId) => api.get(`/api/admin/orders/${orderId}`),

  /**
   * 🔥 NOUVEAU : Récupère une commande par son code
   * @param {string} orderCode - Le code de la commande (ex: ORD-123456-ABC)
   */
  getOrderByCode: (orderCode) => {
    return api.get(`/api/admin/orders/code/${encodeURIComponent(orderCode)}`);
  },

  /**
   * 🔥 NOUVEAU : Récupère une commande par son ID de transaction
   * @param {string} transactionId - L'ID de transaction
   */
  getOrderByTransaction: (transactionId) => {
    return api.get(`/api/admin/orders/transaction/${encodeURIComponent(transactionId)}`);
  },

  /**
   * 🔥 NOUVEAU : Récupère les commandes par email client
   * @param {string} email - L'email du client
   */
  getOrdersByEmail: (email) => {
    return api.get(`/api/admin/orders/email/${encodeURIComponent(email)}`);
  },

  /**
   * 🔥 NOUVEAU : Récupère une commande par son numéro IMEI
   * @param {string} imei - Le numéro IMEI (15 chiffres)
   */
  getOrderByIMEI: (imei) => {
    return api.get(`/api/admin/orders/imei/${imei}`);
  },

  /**
   * Met à jour le statut d'une commande.
   * @param {string} orderId - L'ID de la commande
   * @param {object} updateData - Données de mise à jour
   */
  updateOrderStatus: (orderId, updateData) => 
    api.patch(`/api/admin/orders/${orderId}`, updateData),

  /**
   * Génère des données pour une commande (clés, identifiants).
   * @param {string} orderId - L'ID de la commande
   * @param {object} generatedData - Les données générées
   */
  generateOrderData: (orderId, generatedData) => 
    api.post(`/api/admin/orders/${orderId}/generate`, { generatedData }),

  /**
   * Récupère les statistiques des commandes.
   */
  getOrderStats: () => api.get('/api/admin/orders/stats'),

  /**
   * Exporte les commandes au format CSV.
   * @param {object} filters - Filtres à appliquer
   */
  exportOrders: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return api.get(`/api/admin/orders/export?${queryParams}`, {
      responseType: 'blob'
    });
  },

  // --- ADMINISTRATEURS ---
  /**
   * Récupère tous les administrateurs.
   */
  getAdmins: () => api.get('/api/admin/users?role=admin'),

  // --- TICKETS SUPPORT ---
  /**
   * Récupère tous les tickets de support.
   */
  getAllTickets: () => api.get('/api/admin/tickets'),

  /**
   * Récupère un ticket spécifique.
   * @param {string} ticketId - L'ID du ticket
   */
  getTicketById: (ticketId) => api.get(`/api/admin/tickets/${ticketId}`),

  /**
   * Met à jour le statut d'un ticket.
   * @param {string} ticketId - L'ID du ticket
   * @param {string} status - Nouveau statut
   */
  updateTicketStatus: (ticketId, status) => 
    api.patch(`/api/admin/tickets/${ticketId}`, { status }),

  // --- PAIEMENTS ---
  /**
   * Récupère tous les paiements.
   */
  getAllPayments: () => api.get('/api/admin/payments'),

  /**
   * Récupère les détails d'un paiement.
   * @param {string} paymentId - L'ID du paiement
   */
  getPaymentById: (paymentId) => api.get(`/api/admin/payments/${paymentId}`),

  // --- LICENCES ---
  /**
   * Récupère toutes les licences.
   */
  getAllLicenses: () => api.get('/api/admin/licenses'),

  /**
   * Génère une nouvelle licence.
   * @param {object} licenseData - Données de la licence
   */
  generateLicense: (licenseData) => api.post('/api/admin/licenses', licenseData),

  // --- STATISTIQUES DASHBOARD ---
  /**
   * Récupère les statistiques complètes du tableau de bord.
   */
  getDashboardStats: () => {
    const token = localStorage.getItem('token');
    return api.get('/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // --- RECHARGE DE BALANCE ---
  /**
   * Recharge la balance d'un utilisateur.
   * @param {object} data - Les données de rechargement (email et montant)
   */
  rechargeUserBalance: async (data) => {
    const response = await api.post('/api/admin/recharge-balance', data);
    return response.data;
  },

  // --- GESTION DES RÔLES ET EMPLOYÉS ---
  /**
   * Change le rôle d'un utilisateur.
   * @param {object} data - Contient email et nouveau rôle
   */
  changeUserRole: async (data) => {
    const response = await api.post('/api/admin/change-role', data);
    return response.data;
  },

  /**
   * Récupère la liste des employés.
   */
  getAllEmployees: async () => {
    const response = await api.get('/api/admin/employees');
    return response.data;
  },

  /**
   * Ajoute un nouvel employé.
   * @param {object} employeeData - Données de l'employé
   */
  addEmployee: (employeeData) => api.post('/api/admin/employees', employeeData),

  /**
   * Supprime un employé.
   * @param {string} employeeId - L'ID de l'employé
   */
  deleteEmployee: (employeeId) => api.delete(`/api/admin/employees/${employeeId}`),

  // --- LOGS ET AUDIT ---
  /**
   * Récupère les logs d'activité.
   * @param {object} params - Filtres (date, utilisateur, action)
   */
  getActivityLogs: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/api/admin/logs${queryParams ? `?${queryParams}` : ''}`);
  }
};

export default adminService;

// ============================================
// UTILITAIRES POUR L'INTERFACE ADMIN
// ============================================

/**
 * Classes pour le menu latéral admin
 */
export const adminNavLinkClass = ({ isActive }) =>
  isActive
    ? 'flex items-center gap-2 py-2 px-3 rounded bg-blue-600 text-white font-bold text-base shadow-lg'
    : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-50 text-blue-700 font-semibold text-base';

/**
 * Classes pour le menu latéral client
 */
export const clientNavLinkClass = ({ isActive }) =>
  isActive
    ? 'flex items-center gap-2 py-2 px-3 rounded bg-blue-100 text-blue-700 font-bold text-base shadow-sm'
    : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-50 text-blue-700 font-semibold text-base';

/**
 * Formate le statut d'une commande pour l'affichage
 * @param {string} status - Le statut brut
 * @returns {object} Configuration du badge
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    'En attente': { 
      label: '⏳ En attente', 
      color: 'text-yellow-800', 
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300'
    },
    'En cours': { 
      label: '🔄 En cours', 
      color: 'text-blue-800', 
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    'Terminé': { 
      label: '✅ Terminé', 
      color: 'text-green-800', 
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    },
    'Annulé': { 
      label: '❌ Annulé', 
      color: 'text-red-800', 
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300'
    },
    'Assigné': { 
      label: '👤 Assigné', 
      color: 'text-purple-800', 
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300'
    }
  };
  return statusMap[status] || { 
    label: status, 
    color: 'text-gray-800', 
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300'
  };
};

/**
 * Formate les champs d'une commande pour l'affichage
 * @param {object} order - La commande
 * @returns {Array} Tableau de champs formatés
 */
export const formatOrderFields = (order) => {
  if (!order || !order.fieldsMetadata) return [];
  
  return order.fieldsMetadata.map(meta => ({
    label: meta.label,
    value: order.fields?.[meta.name] || '',
    type: meta.type
  }));
};
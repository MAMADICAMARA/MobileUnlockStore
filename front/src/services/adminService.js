// src/services/adminService.js
import api from './api';

/**
 * Service pour gérer les opérations spécifiques à l'administration.
 */
const adminService = {
  // --- Utilisateurs ---
  /**
   * Récupère tous les utilisateurs (clients).
   */
  getAllUsers: () => api.get('/api/admin/users'),

  // --- Services ---
  /**
   * Récupère tous les services.
   */
  getAllServices: () => api.get('/api/admin/services'),
  /**
   * Crée un nouveau service.
   * @param {object} serviceData - Les données du service à créer.
   */
  createService: (serviceData) => api.post('/api/admin/services', serviceData),
  /**
   * Met à jour un service existant.
   * @param {string} serviceId - L'ID du service à mettre à jour.
   * @param {object} serviceData - Les nouvelles données du service.
   */
  updateService: (serviceId, serviceData) => api.put(`/api/admin/services/${serviceId}`, serviceData),
  /**
   * Supprime un service.
   * @param {string} serviceId - L'ID du service à supprimer.
   */
  deleteService: (serviceId) => api.delete(`/apa/admin/services/${serviceId}`),

  // --- Commandes ---
  /**
   * Récupère toutes les commandes pour l'admin, avec filtres possibles.
   * @param {object} [filters] - Les filtres à appliquer (ex: { status: 'En cours', search: '...' }).
   */
  getAllOrders: () => api.get('/api/admin/orders'),
  /**
   * Récupère tous les administrateurs.
   */
  getAdmins: () => {
    return api.get('/api/admin/users?role=admin');
  },
  /**
   * Met à jour le statut d'une commande.
   * @param {string} orderId - L'ID de la commande.
   * @param {string} status - Le nouveau statut.
   */
  updateOrderStatus: (orderId, status) => api.put(`/api/admin/orders/${orderId}/status`, { status }),

  // --- Tickets ---
  /**
   * Récupère tous les tickets de support.
   */
  getAllTickets: () => api.get('/api/admin/tickets'),

  // --- Paiements ---
  /**
   * Récupère tous les paiements.
   */
  getAllPayments: () => api.get('/api/admin/payments'),

  // --- Licences ---
  /**
   * Récupère toutes les licences.
   */
  getAllLicenses: () => api.get('/api/admin/licenses'),

  // --- Statistiques du tableau de bord ---
  /**
   * Récupère les statistiques du tableau de bord pour l'admin.
   */
  getDashboardStats: () => {
    const token = localStorage.getItem('token');
    return api.get('/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // --- Recharge de balance ---
  /**
   * Recharge la balance d'un utilisateur.
   * @param {object} data - Les données de rechargement (email et montant).
   */
  rechargeUserBalance: async (data) => {
    const response = await api.post('/api/admin/recharge-balance', data);
    return response.data;
  },

  // --- Gestion des rôles et employés ---
  /**
   * Change le rôle d'un utilisateur
   * @param {object} data - Contient email et nouveau rôle
   */
  changeUserRole: async (data) => {
    const response = await api.post('/api/admin/change-role', data);
    return response.data;
  },

  /**
   * Récupère la liste des employés
   */
  getAllEmployees: async () => {
    const response = await api.get('/api/admin/employees');
    return response.data;
  },
};

export default adminService;

// Exemple d'utilisation pour le menu latéral client (à placer dans ClientLayout ou DashboardPage)
// Pour styliser les liens du menu latéral client en bleu
export const clientNavLinkClass = ({ isActive }) =>
  isActive
    ? 'flex items-center gap-2 py-2 px-3 rounded bg-blue-100 text-blue-700 font-bold text-base shadow-sm'
    : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-50 text-blue-700 font-semibold text-base';

// Utilisation :
// <NavLink to="/client/orders" className={clientNavLinkClass}>Mes commandes</NavLink>
// <NavLink to="/client/licenses" className={clientNavLinkClass}>Mes licences</NavLink>
// <NavLink to="/client/support" className={clientNavLinkClass}>Support</NavLink>

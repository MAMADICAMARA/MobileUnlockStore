// src/services/adminOrderService.js
import api from './api';

const adminOrderService = {
  // Récupérer toutes les commandes avec pagination et filtres
  getAllOrders: async (page = 1, limit = 10, filters = {}) => {
    try {
      // Construction des paramètres de requête
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      
      const response = await api.get(`/admin/orders?${params}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (orderId, status, employeeCode = null) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        status,
        employeeCode
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  },

  // Assigner un employé à une commande
  assignEmployee: async (orderId, employeeId) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/assign`, {
        employeeId
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'assignation:", error);
      throw error;
    }
  },

  // Obtenir les statistiques des commandes
  getOrderStats: async () => {
    try {
      const response = await api.get('/admin/orders/stats');
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      throw error;
    }
  }
};

export default adminOrderService;
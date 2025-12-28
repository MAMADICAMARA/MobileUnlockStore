// src/services/orderService.js
import api from './api';

/**
 * Service pour gérer les opérations liées aux commandes des utilisateurs.
 */
const orderService = {
  /**
   * Récupère l'historique des commandes pour l'utilisateur authentifié.
   * Le backend utilisera le token JWT pour identifier l'utilisateur.
   * @returns {Promise<object>} La réponse de l'API contenant la liste des commandes.
   */
  getOrders: () => {
    return api.get('api/orders/my-orders');
  },
  
  /**
   * Passe une nouvelle commande pour un service.
   * @param {object} orderData - Les données de la commande.
   * @returns {Promise<object>} La réponse de l'API.
   */
  placeOrder: (orderData) => {
    return api.post('api/orders', orderData);
  },

  /**
   * Récupère l'historique des commandes du client connecté.
   */
  getHistory: () => api.get('api/orders/history'),
};

export default orderService;

// src/services/serviceService.js
import api from './api';

/**
 * Service pour gérer les opérations liées aux services (produits).
 */
const serviceService = {
  /**
   * Récupère la liste de tous les services depuis le backend.
   * @returns {Promise<object>} La réponse de l'API contenant la liste des services.
   */
  getServices: () => api.get('/api/services'), // Correction: Le préfixe /api est déjà dans la baseURL d'axios

  /**
   * Récupère un service par son ID.
   * @param {string} id - L'ID du service.
   * @returns {Promise<object>} La réponse de l'API contenant le service.
   */
  getServiceById: (id) => api.get(`/api/services/${id}`),

  /**
   * Passe une nouvelle commande pour un service.
   * @param {object} orderData - Les données de la commande.
   * @param {string} orderData.serviceId - L'ID du service commandé.
   * @param {object} orderData.fields - Les champs spécifiques requis par le service (ex: { imei: '...' }).
   * @returns {Promise<object>} La réponse de l'API confirmant la création de la commande.
   */
  placeOrder: (orderData) => {
    // Note: Le backend doit être configuré pour recevoir ces données
    // et créer une commande associée à l'utilisateur authentifié.
    return api.post('/orders', orderData);
  },

  /**
   * Création, mise à jour ou suppression d'un service (admin).
   * @param {object} data - Les données du service.
   * @param {string} id - L'ID du service (pour la mise à jour ou la suppression).
   * @returns {Promise<object>} La réponse de l'API.
   */
  createService: (data) => api.post('/api/services', data),
  updateService: (id, data) => api.put(`/api/services/${id}`, data),
  deleteService: (id) => api.delete(`/api/services/${id}`)
};

export default serviceService;

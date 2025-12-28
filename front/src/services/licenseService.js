// src/services/licenseService.js
import api from './api';

/**
 * Service pour gérer les opérations liées aux licences logicielles.
 */
const licenseService = {
  /**
   * Récupère les licences de l'utilisateur connecté depuis le backend.
   * @returns {Promise<object>} La réponse de l'API contenant la liste des licences.
   */
  getLicenses: () => {
    return api.get('api/licenses/my-licenses');
  },
};

export default licenseService;

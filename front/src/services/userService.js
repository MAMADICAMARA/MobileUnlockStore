// src/services/userService.js
import api from './api';

/**
 * Service pour gérer les opérations liées au profil utilisateur.
 */
const userService = {
  /**
   * Récupère les données spécifiques à l'employé (code employé, etc.)
   * @returns {Promise<object>} La réponse de l'API contenant les données de l'employé
   */
  getEmployeeData: () => {
    return api.get('api/employee/data');
  },
  /**
   * Récupère les informations du profil de l'utilisateur authentifié.
   * @returns {Promise<object>} La réponse de l'API contenant les données du profil.
   */
  getProfile: () => {
    return api.get('api/users/profile');
  },

  /**
   * Met à jour les informations du profil de l'utilisateur authentifié.
   * @param {object} profileData - Les données à mettre à jour (ex: { name: 'Nouveau Nom' }).
   * @returns {Promise<object>} La réponse de l'API.
   */
  updateProfile: (profileData) => {
    return api.put('api/users/profile', profileData);
  },

  /**
   * Met à jour le mot de passe de l'utilisateur.
   * @param {object} passwordData - L'ancien et le nouveau mot de passe.
   * @param {string} passwordData.currentPassword - Le mot de passe actuel.
   * @param {string} passwordData.newPassword - Le nouveau mot de passe.
   * @returns {Promise<object>} La réponse de l'API.
   */
  changePassword: (passwordData) => {
    return api.put('api/users/change-password', passwordData);
  }
};

export default userService;

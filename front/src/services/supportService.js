// src/services/supportService.js
import api from './api';

const supportService = {
  /**
   * Crée un nouveau ticket de support.
   * @param {object} data - { subject, message }
   */
  createTicket: (data) => {
    return api.post('api/support/tickets', data);
  },

  /**
   * Récupère la liste des tickets de l'utilisateur connecté.
   */
  getTickets: () => {
    return api.get('api/support/tickets');
  },
};

export default supportService;

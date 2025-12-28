// src/services/paymentService.js
import api from './api';

const paymentService = {
  /**
   * Ajoute un paiement (simulation)
   * @param {object} data - { amount, type }
   */
  addPayment: (data) => {
    return api.post('api/payments', data);
  },

  /**
   * Récupère l'historique des paiements de l'utilisateur
   */
  getPayments: () => {
    return api.get('api/payments/my-payments');
  },
};

export default paymentService;

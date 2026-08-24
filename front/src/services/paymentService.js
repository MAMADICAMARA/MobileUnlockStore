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

  // ─── Paiement automatique (nouveau système) ────────────────────────────────
  getSettings:  ()               => api.get('/api/payments/settings'),
  getProviders: ()               => api.get('/api/payments/providers'),
  initiate:     (data)           => api.post('/api/payments/initiate', data),
  getStatus:    (transactionId)  => api.get(`/api/payments/status/${transactionId}`),
  getMyTransactions: ()          => api.get('/api/payments/my-transactions'),
};

export default paymentService;

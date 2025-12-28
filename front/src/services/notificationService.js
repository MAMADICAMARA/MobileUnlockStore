import api from './api';

const notificationService = {
  // Récupérer toutes les notifications (admin)
  getAll: () => api.get('/notifications/all'),
  // Récupérer les notifications du client connecté
  getMine: () => api.get('/notifications/me'),
  // Marquer une notification comme lue
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  // Supprimer une notification
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default notificationService;

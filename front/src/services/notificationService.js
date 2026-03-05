import api from './api';

const notificationService = {
  // Récupérer toutes les notifications (admin)
  getAll: () => api.get('/api/notifications/all'),
  // Récupérer les notifications du client connecté
  getMine: () => api.get('/api/notifications/me'),
  // Marquer une notification comme lue
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  // Supprimer une notification
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

export default notificationService;

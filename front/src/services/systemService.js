// src/services/systemService.js
import api from './api';

const systemService = {
  // ✅ Endpoint public — fonctionne même sans être connecté
  getStatus: () => api.get('/api/system/status'),

  // ✅ Admin uniquement
  setMaintenance: (enabled, message) =>
    api.put('/api/system/maintenance', { enabled, message }),
};

export default systemService;
// src/services/adminService.js
import api from './api';

const adminService = {
  // ─── UTILISATEURS ────────────────────────────────────────────────────────────
  getAllUsers: () => api.get('/api/admin/users'),

  // ─── SERVICES ────────────────────────────────────────────────────────────────
  getAllServices: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/admin/services${q ? `?${q}` : ''}`);
  },
  getServiceById:      (id)         => api.get(`/api/admin/services/${id}`),
  createService:       (data)       => api.post('/api/admin/services', data),
  updateService:       (id, data)   => api.put(`/api/admin/services/${id}`, data),
  deleteService:       (id)         => api.delete(`/api/admin/services/${id}`),
  toggleServiceStatus: (id, active) => api.patch(`/api/admin/services/${id}/toggle`, { active }),

  // ─── COMMANDES ───────────────────────────────────────────────────────────────
  getAllOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/admin/orders${q ? `?${q}` : ''}`);
  },
  getOrderById:          (orderId) => api.get(`/api/orders/admin/${orderId}`),
  updateOrderStatus:     (orderId, newStatus) => api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus }),
  updateOrder:           (orderId, data)      => api.put(`/api/orders/admin/${orderId}`, data),
  getOrderByCode:        (code)  => api.get(`/api/admin/orders/code/${encodeURIComponent(code)}`),
  getOrderByTransaction: (txId)  => api.get(`/api/admin/orders/transaction/${encodeURIComponent(txId)}`),
  getOrdersByEmail:      (email) => api.get(`/api/admin/orders/by-email/${encodeURIComponent(email)}`),
  getOrderByIMEI:        (imei)  => api.get(`/api/admin/orders/imei/${imei}`),
  getOrderStats:         ()      => api.get('/api/admin/orders/stats'),
  exportOrders: (filters = {}) => {
    const q = new URLSearchParams(filters).toString();
    return api.get(`/api/admin/orders/export?${q}`, { responseType: 'blob' });
  },

  // ─── REMBOURSEMENT (Niveau 2) ─────────────────────────────────────────────
  processRefund: (data) => api.post('/api/admin/refund', data),

  // ─── STATISTIQUES DASHBOARD ───────────────────────────────────────────────
  getDashboardStats: () => api.get('/api/admin/dashboard-stats'),

  // ─── RECHARGE BALANCE ─────────────────────────────────────────────────────
  rechargeUserBalance: (data) => api.post('/api/admin/recharge-balance', data),

  // ─── RÔLES & EMPLOYÉS ─────────────────────────────────────────────────────
  changeUserRole:  (data) => api.post('/api/admin/change-role', data),
  getAllEmployees:  ()     => api.get('/api/admin/employees'),
  addEmployee:     (data) => api.post('/api/admin/employees', data),
  deleteEmployee:  (id)   => api.delete(`/api/admin/employees/${id}`),

  // ─── TICKETS ──────────────────────────────────────────────────────────────
  getAllTickets:       ()           => api.get('/api/admin/tickets'),
  getTicketById:      (id)         => api.get(`/api/admin/tickets/${id}`),
  updateTicketStatus: (id, status) => api.patch(`/api/admin/tickets/${id}`, { status }),

  // ─── PAIEMENTS ────────────────────────────────────────────────────────────
  getAllPayments:  ()   => api.get('/api/admin/payments'),
  getPaymentById: (id) => api.get(`/api/admin/payments/${id}`),

  // ─── LICENCES ─────────────────────────────────────────────────────────────
  getAllLicenses:   ()     => api.get('/api/admin/licenses'),
  generateLicense: (data) => api.post('/api/admin/licenses', data),

  // ─── ADMINS ───────────────────────────────────────────────────────────────
  getAdmins: () => api.get('/api/admin/users?role=admin'),

  // ─── LOGS ─────────────────────────────────────────────────────────────────
  getActivityLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/admin/logs${q ? `?${q}` : ''}`);
  },
};

export default adminService;

// ─── Utilitaires UI ──────────────────────────────────────────────────────────

export const adminNavLinkClass = ({ isActive }) =>
  isActive
    ? 'flex items-center gap-2 py-2 px-3 rounded bg-blue-600 text-white font-bold text-base shadow-lg'
    : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-50 text-blue-700 font-semibold text-base';

export const clientNavLinkClass = ({ isActive }) =>
  isActive
    ? 'flex items-center gap-2 py-2 px-3 rounded bg-blue-100 text-blue-700 font-bold text-base shadow-sm'
    : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-50 text-blue-700 font-semibold text-base';

export const formatOrderStatus = (status) => {
  const map = {
    'En cours':   { label: '🔄 En cours',   color: 'text-blue-800',   bgColor: 'bg-blue-100',    borderColor: 'border-blue-300' },
    'Terminé':    { label: '✅ Terminé',     color: 'text-green-800',  bgColor: 'bg-green-100',   borderColor: 'border-green-300' },
    'Annulé':     { label: '❌ Annulé',      color: 'text-red-800',    bgColor: 'bg-red-100',     borderColor: 'border-red-300' },
    'Remboursé':  { label: '💰 Remboursé',   color: 'text-purple-800', bgColor: 'bg-purple-100',  borderColor: 'border-purple-300' },
  };
  return map[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' };
};

// // src/services/adminService.js
// import api from './api';

// const adminService = {
//   // ─── UTILISATEURS ────────────────────────────────────────────────────────────
//   getAllUsers: () => api.get('/api/admin/users'),

//   // ─── SERVICES ────────────────────────────────────────────────────────────────
//   getAllServices: (params = {}) => {
//     const q = new URLSearchParams(params).toString();
//     return api.get(`/api/admin/services${q ? `?${q}` : ''}`);
//   },
//   getServiceById:      (id)         => api.get(`/api/admin/services/${id}`),
//   createService:       (data)       => api.post('/api/admin/services', data),
//   updateService:       (id, data)   => api.put(`/api/admin/services/${id}`, data),
//   deleteService:       (id)         => api.delete(`/api/admin/services/${id}`),
//   toggleServiceStatus: (id, active) => api.patch(`/api/admin/services/${id}/toggle`, { active }),

//   // ─── COMMANDES ───────────────────────────────────────────────────────────────
//   getAllOrders: (params = {}) => {
//     const q = new URLSearchParams(params).toString();
//     return api.get(`/api/admin/orders${q ? `?${q}` : ''}`);
//   },
//   getOrderById:          (orderId) => api.get(`/api/orders/admin/${orderId}`),
//   updateOrderStatus:     (orderId, newStatus) => api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus }),
//   updateOrder:           (orderId, data)      => api.put(`/api/orders/admin/${orderId}`, data),
//   getOrderByCode:        (code)  => api.get(`/api/admin/orders/code/${encodeURIComponent(code)}`),
//   getOrderByTransaction: (txId)  => api.get(`/api/admin/orders/transaction/${encodeURIComponent(txId)}`),
//   getOrdersByEmail:      (email) => api.get(`/api/admin/orders/email/${encodeURIComponent(email)}`),
//   getOrderByIMEI:        (imei)  => api.get(`/api/admin/orders/imei/${imei}`),
//   getOrderStats:         ()      => api.get('/api/admin/orders/stats'),
//   exportOrders: (filters = {}) => {
//     const q = new URLSearchParams(filters).toString();
//     return api.get(`/api/admin/orders/export?${q}`, { responseType: 'blob' });
//   },
//  toggleUserBlock:          (userId) => api.put(`/api/admin/users/${userId}/toggle-block`),
//   toggleMaintenanceAccess: (userId) => api.put(`/api/admin/users/${userId}/maintenance-access`),
//   // ─── REMBOURSEMENT (Niveau 2) ─────────────────────────────────────────────
//   processRefund: (data) => api.post('/api/admin/refund', data),

//   // ─── STATISTIQUES DASHBOARD ───────────────────────────────────────────────
//   getDashboardStats: () => api.get('/api/admin/dashboard-stats'),

//   // ─── RECHARGE BALANCE ─────────────────────────────────────────────────────
//   rechargeUserBalance: (data) => api.post('/api/admin/recharge-balance', data),

//   // ─── RÔLES & EMPLOYÉS ─────────────────────────────────────────────────────
//   changeUserRole:  (data) => api.post('/api/admin/change-role', data),
//   getAllEmployees:  ()     => api.get('/api/admin/employees'),
//   addEmployee:     (data) => api.post('/api/admin/employees', data),
//   deleteEmployee:  (id)   => api.delete(`/api/admin/employees/${id}`),

//   // ─── TICKETS ──────────────────────────────────────────────────────────────
//   getAllTickets:       ()           => api.get('/api/admin/tickets'),
//   getTicketById:      (id)         => api.get(`/api/admin/tickets/${id}`),
//   updateTicketStatus: (id, status) => api.patch(`/api/admin/tickets/${id}`, { status }),

//   // ─── PAIEMENTS ────────────────────────────────────────────────────────────
//   getAllPayments:  ()   => api.get('/api/admin/payments'),
//   getPaymentById: (id) => api.get(`/api/admin/payments/${id}`),

//   // ─── LICENCES ─────────────────────────────────────────────────────────────
//   getAllLicenses:   ()     => api.get('/api/admin/licenses'),
//   generateLicense: (data) => api.post('/api/admin/licenses', data),

//   // ─── ADMINS ───────────────────────────────────────────────────────────────
//   getAdmins: () => api.get('/api/admin/users?role=admin'),

//   // ─── LOGS ─────────────────────────────────────────────────────────────────
//   getActivityLogs: (params = {}) => {
//     const q = new URLSearchParams(params).toString();
//     return api.get(`/api/admin/logs${q ? `?${q}` : ''}`);
//   },
// };

// export default adminService;

// // ─── Utilitaires UI ──────────────────────────────────────────────────────────

// export const adminNavLinkClass = ({ isActive }) =>
//   isActive
//     ? 'flex items-center gap-2 py-2 px-3 rounded bg-blue-600 text-white font-bold text-base shadow-lg'
//     : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-50 text-blue-700 font-semibold text-base';

// export const clientNavLinkClass = ({ isActive }) =>
//   isActive
//     ? 'flex items-center gap-2 py-2 px-3 rounded bg-blue-100 text-blue-700 font-bold text-base shadow-sm'
//     : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-50 text-blue-700 font-semibold text-base';

// export const formatOrderStatus = (status) => {
//   const map = {
//     'En cours': { label: '🔄 En cours', color: 'text-blue-800',  bgColor: 'bg-blue-100',  borderColor: 'border-blue-300' },
//     'Annulé':   { label: '❌ Annulé',   color: 'text-red-800',   bgColor: 'bg-red-100',   borderColor: 'border-red-300' },
//     'Terminé':  { label: '✅ Terminé',  color: 'text-green-800', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
//   };
//   return map[status] || { label: status || '—', color: 'text-gray-800', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' };
// };


import api from './api';

/**
 * Service centralisé pour gérer toutes les opérations liées à l'authentification.
 * Tous les endpoints utilisent le préfixe '/api' (ex: /api/auth/login).
 */
const authService = {
  // Connexion (toujours POST !)
  login: (credentials) => api.post('/api/auth/login', credentials),

  // Inscription
  register: (userData) => api.post('/api/auth/register', userData),

  // Vérification du code d'inscription (activation)
  verifySignupCode: (email, code) => api.post('/api/auth/verify-signup-code', { email, code }),

  // Renvoi du code d'inscription
  resendSignupCode: (email) => api.post('/api/auth/resend-signup-code', { email }),

  // Demande de réinitialisation
  requestReset: (email) => api.post('/api/auth/request-reset', { email }),

  // Vérification du code de réinitialisation
  verifyResetCode: (email, code) => api.post('/api/auth/verify-reset-code', { email, code }),

  // Renvoi du code de réinitialisation
  resendResetCode: (email) => api.post('/api/auth/resend-reset-code', { email }),

  // Profil utilisateur (protégé)
  getProfile: () => api.get('/api/users/profile'),

  // Vérification OTP (étape 2)
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),

  // Renvoi OTP
  resendOtp: (email) => api.post('/api/auth/resend-otp', { email })
};

export default authService;

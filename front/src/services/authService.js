// src/services/authService.js
import api from './api';

/**
 * Service centralisé pour gérer toutes les opérations liées à l'authentification.
 * Tous les endpoints utilisent le préfixe '/api' (ex: /api/auth/login).
 * 
 * OTP / codes de vérification temporairement en pause (18/02/2026)
 */
const authService = {
  // ────────────────────────────── CONNEXION ──────────────────────────────
  login: (credentials) => api.post('/api/auth/login', credentials),

  // ────────────────────────────── INSCRIPTION ──────────────────────────────
  register: (userData) => api.post('/api/auth/register', userData),

  // ────────────────────────────── VÉRIFICATION CODE INSCRIPTION ──────────────────────────────
  /*
  verifySignupCode: (email, code) => api.post('/api/auth/verify-signup-code', { email, code }),

  resendSignupCode: (email) => api.post('/api/auth/resend-signup-code', { email }),
  */

  // Mock quand la fonctionnalité est désactivée
  verifySignupCode: (email, code) => {
    console.log(`[PAUSE] verifySignupCode appelé pour ${email} - code ${code}`);
    return Promise.resolve({ data: { status: 'info', message: 'Vérification code inscription temporairement désactivée' } });
  },

  resendSignupCode: (email) => {
    console.log(`[PAUSE] resendSignupCode appelé pour ${email}`);
    return Promise.resolve({ data: { status: 'info', message: 'Renvoi code inscription désactivé temporairement' } });
  },

  // ────────────────────────────── RESET PASSWORD ──────────────────────────────
  requestReset: (email) => api.post('/api/auth/request-reset', { email }),

  /*
  verifyResetCode: (email, code) => api.post('/api/auth/verify-reset-code', { email, code }),

  resendResetCode: (email) => api.post('/api/auth/resend-reset-code', { email }),
  */

  // Mock quand la fonctionnalité est désactivée
  verifyResetCode: (email, code) => {
    console.log(`[PAUSE] verifyResetCode appelé pour ${email} - code ${code}`);
    return Promise.resolve({ data: { status: 'success', message: 'Vérification code reset bypassée (fonctionnalité en pause)' } });
  },

  resendResetCode: (email) => {
    console.log(`[PAUSE] resendResetCode appelé pour ${email}`);
    return Promise.resolve({ data: { status: 'info', message: 'Renvoi code reset désactivé temporairement' } });
  },

  // ────────────────────────────── OTP LOGIN ──────────────────────────────
  /*
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),

  resendOtp: (email) => api.post('/api/auth/resend-otp', { email }),
  */

  // Mock quand OTP est désactivé
  verifyOtp: (email, otp) => {
    console.log(`[PAUSE] verifyOtp appelé pour ${email} - otp ${otp}`);
    return Promise.resolve({ data: { status: 'info', message: 'Vérification OTP temporairement désactivée' } });
  },

  resendOtp: (email) => {
    console.log(`[PAUSE] resendOtp appelé pour ${email}`);
    return Promise.resolve({ data: { status: 'info', message: 'Renvoi OTP désactivé temporairement' } });
  },

  // ────────────────────────────── PROFIL ──────────────────────────────
  getProfile: () => api.get('/api/users/profile')
};

export default authService;
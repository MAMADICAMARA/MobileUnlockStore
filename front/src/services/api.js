import axios from 'axios';

// Lire la valeur brute depuis les variables d'environnement
// En dev: http://localhost:5000
// En prod: https://mobileunlockstore.onrender.com
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Normaliser : supprimer les slashs de fin
let API_URL = rawUrl.replace(/\/+$/, '');

// Toujours ajouter /api pour pointer vers les routes backend
API_URL = API_URL + '/api';

// Logs utiles pour vérifier en console
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📡 Normalized API base URL:', API_URL);

// Création de l'instance Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token si présent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur côté serveur (4xx, 5xx)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw error.response.data;
    } else if (error.request) {
      // Pas de réponse du serveur
      console.error('Erreur de connexion au serveur:', {
        message: error.message,
        config: error.config
      });
      throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.');
    } else {
      // Autres erreurs
      console.error('Erreur:', error.message);
      throw new Error('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    }
  }
);

export default api;
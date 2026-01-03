import axios from 'axios';

// lire la valeur brute depuis les env
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// normaliser : supprimer slash(s) de fin, puis retirer un suffixe "/api" s'il existe
let API_URL = rawUrl.replace(/\/+$/, '');
API_URL = API_URL.replace(/\/api$/i, ''); // si quelqu'un a mis .../api, on enlève

// utiliser l'URL normalisée (base backend), les appels frontend doivent utiliser '/api/...'
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📡 Normalized API base URL:', API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ex: http://localhost:5000
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Ajout d'un intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur de réponse du serveur (4xx, 5xx)
      
      // Gérer les erreurs d'authentification
      if (error.response.status === 401) {
        // Supprimer le token si l'authentification a échoué
        localStorage.removeItem('token');
        // Rediriger vers la page de connexion si nécessaire
        window.location.href = '/login';
      }
      
      throw error.response.data;
    } else if (error.request) {
      // Erreur de requête (pas de réponse du serveur)
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
    return Promise.reject(error);
  }
);

export default api;

// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNotification } from '../../context/NotificationContext';
// import CodeVerificationModal from './CodeVerificationModal'; // COMMENTÉ

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');           // ← message d'erreur visible sur la page
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/services';

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'employee') {
        navigate('/employee', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(''); // Reset erreur précédente
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login({ email, password });

      const userData = response.data?.data || response.data;
      if (userData?.token) {
        authLogin(userData);
        showNotification('Connexion réussie !', 'success');
        // Redirection immédiate
        if (userData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userData.role === 'employee') {
          navigate('/employee', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err) {
      let errorMessage = 'Une erreur est survenue.';

      // Messages clairs et directs selon le code erreur
      if (err.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Compte non activé. Vérifiez votre email.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      }

      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-center text-gray-900">Connexion</h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Accédez à votre compte MobileUnlockStore
            </p>
          </div>

          {/* Message d'erreur très visible */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Inscrivez-vous ici
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
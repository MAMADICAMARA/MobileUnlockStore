// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNotification } from '../../context/NotificationContext';
// import CodeVerificationModal from './CodeVerificationModal'; // ← COMMENTÉ (modal OTP)

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  // ────────────────────────────── OTP EN PAUSE ──────────────────────────────
  // const [step, setStep] = useState('login');
  // const [otp, setOtp] = useState('');
  // const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  // const [modalEmail, setModalEmail] = useState('');
  // ──────────────────────────────────────────────────────────────────────────

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupérer l'URL de redirection si elle existe
  const from = location.state?.from?.pathname || '/services';

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ Utilisateur déjà authentifié, redirection...', user.role);
      
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
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      
      const response = await authService.login({ email, password });

      // ────────────────────────────── OTP EN PAUSE ──────────────────────────────
      /*
      if (response?.data?.status === 'otp_sent') {
        setModalEmail(email);
        setIsCodeModalOpen(true);
        setStep('otp');
        showNotification('Un code a été envoyé à votre email. Vérifiez votre boîte de réception.', 'info');
      } else 
      */
      // ──────────────────────────────────────────────────────────────────────────

      // Mode sans OTP : on attend directement le token
      const userData = response.data?.data || response.data;
      if (userData?.token) {
        authLogin(userData);
        showNotification('Connexion réussie !', 'success');
        // Redirection selon rôle (comme dans useEffect, mais forcée ici si besoin)
        if (userData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userData.role === 'employee') {
          navigate('/employee', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        throw new Error('Réponse serveur invalide : aucun token reçu');
      }
    } catch (err) {
      console.error('❌ Erreur de connexion:', err?.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError('Email ou mot de passe incorrect.');
      } else if (err.response?.status === 403) {
        setError('Votre compte n\'a pas été confirmé. Veuillez vérifier votre email.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setError('Erreur de connexion. Vérifiez que le serveur est actif.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
      
      showNotification('❌ Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────── OTP EN PAUSE ──────────────────────────────
  /*
  const handleVerifyOtpFromModal = async (emailParam, code) => {
    try {
      setLoading(true);
      const response = await authService.verifyOtp(emailParam, code);
      const token = response?.data?.token || response?.data?.data?.token;
      const userData = response?.data?.data || (token ? { email: emailParam, token } : null);

      if (!token && !userData) {
        throw new Error('Réponse serveur invalide lors de la vérification OTP.');
      }

      authLogin(userData);
      showNotification('✅ Connexion réussie !', 'success');
      setIsCodeModalOpen(false);
      navigate('/profil', { replace: true });
    } catch (err) {
      console.error('❌ Erreur OTP:', err?.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || 'Code invalide.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtpFromModal = async (emailParam) => {
    try {
      setLoading(true);
      await authService.resendOtp(emailParam);
      showNotification('Nouveau code OTP envoyé.', 'info');
    } catch (err) {
      console.error('❌ Erreur renvoi OTP:', err?.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || 'Erreur lors du renvoi.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };
  */
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-center text-gray-900">Connexion</h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Accédez à votre compte GSM Guinea Unlock Store
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formulaire login (mode sans OTP) */}
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
                className="mt-1 block w-full px-3 py-2 text-blue-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-700">
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
                className="mt-1 block w-full px-3 py-2 text-blue-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* ────────────────────────────── OTP EN PAUSE ────────────────────────────── */}
          {/* 
          <CodeVerificationModal
            isOpen={isCodeModalOpen}
            email={modalEmail}
            onVerify={handleVerifyOtpFromModal}
            onResend={handleResendOtpFromModal}
            onClose={() => { setIsCodeModalOpen(false); setStep('login'); }}
            type="login"
          />
          */}
          {/* ────────────────────────────────────────────────────────────────────────── */}

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
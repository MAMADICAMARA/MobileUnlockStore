// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNotification } from '../../context/NotificationContext';
// import CodeVerificationModal from '../../components/CodeVerificationModal'; // ← COMMENTÉ

/**
 * Page d'inscription pour les nouveaux utilisateurs.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // État pour les champs du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // État pour les erreurs, le succès et le chargement
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ────────────────────────────── OTP / CODE EN PAUSE ──────────────────────────────
  // const [showCodeModal, setShowCodeModal] = useState(false);
  // const [pendingEmail, setPendingEmail] = useState('');
  // ────────────────────────────────────────────────────────────────────────────────

  const validateEmail = (email) => /.+@.+\..+/.test(email);
  const validatePassword = (password) => password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  /**
   * Gère la soumission du formulaire d'inscription.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateEmail(email)) {
        throw new Error('Veuillez entrer un email valide.');
      }
      if (!validatePassword(password)) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre.');
      }
      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }

      const response = await authService.register({ name, email, password });

      // ────────────────────────────── OTP / CODE EN PAUSE ──────────────────────────────
      /*
      if (response.data) {
        setPendingEmail(email);
        setShowCodeModal(true);
        setSuccess('Inscription réussie ! Vérifiez votre email pour le code de confirmation.');
        showNotification('success', 'Inscription réussie ! Vérifiez votre email pour le code de confirmation.');
      }
      */
      // ────────────────────────────────────────────────────────────────────────────────

      // Version sans code : inscription directe + message succès
      setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      showNotification('success', 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
      
      // Optionnel : rediriger directement vers login après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'inscription.';
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────── OTP / CODE EN PAUSE ──────────────────────────────
  /*
  const handleVerifyCode = async (email, code) => {
    await authService.verifySignupCode(email, code);
    setShowCodeModal(false);
    showNotification('success', 'Votre compte a été vérifié avec succès !');
    navigate('/login');
  };

  const handleResendCode = async (email) => {
    await authService.resendSignupCode(email);
    showNotification('info', 'Le code de vérification a été renvoyé à votre adresse e-mail.');
  };
  */
  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">Créer un compte</h1>
          
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input 
                id="name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="mt-1 block w-full px-3 py-2 border text-blue-500 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="mt-1 block w-full px-3 py-2 border text-blue-500 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="mt-1 block w-full px-3 py-2 border text-blue-500 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className="mt-1 block w-full px-3 py-2 text-blue-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <button 
                type="submit" 
                disabled={loading || success} 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? 'Création en cours...' : 'S\'inscrire'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600">
            Déjà un compte ? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Connectez-vous</Link>
          </p>
        </div>
      </main>
      <Footer />

      {/* ────────────────────────────── OTP / CODE EN PAUSE ────────────────────────────── */}
      {/* 
      <CodeVerificationModal
        isOpen={showCodeModal}
        email={pendingEmail}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        type="signup"
        onClose={() => setShowCodeModal(false)}
      />
      */}
      {/* ──────────────────────────────────────────────────────────────────────────────── */}
    </div>
  );
};

export default RegisterPage;
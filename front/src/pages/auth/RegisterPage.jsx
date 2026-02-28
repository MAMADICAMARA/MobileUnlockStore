// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCheckCircle, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import authService from '../../services/authService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNotification } from '../../context/NotificationContext';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // État pour les erreurs, le succès et le chargement
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /.+@.+\..+/.test(email);
  const validatePassword = (password) => {
    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      match: password === confirmPassword && password !== ''
    };
  };

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
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.length || !passwordValidation.uppercase || !passwordValidation.number) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre.');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }

      const response = await authService.register({ name, email, password });

      // Version sans code : inscription directe + message succès
      setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      showNotification('success', 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
      
      // Rediriger directement vers login après 2 secondes
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

  const passwordValidation = validatePassword(password);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative">
          {/* Badge premium */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <HiOutlineSparkles className="w-4 h-4" />
              <span>NOUVEAU COMPTE</span>
            </div>
          </div>

          {/* Carte principale */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
            {/* En-tête */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
                Rejoignez-nous
              </h1>
              <p className="text-sm text-white/70">
                Créez votre compte et commencez l'aventure
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="relative p-4 bg-red-500/10 border border-red-500/20 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"></div>
                <p className="relative text-red-200 text-sm font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Message de succès */}
            {success && (
              <div className="relative p-4 bg-green-500/10 border border-green-500/20 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"></div>
                <p className="relative text-green-200 text-sm font-medium text-center">
                  {success}
                </p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                {/* Champ Nom */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom complet"
                    required
                    disabled={loading || success}
                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
                </div>

                {/* Champ Email */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    required
                    disabled={loading || success}
                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
                </div>

                {/* Champ Mot de passe */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                    disabled={loading || success}
                    className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 disabled:opacity-50 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                    ) : (
                      <FiEye className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400 to-amber-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
                </div>

                {/* Champ Confirmation */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCheckCircle className="h-5 w-5 text-white/40 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    required
                    disabled={loading || success}
                    className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                    ) : (
                      <FiEye className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-cyan-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
                </div>
              </div>

              {/* Validation du mot de passe */}
              {password && (
                <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-white/60 mb-2">Le mot de passe doit contenir :</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.length ? 'bg-green-400' : 'bg-white/20'}`}></div>
                    <span className={`text-xs ${passwordValidation.length ? 'text-green-400' : 'text-white/40'}`}>6 caractères minimum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.uppercase ? 'bg-green-400' : 'bg-white/20'}`}></div>
                    <span className={`text-xs ${passwordValidation.uppercase ? 'text-green-400' : 'text-white/40'}`}>Une majuscule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.number ? 'bg-green-400' : 'bg-white/20'}`}></div>
                    <span className={`text-xs ${passwordValidation.number ? 'text-green-400' : 'text-white/40'}`}>Un chiffre</span>
                  </div>
                </div>
              )}

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={loading || success}
                className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 p-[2px] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
              >
                <div className="relative flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-900 rounded-xl group-hover:bg-opacity-90 transition-all duration-300">
                  <span>{loading ? 'Création en cours...' : "S'inscrire"}</span>
                  {!loading && !success && <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-transparent text-white/40">ou</span>
              </div>
            </div>

            {/* Lien de connexion */}
            <p className="text-center text-sm text-white/60">
              Déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="font-medium text-white hover:text-cyan-400 transition-colors relative group"
              >
                Connectez-vous
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
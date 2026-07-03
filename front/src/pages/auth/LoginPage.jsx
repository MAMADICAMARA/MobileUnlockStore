// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData]       = useState({ email: '', password: '' });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  // ✅ État 2FA — quand true, affiche le champ de code
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'admin' || user.role === 'utilisateur-employer'
        ? '/admin/dashboard'
        : '/client/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        email:    formData.email.trim(),
        password: formData.password,
      };

      // ✅ Si le 2FA est requis, inclure le code dans la requête
      if (twoFactorRequired && twoFactorCode) {
        payload.twoFactorCode = twoFactorCode.trim();
      }

      const response = await api.post('/api/auth/login', payload);
      const data = response.data;

      // ✅ Le serveur demande le code 2FA
      if (data.twoFactorRequired) {
        setTwoFactorRequired(true);
        setLoading(false);
        return;
      }

      // ✅ Connexion réussie
      const role = (data.role || '').toLowerCase();
      login({ ...data, role });

      const dest = role === 'admin' || role === 'utilisateur-employer'
        ? '/admin/dashboard'
        : '/client/dashboard';
      navigate(dest, { replace: true });

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la connexion.';
      setError(msg);
      // Si le code 2FA était mauvais, ne pas réinitialiser twoFactorRequired
      if (!twoFactorRequired) setTwoFactorRequired(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo / titre */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {twoFactorRequired ? 'Vérification 2FA' : 'Connexion'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {twoFactorRequired
              ? 'Ouvrez Google Authenticator et entrez le code'
              : 'Connectez-vous à votre compte'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">

          {/* ── Étape 1 : Email + mot de passe ── */}
          {!twoFactorRequired && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required autoComplete="email"
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange} required
                    autoComplete="current-password" placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connexion...</>
                  : <><LogIn className="w-5 h-5" /> Se connecter</>}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  S'inscrire
                </Link>
              </p>
            </form>
          )}

          {/* ── Étape 2 : Code 2FA ── */}
          {twoFactorRequired && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <Shield className="w-10 h-10 text-blue-500" />
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                  Ouvrez <strong>Google Authenticator</strong> ou <strong>Authy</strong> et entrez le code à 6 chiffres.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Code de vérification
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={twoFactorCode}
                    onChange={e => { setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    placeholder="000000" maxLength={6} autoFocus inputMode="numeric"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg tracking-widest font-mono text-center" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || twoFactorCode.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Vérification...</>
                  : <><Shield className="w-5 h-5" /> Vérifier</>}
              </button>

              <button type="button" onClick={() => { setTwoFactorRequired(false); setTwoFactorCode(''); setError(''); }}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                ← Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

// // src/pages/auth/LoginPage.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
// import { HiOutlineSparkles } from 'react-icons/hi';
// import useAuth from '../../hooks/useAuth';
// import authService from '../../services/authService';
// import Header from '../../components/Header';
// import Footer from '../../components/Footer';
// import { useNotification } from '../../context/NotificationContext';

// // ✅ Fonction centralisée de redirection selon le rôle
// const getRedirectPath = (role) => {
//   switch (role) {
//     case 'admin':              return '/admin/dashboard';
//     case 'utilisateur-employer': return '/employee/dashboard'; // ✅ corrigé /employer → /employee
//     case 'client':
//     default:                   return '/client/dashboard';
//   }
// };

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login: authLogin, user, isAuthenticated } = useAuth();
//   const { showNotification } = useNotification();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // ✅ Redirection automatique si déjà connecté (ex: retour sur /login)
//   useEffect(() => {
//     if (isAuthenticated && user?.role) {
//       const target = getRedirectPath(user.role);
//       console.log('[LOGIN] Déjà authentifié → redirection vers:', target);
//       navigate(target, { replace: true });
//     }
//   }, [isAuthenticated, user, navigate]);

//   const handleLogin = async (event) => {
//     event.preventDefault();
//     setError('');
//     setLoading(true);

//     if (!email.trim() || !password.trim()) {
//       setError('Veuillez remplir tous les champs.');
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log('[LOGIN] Tentative connexion:', email);
//       const response = await authService.login({ email, password });

//       // ✅ Extraire les données (supporte { data: { token, user } } ou { data: { token, role, ... } })
//       const payload = response.data?.data || response.data;
//       console.log('[LOGIN] Payload reçu:', payload);

//       if (!payload?.token) {
//         throw new Error('Aucun token dans la réponse du serveur.');
//       }

//       // ✅ Récupérer le rôle — depuis payload.user ou payload directement
//       const userData = {
//         token: payload.token,
//         _id:   payload.user?._id   || payload._id   || payload.id,
//         name:  payload.user?.name  || payload.name  || '',
//         email: payload.user?.email || payload.email || email,
//         role:  (payload.user?.role  || payload.role  || 'client').toLowerCase(),
//         balance: payload.user?.balance ?? payload.balance ?? 0,
//         isMaintenanceAllowed: payload.user?.isMaintenanceAllowed ?? payload.isMaintenanceAllowed ?? false,
//       };

//       console.log('[LOGIN] Utilisateur avec rôle:', userData.role);

//       // ✅ Mettre à jour le contexte (qui sauvegarde aussi dans localStorage)
//       authLogin(userData);
//       showNotification('Connexion réussie !', 'success');

//       // ✅ Redirection immédiate — pas de setTimeout pour éviter les conflits avec useEffect
//       const target = getRedirectPath(userData.role);
//       console.log('[LOGIN] Redirection vers:', target);
//       navigate(target, { replace: true });

//     } catch (err) {
//       console.error('[LOGIN] Erreur:', err);
//       const errorMessage =
//         err.message === 'Aucun token dans la réponse du serveur.' ? err.message :
//         err.response?.status === 401 ? 'Email ou mot de passe incorrect.' :
//         err.response?.status === 403 ? 'Compte non activé. Vérifiez votre email.' :
//         err.response?.data?.message || err.message || 'Une erreur est survenue.';

//       setError(errorMessage);
//       showNotification(errorMessage, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       <Header />
//       <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
//         {/* Éléments décoratifs */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//         </div>

//         <div className="w-full max-w-md relative">
//           {/* Badge */}
//           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
//             <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
//               <HiOutlineSparkles className="w-4 h-4" />
//               <span>ESPACE SÉCURISÉ</span>
//             </div>
//           </div>

//           {/* Carte */}
//           <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
//             <div className="text-center space-y-2">
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
//                 Content de vous revoir
//               </h1>
//               <p className="text-sm text-white/70">Accédez à votre espace personnel</p>
//             </div>

//             {/* Erreur */}
//             {error && (
//               <div className="relative p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
//                 <p className="text-red-200 text-sm font-medium text-center">{error}</p>
//               </div>
//             )}

//             {/* Formulaire */}
//             <form onSubmit={handleLogin} className="space-y-5">
//               <div className="space-y-4">
//                 {/* Email */}
//                 <div className="relative group">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FiMail className="h-5 w-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
//                   </div>
//                   <input
//                     id="email"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="exemple@email.com"
//                     required
//                     disabled={loading}
//                     className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 transition-all duration-300"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
//                 </div>

//                 {/* Mot de passe */}
//                 <div className="relative group">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FiLock className="h-5 w-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
//                   </div>
//                   <input
//                     id="password"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="••••••••"
//                     required
//                     disabled={loading}
//                     className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 disabled:opacity-50 transition-all duration-300"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400 to-amber-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
//                 </div>
//               </div>

//               {/* Options */}
//               <div className="flex items-center justify-between">
//                 <label className="flex items-center">
//                   <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0" />
//                   <span className="ml-2 text-sm text-white/70">Se souvenir de moi</span>
//                 </label>
//                 <Link to="/forgot-password" className="text-sm text-white/70 hover:text-white transition-colors">
//                   Mot de passe oublié ?
//                 </Link>
//               </div>

//               {/* Bouton */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 p-[2px] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
//               >
//                 <div className="relative flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-900 rounded-xl group-hover:bg-opacity-90 transition-all duration-300">
//                   <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
//                   {!loading && <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
//                 </div>
//               </button>
//             </form>

//             {/* Séparateur */}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-white/10"></div>
//               </div>
//               <div className="relative flex justify-center text-xs">
//                 <span className="px-4 bg-transparent text-white/40">ou</span>
//               </div>
//             </div>

//             {/* Inscription */}
//             <p className="text-center text-sm text-white/60">
//               Nouveau chez nous ?{' '}
//               <Link to="/register" className="font-medium text-white hover:text-cyan-400 transition-colors">
//                 Créer un compte
//               </Link>
//             </p>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default LoginPage;



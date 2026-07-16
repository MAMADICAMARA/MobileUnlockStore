// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, KeyRound } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import systemService from '../../services/systemService';

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
      const isAdmin = role === 'admin';
      const isMaintenanceAllowed = !!data.isMaintenanceAllowed;

      // ✅ Vérifier le mode maintenance AVANT de connecter le client
      if (!isAdmin && !isMaintenanceAllowed) {
        try {
          const sysRes = await systemService.getStatus();
          if (sysRes.data?.maintenanceMode) {
            setError('Le site est en maintenance. Veuillez réessayer plus tard.');
            setLoading(false);
            return;
          }
        } catch {
          // Si l'API système est inaccessible, on laisse passer
        }
      }

      login({ ...data, role });

      const dest = isAdmin || role === 'utilisateur-employer'
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
// import { useNavigate, Link } from 'react-router-dom';
// import { Eye, EyeOff, LogIn, Shield, KeyRound } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import api from '../../services/api';

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const { login, isAuthenticated, user } = useAuth();

//   const [formData, setFormData]       = useState({ email: '', password: '' });
//   const [twoFactorCode, setTwoFactorCode] = useState('');
//   const [showPassword, setShowPassword]   = useState(false);
//   const [loading, setLoading]             = useState(false);
//   const [error, setError]                 = useState('');
//   // ✅ État 2FA — quand true, affiche le champ de code
//   const [twoFactorRequired, setTwoFactorRequired] = useState(false);

//   // Rediriger si déjà connecté
//   useEffect(() => {
//     if (isAuthenticated && user) {
//       const dest = user.role === 'admin' || user.role === 'utilisateur-employer'
//         ? '/admin/dashboard'
//         : '/client/dashboard';
//       navigate(dest, { replace: true });
//     }
//   }, [isAuthenticated, user, navigate]);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const payload = {
//         email:    formData.email.trim(),
//         password: formData.password,
//       };

//       // ✅ Si le 2FA est requis, inclure le code dans la requête
//       if (twoFactorRequired && twoFactorCode) {
//         payload.twoFactorCode = twoFactorCode.trim();
//       }

//       const response = await api.post('/api/auth/login', payload);
//       const data = response.data;

//       // ✅ Le serveur demande le code 2FA
//       if (data.twoFactorRequired) {
//         setTwoFactorRequired(true);
//         setLoading(false);
//         return;
//       }

//       // ✅ Connexion réussie
//       const role = (data.role || '').toLowerCase();
//       login({ ...data, role });

//       const dest = role === 'admin' || role === 'utilisateur-employer'
//         ? '/admin/dashboard'
//         : '/client/dashboard';
//       navigate(dest, { replace: true });

//     } catch (err) {
//       const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la connexion.';
//       setError(msg);
//       // Si le code 2FA était mauvais, ne pas réinitialiser twoFactorRequired
//       if (!twoFactorRequired) setTwoFactorRequired(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-md">

//         {/* Logo / titre */}
//         <div className="text-center mb-8">
//           <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//             <LogIn className="w-7 h-7 text-white" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             {twoFactorRequired ? 'Vérification 2FA' : 'Connexion'}
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
//             {twoFactorRequired
//               ? 'Ouvrez Google Authenticator et entrez le code'
//               : 'Connectez-vous à votre compte'}
//           </p>
//         </div>

//         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">

//           {/* ── Étape 1 : Email + mot de passe ── */}
//           {!twoFactorRequired && (
//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
//                   Email
//                 </label>
//                 <input type="email" name="email" value={formData.email}
//                   onChange={handleChange} required autoComplete="email"
//                   placeholder="votre@email.com"
//                   className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
//                   Mot de passe
//                 </label>
//                 <div className="relative">
//                   <input type={showPassword ? 'text' : 'password'} name="password"
//                     value={formData.password} onChange={handleChange} required
//                     autoComplete="current-password" placeholder="••••••••"
//                     className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
//                   <button type="button" onClick={() => setShowPassword(v => !v)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>

//               {error && (
//                 <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
//                   <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
//                 </div>
//               )}

//               <button type="submit" disabled={loading}
//                 className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
//                 {loading
//                   ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connexion...</>
//                   : <><LogIn className="w-5 h-5" /> Se connecter</>}
//               </button>

//               <p className="text-center text-sm text-gray-500 dark:text-gray-400">
//                 Pas encore de compte ?{' '}
//                 <Link to="/register" className="text-blue-600 hover:underline font-medium">
//                   S'inscrire
//                 </Link>
//               </p>
//             </form>
//           )}

//           {/* ── Étape 2 : Code 2FA ── */}
//           {twoFactorRequired && (
//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
//                 <Shield className="w-10 h-10 text-blue-500" />
//                 <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
//                   Ouvrez <strong>Google Authenticator</strong> ou <strong>Authy</strong> et entrez le code à 6 chiffres.
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
//                   Code de vérification
//                 </label>
//                 <div className="relative">
//                   <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input type="text" value={twoFactorCode}
//                     onChange={e => { setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
//                     placeholder="000000" maxLength={6} autoFocus inputMode="numeric"
//                     className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg tracking-widest font-mono text-center" />
//                 </div>
//               </div>

//               {error && (
//                 <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
//                   <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
//                 </div>
//               )}

//               <button type="submit" disabled={loading || twoFactorCode.length !== 6}
//                 className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
//                 {loading
//                   ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Vérification...</>
//                   : <><Shield className="w-5 h-5" /> Vérifier</>}
//               </button>

//               <button type="button" onClick={() => { setTwoFactorRequired(false); setTwoFactorCode(''); setError(''); }}
//                 className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
//                 ← Retour à la connexion
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

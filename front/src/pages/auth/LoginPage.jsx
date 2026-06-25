// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNotification } from '../../context/NotificationContext';

// ✅ Fonction centralisée de redirection selon le rôle
const getRedirectPath = (role) => {
  switch (role) {
    case 'admin':              return '/admin/dashboard';
    case 'utilisateur-employer': return '/employee/dashboard'; // ✅ corrigé /employer → /employee
    case 'client':
    default:                   return '/client/dashboard';
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Redirection automatique si déjà connecté (ex: retour sur /login)
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const target = getRedirectPath(user.role);
      console.log('[LOGIN] Déjà authentifié → redirection vers:', target);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    try {
      console.log('[LOGIN] Tentative connexion:', email);
      const response = await authService.login({ email, password });

      // ✅ Extraire les données (supporte { data: { token, user } } ou { data: { token, role, ... } })
      const payload = response.data?.data || response.data;
      console.log('[LOGIN] Payload reçu:', payload);

      if (!payload?.token) {
        throw new Error('Aucun token dans la réponse du serveur.');
      }

      // ✅ Récupérer le rôle — depuis payload.user ou payload directement
      const userData = {
        token: payload.token,
        _id:   payload.user?._id   || payload._id   || payload.id,
        name:  payload.user?.name  || payload.name  || '',
        email: payload.user?.email || payload.email || email,
        role:  (payload.user?.role  || payload.role  || 'client').toLowerCase(), // Normaliser le rôle en minuscules
        balance: payload.user?.balance ?? payload.balance ?? 0,
      };

      console.log('[LOGIN] Utilisateur avec rôle:', userData.role);

      // ✅ Mettre à jour le contexte (qui sauvegarde aussi dans localStorage)
      authLogin(userData);
      showNotification('Connexion réussie !', 'success');

      // ✅ Redirection immédiate — pas de setTimeout pour éviter les conflits avec useEffect
      const target = getRedirectPath(userData.role);
      console.log('[LOGIN] Redirection vers:', target);
      navigate(target, { replace: true });

    } catch (err) {
      console.error('[LOGIN] Erreur:', err);
      const errorMessage =
        err.message === 'Aucun token dans la réponse du serveur.' ? err.message :
        err.response?.status === 401 ? 'Email ou mot de passe incorrect.' :
        err.response?.status === 403 ? 'Compte non activé. Vérifiez votre email.' :
        err.response?.data?.message || err.message || 'Une erreur est survenue.';

      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative">
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <HiOutlineSparkles className="w-4 h-4" />
              <span>ESPACE SÉCURISÉ</span>
            </div>
          </div>

          {/* Carte */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
                Content de vous revoir
              </h1>
              <p className="text-sm text-white/70">Accédez à votre espace personnel</p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="relative p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-200 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                {/* Email */}
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
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
                </div>

                {/* Mot de passe */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 disabled:opacity-50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400 to-amber-400 opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none blur-xl"></div>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0" />
                  <span className="ml-2 text-sm text-white/70">Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-white/70 hover:text-white transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 p-[2px] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
              >
                <div className="relative flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-900 rounded-xl group-hover:bg-opacity-90 transition-all duration-300">
                  <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
                  {!loading && <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
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

            {/* Inscription */}
            <p className="text-center text-sm text-white/60">
              Nouveau chez nous ?{' '}
              <Link to="/register" className="font-medium text-white hover:text-cyan-400 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;




// //voila le contenu complet de loginPage.jsx.
// //je veut la version corrigé.

// // src/pages/auth/LoginPage.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { FiMail, FiLock, FiLogIn, FiArrowRight } from 'react-icons/fi';
// import { HiOutlineSparkles } from 'react-icons/hi';
// import useAuth from '../../hooks/useAuth';
// import authService from '../../services/authService';
// import Header from '../../components/Header';
// import Footer from '../../components/Footer';
// import { useNotification } from '../../context/NotificationContext';

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login: authLogin, user, isAuthenticated } = useAuth();
//   const { showNotification } = useNotification();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const from = location.state?.from?.pathname || '/services';

//   // Redirection automatique une fois l'état auth vraiment à jour
//   useEffect(() => {
//     if (isAuthenticated && user) {
//       console.log('[LOGIN] Authentification confirmée dans useEffect → rôle:', user.role);

//       let target = '/profil';

//       if (user.role === 'admin') {
//         target = '/admin/dashboard';
//       } else if (user.role === 'utilisateur-employer') {
//         target = '/employer/dashboard';
//       } else {
//         target = '/client/dashboard';
//       }

//       console.log('[LOGIN] Redirection vers:', target);
//       navigate(target, { replace: true });
//     }
//   }, [isAuthenticated, user, navigate]);

//   // src/pages/auth/LoginPage.jsx
// // Modifie la fonction handleLogin

// const handleLogin = async (event) => {
//   event.preventDefault();
//   setError('');
//   setLoading(true);

//   if (!email.trim() || !password.trim()) {
//     setError('Veuillez remplir tous les champs.');
//     setLoading(false);
//     return;
//   }

//   try {
//     console.log('[LOGIN] Tentative connexion:', email);
//     const response = await authService.login({ email, password });

//     // Extraire les données
//     const userData = response.data?.data || response.data;
//     console.log('[LOGIN] Réponse reçue brute:', userData);

//     if (!userData?.token) {
//       throw new Error('Aucun token dans la réponse');
//     }

//     // 🔥 SOLUTION : Vérifier si le rôle existe, sinon le définir
//     if (!userData.role) {
//       console.warn('[LOGIN] ⚠️ Rôle non trouvé dans la réponse API!');
      
//       // Essayer de décoder le token pour récupérer le rôle
//       try {
//         const token = userData.token;
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const decodedToken = JSON.parse(atob(base64));
        
//         console.log('[LOGIN] Token décodé:', decodedToken);
        
//         // Récupérer le rôle depuis le token
//         userData.role = decodedToken.role || 'client';
//         userData.id = decodedToken.id || decodedToken._id || userData.id;
//         userData.email = decodedToken.email || userData.email;
//         userData.name = decodedToken.name || decodedToken.username || userData.name;
//       } catch (e) {
//         console.error('[LOGIN] Erreur décodage token:', e);
//         userData.role = 'client'; // Rôle par défaut
//       }
//     }

//     console.log('[LOGIN] Données enrichies avec rôle:', userData.role);

//     // Sauvegarder dans localStorage
//     localStorage.setItem('token', userData.token);
//     localStorage.setItem('user', JSON.stringify(userData));

//     // Mettre à jour le contexte
//     authLogin(userData);
//     showNotification('Connexion réussie !', 'success');

//     // Redirection basée sur le rôle
//     setTimeout(() => {
//       let target = '/client/dashboard';
      
//       if (userData.role === 'admin') {
//         target = '/admin/dashboard';
//       } else if (userData.role === 'utilisateur-employer') {
//         target = '/employee/dashboard';
//       }
      
//       console.log('[LOGIN] Redirection vers:', target);
//       navigate(target, { replace: true });
//     }, 400);

//   } catch (err) {
//     console.error('[LOGIN] Erreur:', err);
//     let errorMessage = 'Une erreur est survenue.';
//     if (err.response?.status === 401) {
//       errorMessage = 'Email ou mot de passe incorrect.';
//     } else if (err.response?.status === 403) {
//       errorMessage = 'Compte non activé. Vérifiez votre email.';
//     } else if (err.response?.data?.message) {
//       errorMessage = err.response.data.message;
//     }
//     setError(errorMessage);
//     showNotification(errorMessage, 'error');
//   } finally {
//     setLoading(false);
//   }
// };

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
//           {/* Badge premium */}
//           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
//             <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
//               <HiOutlineSparkles className="w-4 h-4" />
//               <span>ESPACE SÉCURISÉ</span>
//             </div>
//           </div>

//           {/* Carte principale */}
//           <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
//             {/* En-tête */}
//             <div className="text-center space-y-2">
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
//                 Content de vous revoir
//               </h1>
//               <p className="text-sm text-white/70">
//                 Accédez à votre espace personnel
//               </p>
//             </div>

//             {/* Message d'erreur */}
//             {error && (
//               <div className="relative p-4 bg-red-500/10 border border-red-500/20 rounded-xl overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"></div>
//                 <p className="relative text-red-200 text-sm font-medium text-center">
//                   {error}
//                 </p>
//               </div>
//             )}

//             {/* Formulaire */}
//             <form onSubmit={handleLogin} className="space-y-5">
//               <div className="space-y-4">
//                 {/* Champ Email */}
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

//                 {/* Champ Mot de passe */}
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

//               {/* Options supplémentaires */}
//               <div className="flex items-center justify-between">
//                 <label className="flex items-center">
//                   <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 transition-colors" />
//                   <span className="ml-2 text-sm text-white/70">Se souvenir de moi</span>
//                 </label>
//                 <Link 
//                   to="/forgot-password" 
//                   className="text-sm text-white/70 hover:text-white transition-colors relative group"
//                 >
//                   Mot de passe oublié ?
//                   <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
//                 </Link>
//               </div>

//               {/* Bouton de connexion */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 p-[2px] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
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

//             {/* Lien d'inscription */}
//             <p className="text-center text-sm text-white/60">
//               Nouveau chez nous ?{' '}
//               <Link 
//                 to="/register" 
//                 className="font-medium text-white hover:text-cyan-400 transition-colors relative group"
//               >
//                 Créer un compte
//                 <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
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
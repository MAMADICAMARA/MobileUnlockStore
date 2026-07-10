// src/pages/client/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  User, Mail, CreditCard, Calendar, Shield, Edit3,
  Save, X, Eye, EyeOff, CheckCircle, AlertCircle, Lock
} from 'lucide-react';
import api from '../../services/api';
import TwoFactorSection from '../../components/TwoFactorSection';

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d))
  : '—';

const fmtCurrency = (n) =>
  `${new Intl.NumberFormat('fr-FR').format(n || 0)} FG`;

// ─── Page Profil ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, login, token } = useAuth();
  const [searchParams] = useSearchParams();

  // ✅ Permet d'arriver directement sur l'onglet Sécurité via ?tab=security
  // (ex: lien "Activer le 2FA" depuis la page de recharge de fonds)
  const [activeTab, setActiveTab]   = useState(searchParams.get('tab') === 'security' ? 'security' : 'profile');
  const [editing, setEditing]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState({ type: '', text: '' });
  const [twoFaUser, setTwoFaUser]   = useState(null);
  // ✅ Profil complet depuis l'API (createdAt, etc. absents du JWT)
  const [profile, setProfile]       = useState(null);

  const [formData, setFormData] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false, newP: false, confirm: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '' });
      setTwoFaUser(user);
    }
  }, [user]);

  // ✅ Fetcher le profil complet depuis l'API au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/auth/profile');
        setProfile(res.data.user);
        setTwoFaUser(res.data.user);
        setFormData({ name: res.data.user.name || '', email: res.data.user.email || '' });
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      }
    };
    fetchProfile();
  }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // ── Mettre à jour le profil ───────────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { showMsg('error', 'Le nom est requis.'); return; }
    setLoading(true);
    try {
      const res = await api.put('/api/auth/profile', {
        name:  formData.name.trim(),
        email: formData.email.trim(),
      });
      // Mettre à jour le contexte auth
      login({ ...res.data.user, token });
      showMsg('success', 'Profil mis à jour avec succès.');
      setEditing(false);
    } catch (err) {
      showMsg('error', err?.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  // ── Changer le mot de passe ───────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      showMsg('error', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMsg('error', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword:     passwordData.newPassword,
      });
      showMsg('success', 'Mot de passe changé avec succès.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMsg('error', err?.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile',  label: 'Profil',   icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto pb-8 space-y-5">

      {/* ── Avatar + infos rapides ── */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">{user?.name || '—'}</h1>
            <p className="text-blue-100 text-sm truncate">{user?.email || '—'}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold capitalize">
                {user?.role || 'client'}
              </span>
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                {fmtCurrency(user?.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setActiveTab(id); setEditing(false); setMessage({ type: '', text: '' }); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Message feedback ── */}
      {message.text && (
        <div className={`p-3 rounded-xl flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          <p className={`text-sm ${message.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {message.text}
          </p>
        </div>
      )}

      {/* ────────────────── ONGLET PROFIL ────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-4">

          {/* Infos profil */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Informations personnelles</h2>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> Modifier
                </button>
              )}
            </div>

            <div className="p-5">
              {!editing ? (
                <div className="space-y-4">
                  {[
                    { icon: User,       label: 'Nom complet',   value: profile?.name    || user?.name },
                    { icon: Mail,       label: 'Email',         value: profile?.email   || user?.email },
                    { icon: CreditCard, label: 'Solde',         value: fmtCurrency(profile?.balance ?? user?.balance) },
                    { icon: Calendar,   label: 'Membre depuis', value: fmtDate(profile?.createdAt) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nom complet</label>
                    <input type="text" value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                    <input type="email" value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Enregistrer</>}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setFormData({ name: user?.name || '', email: user?.email || '' }); }}
                      className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── ONGLET SÉCURITÉ ────────────────── */}
      {activeTab === 'security' && (
        <div className="space-y-4">

          {/* Changer mot de passe */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <Lock className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Changer le mot de passe</h2>
            </div>
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {[
                { key: 'currentPassword', label: 'Mot de passe actuel', showKey: 'current' },
                { key: 'newPassword',     label: 'Nouveau mot de passe', showKey: 'newP' },
                { key: 'confirmPassword', label: 'Confirmer le nouveau', showKey: 'confirm' },
              ].map(({ key, label, showKey }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                  <div className="relative">
                    <input type={showPasswords[showKey] ? 'text' : 'password'}
                      value={passwordData[key]}
                      onChange={e => setPasswordData(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                    <button type="button"
                      onClick={() => setShowPasswords(p => ({ ...p, [showKey]: !p[showKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPasswords[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Lock className="w-4 h-4" /> Changer le mot de passe</>}
              </button>
            </form>
          </div>

          {/* ✅ 2FA — intégré dans l'onglet Sécurité */}
          <TwoFactorSection
            user={twoFaUser}
            onStatusChange={(update) => setTwoFaUser(prev => ({ ...prev, ...update }))}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

// // src/pages/client/ProfilePage.jsx
// import { useState, useEffect } from 'react';
// import { 
//   User, 
//   Mail, 
//   Lock, 
//   Eye, 
//   EyeOff, 
//   Briefcase, 
//   Shield, 
//   Key,
//   CheckCircle,
//   AlertCircle,
//   RefreshCw,
//   Info // ← ajouté pour l'icône d'information
// } from 'lucide-react';
// import useAuth from '../../hooks/useAuth';
// import userService from '../../services/userService';
// import CodeVerificationModal from '../auth/CodeVerificationModal';

// const ProfilePage = () => {
//   const { user } = useAuth();
//   const [showEmployeeCode, setShowEmployeeCode] = useState(false);
//   const [employeeCode, setEmployeeCode] = useState('');
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
//   const [loadingPassword, setLoadingPassword] = useState(false);
//   const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
//   const [employeeData, setEmployeeData] = useState(null);
//   const [activeTab, setActiveTab] = useState('profile');

//   // Charger les données employé si besoin
//   useEffect(() => {
//     const fetchEmployeeData = async () => {
//       if (!user) return;
//       if (user.role === 'utilisateur-employer') {
//         try {
//           const response = await userService.getEmployeeData();
//           if (response.data.success) {
//             setEmployeeData(response.data);
//             setEmployeeCode(response.data.employeeCode || '');
//           }
//         } catch (error) {
//           console.error('Erreur chargement données employé:', error);
//         }
//       }
//     };
//     fetchEmployeeData();
//   }, [user]);

//   // Remplir les champs depuis l'utilisateur
//   useEffect(() => {
//     if (user) {
//       setName(user.name || '');
//       setEmail(user.email || '');
//     }
//   }, [user]);

//   // Gestion du changement de mot de passe (envoi du code)
//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     if (newPassword !== confirmNewPassword) {
//       setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
//       return;
//     }
//     setLoadingPassword(true);
//     setPasswordMessage({ type: '', text: '' });
//     try {
//       await userService.sendPasswordChangeCode({ email: user.email });
//       setIsVerificationModalOpen(true);
//     } catch (error) {
//       setPasswordMessage({ 
//         type: 'error', 
//         text: error.response?.data?.message || 'Erreur lors de la demande.' 
//       });
//     } finally {
//       setLoadingPassword(false);
//     }
//   };

//   // Vérification du code et changement effectif
//   const handleVerifyCode = async (email, code) => {
//     setLoadingPassword(true);
//     try {
//       await userService.changePasswordWithCode({
//         currentPassword,
//         newPassword,
//         code,
//       });
//       setPasswordMessage({ type: 'success', text: 'Mot de passe changé avec succès !' });
//       setIsVerificationModalOpen(false);
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmNewPassword('');
//       setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
//     } catch (error) {
//       throw error;
//     } finally {
//       setLoadingPassword(false);
//     }
//   };

//   const MessageAlert = ({ type, text }) => {
//     if (!text) return null;
//     const isSuccess = type === 'success';
//     return (
//       <div className={`flex items-center gap-2 p-3 rounded-lg ${
//         isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
//       } animate-slideDown`}>
//         {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//         <span className="text-sm font-medium">{text}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* En-tête */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//           Mon Profil
//         </h1>
//         <p className="text-gray-500 mt-2">Consultez vos informations personnelles et gérez votre sécurité</p>
//       </div>

//       {/* Onglets */}
//       <div className="flex gap-4 mb-8 border-b border-gray-200">
//         <button
//           onClick={() => setActiveTab('profile')}
//           className={`pb-4 px-1 font-medium text-sm transition-all relative ${
//             activeTab === 'profile'
//               ? 'text-blue-600 border-b-2 border-blue-600'
//               : 'text-gray-500 hover:text-gray-700'
//           }`}
//         >
//           Informations personnelles
//         </button>
//         <button
//           onClick={() => setActiveTab('security')}
//           className={`pb-4 px-1 font-medium text-sm transition-all relative ${
//             activeTab === 'security'
//               ? 'text-blue-600 border-b-2 border-blue-600'
//               : 'text-gray-500 hover:text-gray-700'
//           }`}
//         >
//           Sécurité
//         </button>
//       </div>

//       {/* Contenu principal */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Colonne de gauche - Avatar & Stats */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//             <div className="text-center">
//               <div className="relative inline-block">
//                 <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mx-auto">
//                   <span className="text-3xl font-bold text-white">
//                     {name.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white"></div>
//               </div>
//               <h2 className="text-xl font-bold text-gray-900 mt-4">{name}</h2>
//               <p className="text-sm text-gray-500">{email}</p>
//               <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
//                 <Shield size={14} className="text-blue-600" />
//                 <span className="text-xs font-medium text-blue-600">
//                   {user?.role === 'utilisateur-employer' ? 'Employé' : 'Utilisateur'}
//                 </span>
//               </div>
//             </div>

//             {user?.role === 'utilisateur-employer' && employeeCode && (
//               <div className="mt-6 pt-6 border-t border-gray-100">
//                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                   Code Employé
//                 </h3>
//                 <div className="relative">
//                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                     <div className="flex items-center justify-between mb-2">
//                       <Briefcase size={18} className="text-blue-600" />
//                       <button
//                         onClick={() => setShowEmployeeCode(!showEmployeeCode)}
//                         className="text-blue-600 hover:text-blue-800 transition-colors"
//                       >
//                         {showEmployeeCode ? <EyeOff size={18} /> : <Eye size={18} />}
//                       </button>
//                     </div>
//                     {showEmployeeCode ? (
//                       <p className="font-mono text-lg text-center text-blue-700 tracking-widest bg-white p-2 rounded-lg">
//                         {employeeCode}
//                       </p>
//                     ) : (
//                       <p className="text-center text-gray-400 text-sm py-2">
//                         ●●●●●●●●●●
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Colonne de droite - Contenu des onglets */}
//         <div className="lg:col-span-2 space-y-6">
//           {activeTab === 'profile' && (
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
//                 <User size={20} className="text-blue-600" />
//                 Informations personnelles (lecture seule)
//               </h2>
              
//               {/* Champs verrouillés */}
//               <div className="space-y-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Nom complet
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                     <input
//                       type="text"
//                       value={name}
//                       disabled
//                       className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Le nom ne peut pas être modifié</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Adresse e-mail
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                     <input
//                       type="email"
//                       value={email}
//                       disabled
//                       className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">L'adresse e-mail ne peut pas être modifiée</p>
//                 </div>

//                 {/* Message informatif */}
//                 <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 text-sm flex items-start gap-2">
//                   <Info size={18} className="flex-shrink-0 mt-0.5" />
//                   <span>Pour modifier ces informations, veuillez contacter le support.</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'security' && (
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
//                 <Lock size={20} className="text-blue-600" />
//                 Changer le mot de passe
//               </h2>

//               <form onSubmit={handlePasswordChange} className="space-y-5">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Mot de passe actuel
//                     </label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                       <input
//                         type="password"
//                         value={currentPassword}
//                         onChange={(e) => setCurrentPassword(e.target.value)}
//                         required
//                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="••••••••"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Nouveau mot de passe
//                     </label>
//                     <div className="relative">
//                       <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                       <input
//                         type="password"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                         required
//                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="••••••••"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Confirmer le nouveau mot de passe
//                     </label>
//                     <div className="relative">
//                       <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                       <input
//                         type="password"
//                         value={confirmNewPassword}
//                         onChange={(e) => setConfirmNewPassword(e.target.value)}
//                         required
//                         className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="••••••••"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {passwordMessage.text && <MessageAlert type={passwordMessage.type} text={passwordMessage.text} />}

//                 <button
//                   type="submit"
//                   disabled={loadingPassword}
//                   className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-4 rounded-xl font-medium hover:from-gray-800 hover:to-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {loadingPassword ? (
//                     <>
//                       <RefreshCw size={18} className="animate-spin" />
//                       Vérification en cours...
//                     </>
//                   ) : (
//                     <>
//                       <Lock size={18} />
//                       Changer le mot de passe
//                     </>
//                   )}
//                 </button>
//               </form>
//             </div>
//           )}
//         </div>
//       </div>

//       <CodeVerificationModal
//         isOpen={isVerificationModalOpen}
//         email={user?.email}
//         onVerify={handleVerifyCode}
//         onResend={() => userService.sendPasswordChangeCode({ email: user.email })}
//         onClose={() => setIsVerificationModalOpen(false)}
//         type="passwordChange"
//       />
//     </div>
//   );
// };

// export default ProfilePage;

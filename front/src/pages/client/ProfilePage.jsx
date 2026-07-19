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

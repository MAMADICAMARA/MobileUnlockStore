// src/pages/client/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Briefcase, 
  Shield, 
  Key,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import CodeVerificationModal from '../auth/CodeVerificationModal';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showEmployeeCode, setShowEmployeeCode] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user) return;
      
      if (user.role === 'utilisateur-employer') {
        try {
          const response = await userService.getEmployeeData();
          if (response.data.success) {
            setEmployeeData(response.data);
            setEmployeeCode(response.data.employeeCode || '');
          }
        } catch (error) {
          console.error('Erreur chargement données employé:', error);
        }
      }
    };
    fetchEmployeeData();
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const response = await userService.updateProfile({ name });
      setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setName(response.data.name);
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setLoadingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await userService.sendPasswordChangeCode({ email: user.email });
      setIsVerificationModalOpen(true);
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la demande.' 
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleVerifyCode = async (email, code) => {
    setLoadingPassword(true);
    try {
      await userService.changePasswordWithCode({
        currentPassword,
        newPassword,
        code,
      });
      setPasswordMessage({ type: 'success', text: 'Mot de passe changé avec succès !' });
      setIsVerificationModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      throw error;
    } finally {
      setLoadingPassword(false);
    }
  };

  const MessageAlert = ({ type, text }) => {
    if (!text) return null;
    const isSuccess = type === 'success';
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      } animate-slideDown`}>
        {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Mon Profil
        </h1>
        <p className="text-gray-500 mt-2">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 px-1 font-medium text-sm transition-all relative ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Informations personnelles
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-4 px-1 font-medium text-sm transition-all relative ${
            activeTab === 'security'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sécurité
        </button>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche - Avatar & Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white"></div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4">{name}</h2>
              <p className="text-sm text-gray-500">{email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <Shield size={14} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-600">
                  {user?.role === 'utilisateur-employer' ? 'Employé' : 'Utilisateur'}
                </span>
              </div>
            </div>

            {user?.role === 'utilisateur-employer' && employeeCode && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Code Employé
                </h3>
                <div className="relative">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase size={18} className="text-blue-600" />
                      <button
                        onClick={() => setShowEmployeeCode(!showEmployeeCode)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {showEmployeeCode ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {showEmployeeCode ? (
                      <p className="font-mono text-lg text-center text-blue-700 tracking-widest bg-white p-2 rounded-lg">
                        {employeeCode}
                      </p>
                    ) : (
                      <p className="text-center text-gray-400 text-sm py-2">
                        ●●●●●●●●●●
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne de droite - Formulaires */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Informations personnelles
              </h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">L'adresse e-mail ne peut pas être modifiée</p>
                  </div>
                </div>

                {profileMessage.text && <MessageAlert type={profileMessage.type} text={profileMessage.text} />}

                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingProfile ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Mettre à jour le profil
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Lock size={20} className="text-blue-600" />
                Changer le mot de passe
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {passwordMessage.text && <MessageAlert type={passwordMessage.type} text={passwordMessage.text} />}

                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-4 rounded-xl font-medium hover:from-gray-800 hover:to-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingPassword ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <CodeVerificationModal
        isOpen={isVerificationModalOpen}
        email={user?.email}
        onVerify={handleVerifyCode}
        onResend={() => userService.sendPasswordChangeCode({ email: user.email })}
        onClose={() => setIsVerificationModalOpen(false)}
        type="passwordChange"
      />
    </div>
  );
};

export default ProfilePage;
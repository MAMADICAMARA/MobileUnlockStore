// src/pages/client/ProfilePage.jsx
import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import CodeVerificationModal from '../auth/CodeVerificationModal'; // Importer le modal

/**
 * Page de profil où l'utilisateur peut voir et mettre à jour ses informations.
 */
const ProfilePage = () => {
  const { user } = useAuth();

  // États pour l'affichage du code employé
  const [showEmployeeCode, setShowEmployeeCode] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');

  // États pour les formulaires
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // États pour les retours d'information
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  // Charger les informations de l'employé si l'utilisateur est un employé
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user) {
        console.log('Pas d\'utilisateur connecté');
        return;
      }
      
      if (user.role === 'utilisateur-employer') {
        try {
          console.log('Tentative de récupération des données employé...');
          const response = await userService.getEmployeeData();
          console.log('Réponse reçue:', response.data);
          
          if (response.data.success) {
            setEmployeeData(response.data);
            if (response.data.employeeCode) {
              console.log('Code employé trouvé:', response.data.employeeCode);
              setEmployeeCode(response.data.employeeCode);
            } else {
              console.log('Pas de code employé dans la réponse');
              setProfileMessage({ 
                type: 'error', 
                text: 'Code employé non disponible' 
              });
            }
          } else {
            console.log('Erreur dans la réponse:', response.data.error);
            setProfileMessage({ 
              type: 'error', 
              text: response.data.error || 'Erreur lors du chargement des données employé' 
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données employé:', error?.response?.data || error);
          setProfileMessage({ 
            type: 'error', 
            text: error?.response?.data?.error || 'Erreur lors du chargement des données employé' 
          });
        }
      } else {
        console.log('Utilisateur non employé:', user.role);
      }
    };
    fetchEmployeeData();
  }, [user]);

  // Charger les informations de l'utilisateur au montage
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    // Alternativement, faire un appel API pour obtenir les données les plus fraîches
    // userService.getProfile().then(response => {
    //   setName(response.data.name);
    //   setEmail(response.data.email);
    // });
  }, [user]);

  // Gérer la mise à jour des informations du profil
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const response = await userService.updateProfile({ name });
      setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setName(response.data.name); // Mettre à jour le nom localement
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Gérer le changement de mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    setLoadingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    // Étape 1: Demander l'envoi du code de vérification
    try {
      await userService.sendPasswordChangeCode({ email: user.email });
      setIsVerificationModalOpen(true); // Ouvre le modal
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la demande de changement de mot de passe.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  // Gérer la vérification du code et la finalisation du changement de mot de passe
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
      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      // L'erreur sera affichée dans le modal
      throw error;
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Mon Profil</h1>

      {/* Section Code Employé */}
      {user?.role === 'utilisateur-employer' && (
        <div className="mb-8 bg-blue-50 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-blue-700 font-bold">Code Employé</h2>
            <button
              onClick={() => setShowEmployeeCode(!showEmployeeCode)}
              className="text-blue-600 hover:text-blue-800 font-medium" disabled={!employeeCode}
            >
              {showEmployeeCode ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {showEmployeeCode && (
            <div className="mt-4">
              <div className="bg-white p-4 rounded-md border border-blue-200">
                <p className="text-xl font-mono text-center text-blue-700 tracking-widest">
                  {employeeCode || 'Chargement...'}
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Ce code est votre identifiant unique en tant qu'employé.
              </p>
            </div>
          )}
          {!employeeCode && !profileMessage.text && <p className="mt-2 text-sm text-gray-500">Chargement des informations employé...</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire d'informations personnelles */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl text-blue-700 font-bold mb-6">Informations personnelles</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border text-blue-500 border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail (non modifiable)</label>
              <input type="email" id="email" value={email} disabled className="mt-1 block w-full px-3 py-2 border text-blue-500 border-gray-300 rounded-md bg-gray-100" />
            </div>
            {profileMessage.text && <p className={profileMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}>{profileMessage.text}</p>}
            <button type="submit" disabled={loadingProfile} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {loadingProfile ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>

        {/* Formulaire de changement de mot de passe */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl  text-blue-700 font-bold mb-6">Changer le mot de passe</h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 text-blue-700 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 text-blue-700 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 text-blue-700 border border-gray-300 rounded-md" />
            </div>
            {passwordMessage.text && <p className={passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}>{passwordMessage.text}</p>}
            <button type="submit" disabled={loadingPassword} className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400">
              {loadingPassword ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
      {/* Modal de vérification de code */}
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

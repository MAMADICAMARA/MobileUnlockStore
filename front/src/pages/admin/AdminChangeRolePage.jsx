// src/pages/admin/AdminChangeRolePage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import {
  EnvelopeIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AdminChangeRolePage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Initialisation correcte de react-hook-form
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors } 
  } = useForm({
    mode: 'onChange' // Pour valider en temps réel
  });
  
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    console.log('Données soumises:', data); // Vérification
    setLoading(true);
    try {
      setError('');
      setSuccess('');
      setUserData(null);

      const response = await adminService.changeUserRole(data);
      console.log('Réponse:', response); // Vérification
      
      setSuccess('Rôle mis à jour avec succès');
      setUserData(response.user);
      toast.success('Rôle mis à jour avec succès');
      
      if (response.user.role === 'utilisateur-employer') {
        setSuccess(`Rôle mis à jour avec succès. Code employé : ${response.user.employeeCode}`);
      }
      
      // Reset du formulaire après succès
      reset();
    } catch (err) {
      console.error('Erreur:', err); // Vérification
      const errorMessage = err.response?.data?.error || "Une erreur est survenue";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire d'erreur de soumission
  const onError = (errors) => {
    console.log('Erreurs de validation:', errors);
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'client':
        return <UserCircleIcon className="h-5 w-5" />;
      case 'admin':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'utilisateur-employer':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      default:
        return <UserGroupIcon className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'client':
        return 'from-blue-500 to-cyan-500';
      case 'admin':
        return 'from-purple-500 to-indigo-500';
      case 'utilisateur-employer':
        return 'from-emerald-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-800 mb-3 tracking-tight">
          Gestion des rôles
        </h1>
        <p className="text-gray-600 text-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          Modifiez les permissions des utilisateurs
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Carte principale */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* En-tête de la carte */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <KeyIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Changer le rôle d'un utilisateur</h2>
                <p className="text-indigo-100 text-sm mt-1">Modifiez les permissions et accès</p>
              </div>
            </div>
          </div>

          {/* Formulaire - Correction: Ajout de onError */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
              
              {/* Champ Email - Avec valeur par défaut pour test */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <EnvelopeIcon className="h-4 w-4 text-indigo-600" />
                  Email de l'utilisateur
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: "L'email est requis",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email invalide"
                      }
                    })}
                    className={`w-full px-5 py-4 bg-gray-50 border-2 ${
                      errors.email ? 'border-red-300' : 'border-gray-100'
                    } rounded-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400`}
                    placeholder="exemple@email.com"
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                    <XCircleIcon className="h-4 w-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Champ Rôle */}
              <div className="space-y-2">
                <label 
                  htmlFor="role"
                  className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <ShieldCheckIcon className="h-4 w-4 text-indigo-600" />
                  Nouveau rôle
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <select
                    id="role"
                    {...register('role', { required: "Le rôle est requis" })}
                    className={`w-full px-5 py-4 bg-gray-50 border-2 ${
                      errors.role ? 'border-red-300' : 'border-gray-100'
                    } rounded-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all duration-300 text-gray-700 appearance-none cursor-pointer`}
                    aria-invalid={errors.role ? "true" : "false"}
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                    <option value="utilisateur-employer">Utilisateur Employé</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                    <XCircleIcon className="h-4 w-4" />
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Aperçu du rôle sélectionné - Correction de l'affichage */}
              {selectedRole && selectedRole !== '' && (
                <div className={`p-4 bg-gradient-to-r ${getRoleColor(selectedRole)} rounded-xl text-white animate-slideDown`}>
                  <div className="flex items-center gap-3">
                    {getRoleIcon(selectedRole)}
                    <div>
                      <p className="text-sm opacity-90">Rôle sélectionné :</p>
                      <p className="font-semibold text-lg capitalize">
                        {selectedRole === 'utilisateur-employer' ? 'Employé' : selectedRole}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages d'erreur */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl animate-slideDown">
                  <div className="flex items-center gap-3">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Message de succès */}
              {success && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl animate-slideDown">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-700 font-medium">{success}</p>
                  </div>
                </div>
              )}

              {/* Informations utilisateur mises à jour - Vérification que userData existe */}
              {userData && userData.name && (
                <div className="p-6 bg-indigo-50 rounded-xl border-2 border-indigo-100 animate-scaleUp">
                  <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    Informations mises à jour
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                      <UserCircleIcon className="h-5 w-5 text-indigo-600" />
                      <span className="text-gray-700">Nom : <span className="font-semibold">{userData.name}</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                      <EnvelopeIcon className="h-5 w-5 text-indigo-600" />
                      <span className="text-gray-700">Email : <span className="font-semibold">{userData.email}</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                      <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                      <span className="text-gray-700">Rôle : <span className="font-semibold">{userData.role}</span></span>
                    </div>
                    {userData.employeeCode && (
                      <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <IdentificationIcon className="h-5 w-5 text-indigo-600" />
                        <span className="text-gray-700">Code employé : <span className="font-semibold font-mono">{userData.employeeCode}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-lg mt-8"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-5 w-5" />
                    Changer le rôle
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Cartes d'information des rôles */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { role: 'Client', icon: UserCircleIcon, color: 'from-blue-500 to-cyan-500', desc: 'Accès standard à l\'application' },
            { role: 'Admin', icon: ShieldCheckIcon, color: 'from-purple-500 to-indigo-500', desc: 'Accès complet à l\'administration' },
            { role: 'Employé', icon: BuildingOfficeIcon, color: 'from-emerald-500 to-teal-500', desc: 'Accès avec code employé' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className={`h-10 w-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{item.role}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Styles personnalisés pour les animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-scaleUp {
          animation: scaleUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminChangeRolePage;
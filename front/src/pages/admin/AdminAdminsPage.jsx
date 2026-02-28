// src/pages/admin/AdminAdminsPage.jsx
import { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  ShieldCheckIcon, 
  EnvelopeIcon,
  UserCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';

const AdminAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [searchTerm, roleFilter, admins]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAdmins();
      if (response?.data) {
        setAdmins(response.data);
        setFilteredAdmins(response.data);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des admins:', err);
      setError('Impossible de charger la liste des administrateurs.');
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = [...admins];
    
    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(admin => 
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(admin => admin.role === roleFilter);
    }
    
    setFilteredAdmins(filtered);
  };

  const handleRevoke = async (adminId) => {
    if (window.confirm('Êtes-vous sûr de vouloir révoquer cet administrateur ?')) {
      try {
        await adminService.revokeAdmin(adminId);
        setAdmins(admins.filter(admin => admin._id !== adminId));
      } catch (error) {
        console.error('Erreur lors de la révocation:', error);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'superadmin':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
      case 'admin':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'moderator':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center transform transition-all duration-500 scale-100">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
          <ArrowPathIcon className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4 relative" />
        </div>
        <p className="text-gray-600 font-medium text-lg">Chargement des administrateurs...</p>
        <p className="text-gray-400 text-sm mt-2">Préparation de votre espace de gestion</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white/80 backdrop-blur-lg border-l-4 border-red-500 p-8 rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <XMarkIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Erreur de chargement</h2>
        </div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={fetchAdmins}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header avec effet de verre */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestion des Administrateurs
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {filteredAdmins.length} administrateur{filteredAdmins.length > 1 ? 's' : ''} actif{filteredAdmins.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <UserPlusIcon className="h-5 w-5" />
              <span>Ajouter un administrateur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un administrateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
          />
        </div>
        
        <div className="relative">
          <ShieldCheckIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all duration-300"
          >
            <option value="all">Tous les rôles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="moderator">Modérateur</option>
          </select>
          <ChevronDownIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        
        <div className="flex items-center justify-end sm:justify-start lg:justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
            }}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1 transition-colors duration-300"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Tableau responsive avec design moderne */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-4 w-4" />
                    <span>Administrateur</span>
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>Contact</span>
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>Rôle</span>
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin, index) => (
                  <tr 
                    key={admin._id} 
                    className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedAdmin(admin)}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {admin.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {admin._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-gray-900 font-medium">{admin.email}</div>
                      <div className="text-xs text-gray-500">
                        Dernière connexion: {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)} shadow-md`}>
                        {admin.role || 'Admin'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAdmin(admin);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevoke(admin._id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Révoquer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 rounded-full p-4 mb-4">
                        <UserCircleIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">Aucun administrateur trouvé</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm || roleFilter !== 'all' ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter un administrateur'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout/modification (à implémenter selon vos besoins) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ajouter un administrateur</h2>
            {/* Formulaire d'ajout */}
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition-colors duration-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdminsPage;
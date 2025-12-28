// src/pages/admin/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl text-blue-600 font-bold mb-6">Gestion des Clients</h1>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <p className="p-4">Chargement...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nb. Commandes</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 text-blue-700 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-blue-700">{user.email}</td>
                  <td className="px-6 py-4 text-blue-700">{formatDate(user.registrationDate)}</td>
                  <td className="px-6 py-4 text-center text-blue-700">{user.orderCount}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleViewDetails(user)}
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale de détails utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-blue-500 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Détails de l'utilisateur</h2>
            <p ><strong>Nom :</strong> {selectedUser.name}</p>
            <p><strong>Email :</strong> {selectedUser.email}</p>
            <p><strong>Date d'inscription :</strong> {formatDate(selectedUser.registrationDate)}</p>
            <p><strong>Commandes :</strong> {selectedUser.orderCount}</p>
            <p><strong>Rôle :</strong> {selectedUser.role}</p>
            <p><strong>Solde :</strong> {selectedUser.balance} GNF</p>
            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleCloseModal}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

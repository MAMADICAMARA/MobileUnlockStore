// src/pages/admin/AdminAdminsPage.jsx
import { useState, useEffect } from 'react';
import adminService from '../../services/adminService'; // Import adminService



/**
 * Page de gestion des comptes administrateurs.
 */
const AdminAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await adminService.getAdmins(); // Use adminService to fetch admins
        if (response?.data) {
          setAdmins(response.data);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des admins:', err);
        setError('Impossible de charger la liste des administrateurs.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-blue-600 font-bold">Gestion des Administrateurs</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Ajouter un administrateur
        </button>
      </div>
      {loading && <div>Chargement des administrateurs...</div>}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rôle</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins && admins.map(admin => ( 
              <tr key={admin._id}>
                <td className="px-6 text-blue-700 py-4 font-medium">{admin.name}</td>
                <td className="px-6 text-blue-700 py-4">{admin.email}</td>
                <td className="px-6 text-blue-700 py-4">{admin.role}</td>
                <td className="px-6 text-blue-700 py-4 text-center">
                  <button className="text-red-600 hover:text-red-900">Révoquer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAdminsPage;

// src/pages/admin/AdminSupportPage.jsx
import { useState, useEffect } from 'react';
import adminService from '../../services/adminService'; // Correction de l'import
// Si besoin, ajoutez une fonction utilitaire locale pour formater la date :
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Page de gestion des tickets de support pour l'administrateur.
 */
const AdminSupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchTickets = async () => {
      try {
        const response = await adminService.getAllTickets();
        setTickets(response.data);
      } catch (error) {
        setTickets([]);
      }
      setLoading(false);
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => filter === 'Tous' || t.status === filter);

  return (
    <div>
      <h1 className="text-3xl text-blue-500 font-bold mb-6">Gestion du Support</h1>
      
      {/* Filtres */}
      <div className="mb-6">
        <select onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded-md">
          <option value="Tous">Tous les tickets</option>
          <option value="Ouvert">Ouvert</option>
          <option value="Répondu">Répondu</option>
          <option value="Fermé">Fermé</option>
        </select>
      </div>

      {/* Tableau des tickets */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sujet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map(ticket => (
              <tr key={ticket._id}>
                <td className="px-6 py-4 text-blue-600 font-medium">{ticket.subject}</td>
                <td className="px-6 text-blue-600 py-4">{ticket.user?.name || ticket.user?.email || 'Utilisateur'}</td>
                <td className="px-6 text-blue-600 py-4">{ticket.lastUpdate ? formatDate(ticket.lastUpdate) : ''}</td>
                <td className="px-6 text-blue-600 py-4">{ticket.status}</td>
                <td className="px-6 py-4 text-center">
                  <button className="text-blue-600 hover:text-blue-900">Voir / Répondre</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSupportPage;

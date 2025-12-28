// src/pages/client/TicketsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supportService from "../../services/supportService"; // Chemin corrigé

// Données fictives
const mockTickets = [
  { _id: 't1', subject: 'Problème de déblocage Samsung', status: 'Ouvert', lastUpdate: '2023-10-29T10:00:00Z' },
  { _id: 't2', subject: 'Question sur la licence Pro', status: 'Répondu', lastUpdate: '2023-10-28T15:00:00Z' },
  { _id: 't3', subject: 'Facturation', status: 'Fermé', lastUpdate: '2023-09-30T12:00:00Z' },
];

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const StatusBadge = ({ status }) => {
  const styles = {
    'Ouvert': 'bg-blue-100 text-blue-800',
    'Répondu': 'bg-yellow-100 text-yellow-800',
    'Fermé': 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
};

/**
 * Page affichant l'historique des tickets de support du client.
 */
const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un appel API
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await supportService.getTickets();
        setTickets(response.data);
      } catch (err) {
        setTickets([]);
      }
      setLoading(false);
    };
    fetchTickets();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-blue-700 font-bold">Mes Tickets de Support</h1>
        <Link to="/client/support" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Ouvrir un nouveau ticket
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? <p className="p-4">Chargement...</p> : (
          <ul className="divide-y divide-gray-200">
            {tickets.map(ticket => (
              <li key={ticket._id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                  <p className="text-sm text-gray-500">Dernière mise à jour : {formatDate(ticket.lastUpdate)}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;

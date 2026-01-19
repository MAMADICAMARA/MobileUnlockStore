// src/pages/client/OrdersPage.jsx
import { useState, useEffect, useMemo } from 'react';
import orderService from '../../services/orderService';
import Footer from '../../components/Footer';



// Fonction pour formater la date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Badge de statut
const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Terminé': 'bg-green-100 text-green-800',
    'En cours': 'bg-yellow-100 text-yellow-800',
    'En attente': 'bg-blue-100 text-blue-800',
    'Annulé': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

/**
 * Page affichant l'historique des commandes du client.
 */
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' pour plus récent, 'asc' pour plus ancien

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await orderService.getOrders();
        setOrders(response.data);
      } catch (err) {
        setError('Impossible de charger l\'historique des commandes.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Tri des commandes en fonction de l'ordre sélectionné
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [orders, sortOrder]);

  return (
    <div className="bg-gray-50 min-h-screen">
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-blue-700 font-bold">Mes Commandes</h1>
          {/* Bouton pour changer l'ordre de tri */}
          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            Trier par date ({sortOrder === 'asc' ? "Anciennes d'abord" : "Récentes d'abord"})
          </button>
        </div>
        {/* Affichage du tableau des commandes */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading && <p className="p-4">Chargement...</p>}
          {error && <p className="p-4 text-red-500">{error}</p>}
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map(order => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap bg-white text-sm font-medium text-gray-900">{order.serviceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap bg-white text-sm text-gray-500">{formatDate(order.date)}</td>
                    <td className="px-6 py-4 text-black-500 whitespace-nowrap text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">{typeof order.price === 'number' ? `${order.price.toFixed(2)} €` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      
    </div>
  );
};

export default OrdersPage;

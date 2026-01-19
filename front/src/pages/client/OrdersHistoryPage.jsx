import { useState, useEffect, useMemo } from 'react';
import orderService from '../../services/orderService';
import useAuth from '../../hooks/useAuth';

/**
 * Page d'historique des commandes du client.
 * Affiche toutes les commandes passées avec filtres par statut et recherche.
 */
const OrdersHistoryPage = () => {

  const { user } = useAuth(); // Récupère l'utilisateur connecté

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');

  // Récupère l'historique des commandes à l'ouverture de la page
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await orderService.getHistory();
        setOrders(response.data || []);
      } catch (err) {
        setError("Impossible de charger l'historique des commandes.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filtrage et recherche sécurisés
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const status = order?.status || "";
        return filterStatus === 'Tous' || status === filterStatus;
      })
      .filter(order => {
        const name = order?.serviceName || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [orders, filterStatus, searchTerm]);

  const statusTabs = ['Tous', 'Terminé', 'En cours', 'En attente', 'Annulé'];

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-5">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Historique des commandes</h1>

        {/* Filtres */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {statusTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterStatus === tab
                    ? 'bg-blue-600 text-black-500'
                    : 'bg-white text-black-500 border'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border text-black-500 rounded-lg w-full md:w-64"
          />
        </div>

        {/* Tableau */}
        {loading && <p className="text-center">Chargement...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 font-medium text-blue-700">
                        {order?.serviceName || "Service inconnu"}
                      </td>

                      <td className="px-6 py-4 text-blue-700">
                        {order?.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order?.status === 'Terminé'
                              ? 'bg-green-100 text-green-800'
                              : order?.status === 'En cours'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order?.status === 'En attente'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order?.status || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-blue-700 text-right font-bold">
                        {order?.price ? order.price.toFixed(2) + " €" : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-black-500">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersHistoryPage;

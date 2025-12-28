// src/pages/client/DashboardPage.jsx
import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import licenseService from '../../services/licenseService';
import supportService from '../../services/supportService';

/**
 * Page du tableau de bord de l'espace client.
 * Affiche un résumé des activités de l'utilisateur.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeLicenses, setActiveLicenses] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const ordersRes = await orderService.getOrders();
        setRecentOrders(ordersRes.data.slice(0, 5));
        const licensesRes = await licenseService.getLicenses();
        setActiveLicenses(licensesRes.data.length);
        const ticketsRes = await supportService.getTickets();
        setOpenTickets(ticketsRes.data.filter(t => t.status !== 'Résolu').length);
      } catch (err) {
        setError('Impossible de charger le résumé du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8 text-blue-800 tracking-wide">Tableau de bord</h1>
      <p className="text-lg text-gray-800 mb-8 font-semibold">
        Bonjour, <span className="text-blue-700 font-bold">{user?.name || 'Client'}</span> ! Bienvenue dans votre espace personnel.
      </p>

      {/* Affichage du solde actuel */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-blue-700 mb-2">Votre solde actuel</h2>
        <p className="text-3xl font-extrabold text-green-600 mb-2">{user?.balance !== undefined ? user.balance.toFixed(2) : '0.00'} €</p>
        <p className="text-gray-700 font-medium">Solde disponible pour vos achats et paiements.</p>
      </div>

      {/* Grille de résumés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Résumé des commandes */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl text-blue-700 font-bold mb-4">Commandes récentes</h2>
          {recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {recentOrders.map(order => (
                <li key={order._id} className="flex justify-between items-center text-base font-semibold text-gray-800">
                  <span>{order.serviceName}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Terminé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 font-semibold">Aucune commande récente.</p>
          )}
        </div>

        {/* Résumé des licences */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Licences Actives</h2>
          <p className="text-4xl font-extrabold text-red-600 mb-2">{activeLicenses}</p>
          <p className="text-gray-700 font-medium">licences logicielles actuellement actives.</p>
        </div>

        {/* Résumé du support */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl text-blue-700 font-bold mb-4">Tickets de Support</h2>
          <p className="text-4xl font-extrabold text-red-600 mb-2">{openTickets}</p>
          <p className="text-gray-700 font-medium">tickets ouverts en attente de réponse.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

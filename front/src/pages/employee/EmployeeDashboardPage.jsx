// src/pages/employee/EmployeeDashboardPage.jsx
import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import orderService from '../../services/orderService';

/**
 * Page du tableau de bord de l'espace employé.
 * Affiche un résumé des activités de l'employé.
 */
const EmployeeDashboardPage = () => {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const ordersRes = await orderService.getOrders();
        setAssignedOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        setError('Impossible de charger le résumé du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord employé</h1>
      
      {/* Informations de l'employé */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenue, {user?.name}</h2>
        <p className="text-gray-600">Statut : Employé</p>
      </div>

      {/* Commandes assignées récentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Commandes assignées récentes</h2>
        {assignedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Service</th>
                  <th className="py-2 px-4 text-left">Statut</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {assignedOrders.map((order) => (
                  <tr key={order._id} className="border-t">
                    <td className="py-2 px-4">{order._id}</td>
                    <td className="py-2 px-4">{order.service?.name}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Terminé' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Aucune commande assignée récente</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
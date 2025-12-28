// src/pages/admin/AdminOrdersPage.jsx
import { useState, useEffect, useMemo } from 'react';
import adminService from '../../services/adminService';

// Données fictives
const mockOrders = [
  { _id: 'o1', user: { name: 'Jean Dupont', email: 'jean@test.com' }, service: { name: 'Samsung FRP' }, date: '2023-10-29T10:00:00Z', status: 'En cours', price: 25.50 },
  { _id: 'o2', user: { name: 'Marie Curie', email: 'marie@test.com' }, service: { name: 'iPhone Unlock' }, date: '2023-10-28T14:30:00Z', status: 'Terminé', price: 80.00 },
  { _id: 'o3', user: { name: 'Pierre Martin', email: 'pierre@test.com' }, service: { name: 'Licence Pro' }, date: '2023-10-27T11:00:00Z', status: 'Terminé', price: 50.00 },
  { _id: 'o4', user: { name: 'Jean Dupont', email: 'jean@test.com' }, service: { name: 'Assistance Remote' }, date: '2023-10-26T09:00:00Z', status: 'Annulé', price: 40.00 },
];

const orderStatuses = ['En cours', 'Terminé', 'En attente', 'Annulé'];
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Page de gestion de toutes les commandes pour l'administrateur.
 */
const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'Tous', search: '' });

  useEffect(() => {
    setLoading(true);
    const fetchOrders = async () => {
      try {
        const response = await adminService.getAllOrders();
        setOrders(response.data);
      } catch (error) {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []); // Idéalement, re-fetcher quand les filtres changent

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Logique de filtrage appliquée sur les données fictives
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const statusMatch = filters.status === 'Tous' || order.status === filters.status;
      const searchMatch = filters.search === '' || 
                          order.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          order.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                          order.service.name.toLowerCase().includes(filters.search.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [orders, filters]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: response.data.status } : o));
    } catch (error) {
      // Optionnel : afficher une erreur
    }
  };

  return (
    <div>
      <h1 className="text-3xl text-blue-700 font-bold mb-6">Gestion des Commandes</h1>
      
      {/* Barre de filtres */}
      <div className="mb-6 p-4 bg-white text-black-700 rounded-lg shadow-sm flex gap-4">
        <input
          type="text"
          name="search"
          placeholder="Rechercher par client ou service..."
          value={filters.search}
          onChange={handleFilterChange}
          className="flex-grow px-4 py-2 text-blue-600 border rounded-lg"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="Tous" className='text-blue-600'>Tous les statuts</option>
          {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? <p className="p-4">Chargement...</p> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600">{order.user?.name || order.user?.email || 'Utilisateur'}</div>
                    <div className="text-sm text-gray-600">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-blue-600 text-sm">{order.service?.name || order.serviceDetails?.name}</td>
                  <td className="px-6 py-4 text-blue-600 text-sm">{formatDate(order.date || order.createdAt)}</td>
                  <td className="px-6 py-4 text-right text-blue-600 text-sm font-semibold">{order.serviceDetails?.price?.toFixed(2) || ''} €</td>
                  <td className="px-6 py-4 text-blue-500 text-sm">
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="border-gray-300 rounded-md shadow-sm"
                    >
                      {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;

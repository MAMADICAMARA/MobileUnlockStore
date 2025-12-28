import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  // Initialisation avec des données vides mais structurées
  const [stats, setStats] = useState({
    totalRevenue: 0,

    ordersThisMonth: 0,
    newUsers: 0,
    pendingOrders: 0,
    salesLast30Days: [],
    servicesDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await adminService.getDashboardStats();
        if (response?.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Erreur détaillée lors de la récupération des statistiques:', error.response || error);
        if (error.response && error.response.data && error.response.data.message) {
          setError(`Erreur du serveur : ${error.response.data.message}`);
        } else {
          setError('Impossible de charger les statistiques. Vérifiez la console du serveur backend pour les détails de l\'erreur 500.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl text-blue-700 font-bold mb-6">Tableau de bord Administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Revenu Total" value={`${stats.totalRevenue.toFixed(2)} €`} />
        <StatCard title="Commandes (ce mois-ci)" value={stats.ordersThisMonth} />
        <StatCard title="Nouveaux Clients" value={stats.newUsers} />
        <StatCard title="Commandes en attente" value={stats.pendingOrders} color="text-yellow-500" />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Ventes des 30 derniers jours</h2>
        {stats.salesLast30Days && stats.salesLast30Days.length > 0 ? <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.salesLast30Days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#2563eb" name="Ventes" />
          </BarChart>
        </ResponsiveContainer>

         : <p>Aucune vente enregistrée pour les 30 derniers jours.</p>}</div>
    </div>
  );
};

const StatCard = ({ title, value, color = 'text-blue-600' }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);


export default AdminDashboardPage;
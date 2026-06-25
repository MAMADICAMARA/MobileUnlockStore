
// src/pages/admin/AdminDashboardPage.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, CreditCard, Users, Calendar, RefreshCw } from 'lucide-react';
import adminService from '../../services/adminService';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    revenue: 0,
    ordersThisMonth: 0,
    newUsers: 0,
    salesLast30Days: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      // const response = await adminService.getDashboardStats();
       const response = await adminService.getDashboardStats();
console.log('DASHBOARD STATS:', JSON.stringify(response?.data, null, 2));
if (response?.data?.data) {
  setStats(response.data.data);
}
      if (response?.data?.data) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Erreur stats dashboard:', err.response || err);
      setError(err.response?.data?.message || 'Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  };
 

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500">Chargement...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={fetchStats} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Tableau de bord Administrateur
        </h1>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* ✅ Ligne 1 : Mêmes 4 stats que AdminOrdersPage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total commandes"
          value={stats.total}
          icon={Package}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          title="Commandes terminées"
          value={stats.completed}
          icon={CheckCircle}
          color="text-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          title="En cours"
          value={stats.inProgress}
          icon={Clock}
          color="text-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={formatCurrency(stats.revenue)}
          icon={CreditCard}
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* ✅ Ligne 2 : Stats supplémentaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Commandes (ce mois-ci)"
          value={stats.ordersThisMonth}
          icon={Calendar}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          title="Nouveaux Clients"
          value={stats.newUsers}
          icon={Users}
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* ✅ Graphique des ventes des 30 derniers jours */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Ventes des 30 derniers jours
        </h2>
        {stats.salesLast30Days?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.salesLast30Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${v}€`} />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Ventes']}
                labelFormatter={(label) => `Date : ${label}`}
              />
              <Bar dataKey="sales" fill="#2563eb" name="Ventes (€)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-blue-600">Aucune vente enregistrée pour les 30 derniers jours.</p>
        )}
      </div>

    </div>
  );
};

// ✅ StatCard identique à AdminOrdersPage
const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default AdminDashboardPage;


// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { useState, useEffect } from 'react';
// import adminService from '../../services/adminService';

// const AdminDashboardPage = () => {
//   const [stats, setStats] = useState({
//     totalRevenue: 0,
//     ordersThisMonth: 0,
//     newUsers: 0,
//     pendingOrders: 0,
//     salesLast30Days: [],
//     servicesDistribution: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchStats = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const response = await adminService.getDashboardStats();
//         if (response?.data?.data) {
//           setStats(response.data.data);
//         }
//       } catch (error) {
//         console.error('Erreur détaillée lors de la récupération des statistiques:', error.response || error);
//         if (error.response?.data?.message) {
//           setError(`Erreur du serveur : ${error.response.data.message}`);
//         } else {
//           setError('Impossible de charger les statistiques.');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) return <div className="p-8 text-center">Chargement...</div>;
//   if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

//   return (
//     <div>
//       <h1 className="text-3xl text-blue-700 font-bold mb-6">Tableau de bord Administrateur</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard title="Revenu Total" value={`${(stats.totalRevenue ?? 0).toFixed(2)} €`} />
//         <StatCard title="Commandes (ce mois-ci)" value={stats.ordersThisMonth} />
//         <StatCard title="Nouveaux Clients" value={stats.newUsers} />
//         <StatCard title="Commandes en attente" value={stats.pendingOrders} color="text-yellow-500" />
//       </div>
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Ventes des 30 derniers jours</h2>
//         {stats.salesLast30Days?.length > 0
//           ? <ResponsiveContainer width="100%" className="text-red-500" height={300}>
//               <BarChart data={stats.salesLast30Days}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="sales" fill="#2563eb" name="Ventes" />
//               </BarChart>
//             </ResponsiveContainer>
//           : <p className='text-blue-600'>Aucune vente enregistrée pour les 30 derniers jours.</p>
//         }
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, color = 'text-blue-600' }) => (
//   <div className="bg-white p-6 rounded-lg shadow-md">
//     <h3 className="text-sm font-medium text-gray-500">{title}</h3>
//     <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
//   </div>
// );

// export default AdminDashboardPage;


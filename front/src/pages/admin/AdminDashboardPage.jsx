// src/pages/admin/AdminDashboardPage.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import {
  Package, CheckCircle, Clock, CreditCard,
  Users, Calendar, RefreshCw, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import adminService from '../../services/adminService';
import MaintenanceToggle from '../../components/admin/MaintenanceToggle'

const fmt = (n) =>
  `${new Intl.NumberFormat('fr-FR').format(n || 0)} FG`;

/* ─── Tooltip personnalisé ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-base">{fmt(payload[0].value)}</p>
    </div>
  );
};

/* ─── Page principale ─── */
const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0, completed: 0, inProgress: 0, revenue: 0,
    ordersThisMonth: 0, newUsers: 0, salesLast30Days: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await adminService.getDashboardStats();
      if (response?.data?.data) setStats(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 text-sm">Chargement du tableau de bord…</p>
    </div>
  );

  if (error) return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-4 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full shadow-lg border border-red-100 dark:border-red-900">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 mb-4">{error}</p>
        <button onClick={() => fetchStats()} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
          Réessayer
        </button>
      </div>
    </div>
  );

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="w-full py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── En-tête ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
              Administration
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              Tableau de bord
            </h1>
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* ── Mode Maintenance ── */}
        <MaintenanceToggle />

        {/* ── Hero : Chiffre d'affaires ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Cercles décoratifs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Chiffre d'affaires total
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {fmt(stats.revenue)}
              </p>
              <p className="text-indigo-300 text-sm mt-2">
                Basé sur {stats.completed} commande{stats.completed !== 1 ? 's' : ''} terminée{stats.completed !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <MiniStat label="Taux complétion" value={`${completionRate}%`} />
              <MiniStat label="Ce mois" value={stats.ordersThisMonth} />
            </div>
          </div>
        </div>

        {/* ── 4 KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            title="Total commandes"
            value={stats.total}
            icon={Package}
            accent="blue"
          />
          <KpiCard
            title="Terminées"
            value={stats.completed}
            icon={CheckCircle}
            accent="green"
          />
          <KpiCard
            title="En cours"
            value={stats.inProgress}
            icon={Clock}
            accent="amber"
          />
          <KpiCard
            title="Nouveaux clients"
            value={stats.newUsers}
            icon={Users}
            accent="purple"
          />
        </div>

        {/* ── Graphique ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Ventes — 30 derniers jours
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Commandes terminées uniquement
              </p>
            </div>
            {stats.salesLast30Days?.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 flex-shrink-0" />
                Ventes (FG)
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {stats.salesLast30Days?.length > 0 ? (
              <div className="w-full overflow-x-hidden">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={stats.salesLast30Days}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => d.slice(5)} /* MM-DD */
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v} FG`}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Aucune vente ces 30 derniers jours
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                  Les données apparaîtront ici dès qu'une commande sera terminée.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Résumé rapide ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <SummaryRow
            label="Commandes ce mois-ci"
            value={stats.ordersThisMonth}
            icon={Calendar}
            note="vs total"
            total={stats.total}
          />
          <SummaryRow
            label="Taux de complétion"
            value={`${completionRate}%`}
            icon={CheckCircle}
            note={`${stats.completed} sur ${stats.total}`}
          />
        </div>

      </div>
    </div>
  );
};

/* ─── Composants ─── */

const ACCENT = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-500',   ring: 'ring-blue-100 dark:ring-blue-900' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-500',  ring: 'ring-green-100 dark:ring-green-900' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500',  ring: 'ring-amber-100 dark:ring-amber-900' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',icon: 'text-purple-500',ring: 'ring-purple-100 dark:ring-purple-900' },
};

const KpiCard = ({ title, value, icon: Icon, accent }) => {
  const a = ACCENT[accent] || ACCENT.blue;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${a.bg} ring-1 ${a.ring} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${a.icon}`} />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
        {title}
      </p>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[80px]">
    <p className="text-white font-bold text-lg leading-none">{value}</p>
    <p className="text-indigo-200 text-xs mt-1 whitespace-nowrap">{label}</p>
  </div>
);

const SummaryRow = ({ label, value, icon: Icon, note, total }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
    {note && (
      <p className="ml-auto text-xs text-slate-400 dark:text-slate-500 text-right flex-shrink-0">
        {note}{total !== undefined ? ` (${total})` : ''}
      </p>
    )}
  </div>
);

export default AdminDashboardPage;

// // src/pages/admin/AdminDashboardPage.jsx
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { useState, useEffect } from 'react';
// import {
//   Package, CheckCircle, Clock, CreditCard,
//   Users, Calendar, RefreshCw, TrendingUp,
//   ArrowUpRight, ArrowDownRight, Minus
// } from 'lucide-react';
// import adminService from '../../services/adminService';
// import MaintenanceToggle from '../../components/admin/MaintenanceToggle'

// const fmt = (n) =>
//   `${new Intl.NumberFormat('fr-FR').format(n || 0)} FG`;

// /* ─── Tooltip personnalisé ─── */
// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
//       <p className="text-slate-400 text-xs mb-1">{label}</p>
//       <p className="text-white font-bold text-base">{fmt(payload[0].value)}</p>
//     </div>
//   );
// };

// /* ─── Page principale ─── */
// const AdminDashboardPage = () => {
//   const [stats, setStats] = useState({
//     total: 0, completed: 0, inProgress: 0, revenue: 0,
//     ordersThisMonth: 0, newUsers: 0, salesLast30Days: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchStats = async (isRefresh = false) => {
//     isRefresh ? setRefreshing(true) : setLoading(true);
//     setError('');
//     try {
//       const response = await adminService.getDashboardStats();
//       if (response?.data?.data) setStats(response.data.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Impossible de charger les statistiques.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => { fetchStats(); }, []);

//   if (loading) return (
//     <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
//       <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
//       <p className="text-slate-500 dark:text-slate-400 text-sm">Chargement du tableau de bord…</p>
//     </div>
//   );

//   if (error) return (
//     <div className="w-full py-20 flex flex-col items-center justify-center gap-4 px-4">
//       <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full shadow-lg border border-red-100 dark:border-red-900">
//         <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
//           <span className="text-red-500 text-xl">!</span>
//         </div>
//         <p className="text-slate-700 dark:text-slate-300 mb-4">{error}</p>
//         <button onClick={() => fetchStats()} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
//           Réessayer
//         </button>
//       </div>
//     </div>
//   );

//   const completionRate = stats.total > 0
//     ? Math.round((stats.completed / stats.total) * 100) : 0;

//   return (
//     <div className="w-full py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* ── En-tête ── */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
//               Administration
//             </p>
//             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
//               Tableau de bord
//             </h1>
//           </div>
//           <button
//             onClick={() => fetchStats(true)}
//             disabled={refreshing}
//             className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 shadow-sm"
//           >
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//             Actualiser
//           </button>
//         </div>

//         {/* ── Hero : Chiffre d'affaires ── */}
//         <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 sm:p-8 shadow-xl">
//           {/* Cercles décoratifs */}
//           <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
//           <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

//           <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
//             <div>
//               <p className="text-indigo-200 text-sm font-medium mb-2 flex items-center gap-2">
//                 <CreditCard className="w-4 h-4" />
//                 Chiffre d'affaires total
//               </p>
//               <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
//                 {fmt(stats.revenue)}
//               </p>
//               <p className="text-indigo-300 text-sm mt-2">
//                 Basé sur {stats.completed} commande{stats.completed !== 1 ? 's' : ''} terminée{stats.completed !== 1 ? 's' : ''}
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <MiniStat label="Taux complétion" value={`${completionRate}%`} />
//               <MiniStat label="Ce mois" value={stats.ordersThisMonth} />
//             </div>
//           </div>
//         </div>

//         {/* ── 4 KPIs ── */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//           <KpiCard
//             title="Total commandes"
//             value={stats.total}
//             icon={Package}
//             accent="blue"
//           />
//           <KpiCard
//             title="Terminées"
//             value={stats.completed}
//             icon={CheckCircle}
//             accent="green"
//           />
//           <KpiCard
//             title="En cours"
//             value={stats.inProgress}
//             icon={Clock}
//             accent="amber"
//           />
//           <KpiCard
//             title="Nouveaux clients"
//             value={stats.newUsers}
//             icon={Users}
//             accent="purple"
//           />
//         </div>

//         {/* ── Graphique ── */}
//         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
//           <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div>
//               <h2 className="text-base font-semibold text-slate-900 dark:text-white">
//                 Ventes — 30 derniers jours
//               </h2>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                 Commandes terminées uniquement
//               </p>
//             </div>
//             {stats.salesLast30Days?.length > 0 && (
//               <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
//                 <span className="w-3 h-3 rounded-sm bg-indigo-500 flex-shrink-0" />
//                 Ventes (FG)
//               </div>
//             )}
//           </div>

//           <div className="p-4 sm:p-6">
//             {stats.salesLast30Days?.length > 0 ? (
//               <div className="w-full overflow-x-hidden">
//                 <ResponsiveContainer width="100%" height={260}>
//                   <BarChart
//                     data={stats.salesLast30Days}
//                     margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
//                     barCategoryGap="30%"
//                   >
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
//                     <XAxis
//                       dataKey="date"
//                       tick={{ fontSize: 10, fill: '#94a3b8' }}
//                       tickLine={false}
//                       axisLine={false}
//                       tickFormatter={(d) => d.slice(5)} /* MM-DD */
//                     />
//                     <YAxis
//                       tick={{ fontSize: 10, fill: '#94a3b8' }}
//                       tickLine={false}
//                       axisLine={false}
//                       tickFormatter={(v) => `${v} FG`}
//                       width={40}
//                     />
//                     <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
//                     <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-16 text-center">
//                 <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
//                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
//                   Aucune vente ces 30 derniers jours
//                 </p>
//                 <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
//                   Les données apparaîtront ici dès qu'une commande sera terminée.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Résumé rapide ── */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//           <SummaryRow
//             label="Commandes ce mois-ci"
//             value={stats.ordersThisMonth}
//             icon={Calendar}
//             note="vs total"
//             total={stats.total}
//           />
//           <SummaryRow
//             label="Taux de complétion"
//             value={`${completionRate}%`}
//             icon={CheckCircle}
//             note={`${stats.completed} sur ${stats.total}`}
//           />
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ─── Composants ─── */

// const ACCENT = {
//   blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-500',   ring: 'ring-blue-100 dark:ring-blue-900' },
//   green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-500',  ring: 'ring-green-100 dark:ring-green-900' },
//   amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500',  ring: 'ring-amber-100 dark:ring-amber-900' },
//   purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',icon: 'text-purple-500',ring: 'ring-purple-100 dark:ring-purple-900' },
// };

// const KpiCard = ({ title, value, icon: Icon, accent }) => {
//   const a = ACCENT[accent] || ACCENT.blue;
//   return (
//     <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
//       <div className={`w-10 h-10 ${a.bg} ring-1 ${a.ring} rounded-xl flex items-center justify-center mb-3`}>
//         <Icon className={`w-5 h-5 ${a.icon}`} />
//       </div>
//       <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">
//         {value}
//       </p>
//       <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
//         {title}
//       </p>
//     </div>
//   );
// };

// const MiniStat = ({ label, value }) => (
//   <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[80px]">
//     <p className="text-white font-bold text-lg leading-none">{value}</p>
//     <p className="text-indigo-200 text-xs mt-1 whitespace-nowrap">{label}</p>
//   </div>
// );

// const SummaryRow = ({ label, value, icon: Icon, note, total }) => (
//   <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
//     <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
//       <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
//     </div>
//     <div className="min-w-0">
//       <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
//       <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
//     </div>
//     {note && (
//       <p className="ml-auto text-xs text-slate-400 dark:text-slate-500 text-right flex-shrink-0">
//         {note}{total !== undefined ? ` (${total})` : ''}
//       </p>
//     )}
//   </div>
// );

// export default AdminDashboardPage;
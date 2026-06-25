// src/pages/admin/AdminOrdersPage.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  User,
  Package,
  CreditCard,
  MoreVertical,
  ArrowUpDown,
  FileText,
  Printer,
  ClipboardList,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import adminService from '../../services/adminService';

// ─── Constantes ──────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  { value: 'En cours',   label: 'En cours',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  { value: 'Terminé',    label: 'Terminé',    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',   icon: CheckCircle },
  { value: 'En attente', label: 'En attente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',      icon: AlertCircle },
  { value: 'Annulé',     label: 'Annulé',     color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',          icon: XCircle },
];

const CATEGORY_OPTIONS = ['Tous', 'IMEI', 'Server', 'Rental', 'License'];

// ─── Utilitaires ─────────────────────────────────────────────────────────────

const formatDate = (d) =>
  d ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : 'N/A';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);

const extractClientData = (order) => {
  if (order.userSubmittedData && typeof order.userSubmittedData === 'object') {
    const entries = Object.entries(order.userSubmittedData).filter(([, v]) => v !== '' && v !== null && v !== undefined);
    if (entries.length) return entries;
  }
  if (order.fields && typeof order.fields === 'object') {
    const entries = Object.entries(order.fields).filter(([, v]) => v !== '' && v !== null && v !== undefined);
    if (entries.length) return entries;
  }
  return [];
};

const humanizeKey = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()
    .replace(/^\w/, (c) => c.toUpperCase());

// ─── Composants utilitaires ───────────────────────────────────────────────────

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

// ─── Composant section infos client enrichie ─────────────────────────────────

const ClientInfoSection = ({ user }) => {
  const roleConfig = {
    'Admin':               { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    'Utilisateur-Employer':{ color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    'Client':              { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  };
  const role = user?.role || 'Client';
  const roleCls = (roleConfig[role] || roleConfig['Client']).color;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-500" /> Informations client
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">

        {/* Nom */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Nom</p>
          <p className="font-medium text-gray-900 dark:text-white">{user?.name || '—'}</p>
        </div>

        {/* Email */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Email</p>
          <p className="font-medium text-gray-900 dark:text-white break-all">{user?.email || '—'}</p>
        </div>

        {/* Rôle */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Rôle
          </p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleCls}`}>
            {role}
          </span>
        </div>

        {/* Statut du compte */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Statut du compte</p>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            user?.isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            {user?.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Solde */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Solde
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(user?.balance ?? 0)}
          </p>
        </div>

        {/* Code employé (si présent) */}
        {user?.employeeCode && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Code employé</p>
            <p className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-900 dark:text-white inline-block">
              {user.employeeCode}
            </p>
          </div>
        )}

        {/* Membre depuis */}
        <div className="col-span-2">
          <p className="text-xs text-gray-400 mb-0.5">Membre depuis</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {user?.createdAt ? formatDate(user.createdAt) : '—'}
          </p>
        </div>

      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

const AdminOrdersPage = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [filters, setFilters]             = useState({ status: 'Tous', search: '', dateRange: 'all', category: 'Tous' });
  const [sortConfig, setSortConfig]       = useState({ key: 'date', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [stats, setStats]                 = useState({ total: 0, completed: 0, pending: 0, revenue: 0 });
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qcat = params.get('category');
    if (qcat) setFilters(f => ({ ...f, category: qcat }));
    fetchOrders();
  }, [location.search]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAllOrders();
      const list = response.data?.data || response.data || [];
      const arr  = Array.isArray(list) ? list : [];
      setOrders(arr);
      computeStats(arr);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setError('Impossible de charger les commandes.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (arr) => {
    const completed = arr.filter(o => o.status === 'Terminé').length;
    const pending   = arr.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
    const revenue   = arr.filter(o => o.status === 'Terminé').reduce((s, o) => s + (o.serviceDetails?.price || o.amount || 0), 0);
    setStats({ total: arr.length, completed, pending, revenue });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      const updated = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);
      computeStats(updated);
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  const openModal  = (order) => { setSelectedOrder(order); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelectedOrder(null); };

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (filters.category !== 'Tous') {
      list = list.filter(o => {
        const cat = (o.serviceId?.category || o.serviceDetails?.category || o.category || '').toString();
        return cat.toLowerCase() === filters.category.toLowerCase();
      });
    }
    if (filters.status !== 'Tous') {
      list = list.filter(o => o.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(o =>
        o.userId?.name?.toLowerCase().includes(q) ||
        o.userId?.email?.toLowerCase().includes(q) ||
        o.serviceId?.name?.toLowerCase().includes(q) ||
        o.serviceDetails?.name?.toLowerCase().includes(q)
      );
    }
    if (filters.dateRange !== 'all') {
      const now   = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      list = list.filter(o => {
        const d = new Date(o.createdAt);
        if (filters.dateRange === 'today') return d >= today;
        if (filters.dateRange === 'week')  { const w = new Date(today); w.setDate(w.getDate() - 7); return d >= w; }
        if (filters.dateRange === 'month') { const m = new Date(today); m.setMonth(m.getMonth() - 1); return d >= m; }
        return true;
      });
    }

    list.sort((a, b) => {
      let av, bv;
      if (sortConfig.key === 'client')       { av = a.userId?.name || ''; bv = b.userId?.name || ''; }
      else if (sortConfig.key === 'service') { av = a.serviceId?.name || a.serviceDetails?.name || ''; bv = b.serviceId?.name || b.serviceDetails?.name || ''; }
      else if (sortConfig.key === 'date')    { av = new Date(a.createdAt); bv = new Date(b.createdAt); }
      else if (sortConfig.key === 'price')   { av = a.amount || a.serviceDetails?.price || 0; bv = b.amount || b.serviceDetails?.price || 0; }
      else return 0;
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [orders, filters, sortConfig]);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Gestion des Commandes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez et suivez toutes les commandes de la plateforme</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total commandes"     value={stats.total}                   icon={Package}      color="text-blue-500"   bgColor="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard title="Commandes terminées" value={stats.completed}               icon={CheckCircle}  color="text-green-500"  bgColor="bg-green-50 dark:bg-green-900/20" />
        <StatCard title="En cours"            value={stats.pending}                 icon={Clock}        color="text-yellow-500" bgColor="bg-yellow-50 dark:bg-yellow-900/20" />
        <StatCard title="Chiffre d'affaires"  value={formatCurrency(stats.revenue)} icon={CreditCard}   color="text-purple-500" bgColor="bg-purple-50 dark:bg-purple-900/20" />
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" name="search" placeholder="Rechercher par client ou service..." value={filters.search} onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
          </div>
          {[
            { name: 'category',  options: CATEGORY_OPTIONS.map(c => ({ value: c, label: c === 'Tous' ? 'Toutes catégories' : c })) },
            { name: 'status',    options: [{ value: 'Tous', label: 'Tous les statuts' }, ...ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))] },
            { name: 'dateRange', options: [{ value: 'all', label: 'Toutes les dates' }, { value: 'today', label: "Aujourd'hui" }, { value: 'week', label: '7 derniers jours' }, { value: 'month', label: '30 derniers jours' }] },
          ].map(({ name, options }) => (
            <select key={name} name={name} value={filters[name]} onChange={handleFilterChange}
              className="md:w-48 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{filteredOrders.length} résultat(s)</span>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des commandes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchOrders} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Réessayer</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[
                    { key: 'client',  label: 'Client' },
                    { key: 'service', label: 'Service' },
                    { key: 'date',    label: 'Date' },
                    { key: 'price',   label: 'Prix', align: 'right' },
                    { key: 'status',  label: 'Statut' },
                    { key: 'actions', label: 'Actions', align: 'center' },
                  ].map(col => (
                    <th key={col.key} className={`px-6 py-4 text-${col.align || 'left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                      {col.key !== 'actions' && col.key !== 'status' ? (
                        <button onClick={() => handleSort(col.key)} className="group flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          {col.label}<SortIcon column={col.key} />
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.length > 0 ? filteredOrders.map(order => {
                  const statusConf = ORDER_STATUSES.find(s => s.value === order.status) || ORDER_STATUSES[2];
                  const clientData = extractClientData(order);
                  return (
                    <tr key={order._id} onClick={() => openModal(order)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{order.userId?.name || 'Utilisateur'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{order.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.serviceId?.name || order.serviceDetails?.name || 'Service'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.serviceId?.category || order.serviceDetails?.category || '—'}
                        </div>
                        {clientData.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <ClipboardList className="w-3 h-3 text-indigo-400" />
                            <span className="text-xs text-indigo-500">{clientData.length} champ(s)</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(order.amount || order.serviceDetails?.price || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-offset-2 ${statusConf.color}`}
                          style={{ backgroundColor: 'transparent' }}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800">{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openModal(order)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Voir détails">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Plus d'options">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Aucune commande trouvée</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de <span className="font-medium">{filteredOrders.length}</span> commande(s)
            </p>
          </div>
        )}
      </div>

      {/* ── MODAL DÉTAILS ── */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails de la commande</h2>
                <p className="text-xs text-gray-400 font-mono mt-1">{selectedOrder._id}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Statut + Montant */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${ORDER_STATUSES.find(s => s.value === selectedOrder.status)?.color}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Montant</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(selectedOrder.amount || selectedOrder.serviceDetails?.price || 0)}
                  </p>
                </div>
              </div>

              {/* ✅ Informations client enrichies */}
              <ClientInfoSection user={selectedOrder.userId} />

              {/* Service commandé */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-500" /> Service commandé
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Nom</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.serviceId?.name || selectedOrder.serviceDetails?.name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Catégorie</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.serviceId?.category || selectedOrder.serviceDetails?.category || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Données soumises par le client */}
              {(() => {
                const entries = extractClientData(selectedOrder);
                if (!entries.length) return (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                    <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucune donnée soumise par le client</p>
                  </div>
                );
                return (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-indigo-100 dark:bg-indigo-900/40 border-b border-indigo-200 dark:border-indigo-800">
                      <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-semibold text-indigo-700 dark:text-indigo-300">
                        Informations soumises par le client
                      </h3>
                      <span className="ml-auto text-xs bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        {entries.length} champ(s)
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entries.map(([key, value]) => (
                        <div key={key} className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm">
                          <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">
                            {humanizeKey(key)}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Notes admin */}
              {selectedOrder.adminNotes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Notes admin
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOrder.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => {
                  const next = selectedOrder.status === 'En attente' ? 'En cours'
                    : selectedOrder.status === 'En cours' ? 'Terminé' : 'En cours';
                  handleStatusChange(selectedOrder._id, next);
                }}
                className="flex-1 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                {selectedOrder.status === 'Terminé' ? 'Réouvrir' : selectedOrder.status === 'En attente' ? 'Commencer' : 'Terminer'}
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Printer className="w-5 h-5" /> Imprimer
              </button>
              <button onClick={closeModal} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;

// // src/pages/admin/AdminOrdersPage.jsx
// import { useState, useEffect, useMemo } from 'react';
// import { 
//   Search, 
//   Filter, 
//   ChevronDown, 
//   ChevronUp,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Eye,
//   Download,
//   RefreshCw,
//   Calendar,
//   User,
//   Package,
//   CreditCard,
//   MoreVertical,
//   ArrowUpDown,
//   FileText,
//   Printer
// } from 'lucide-react';
// import { useLocation } from 'react-router-dom';
// import adminService from '../../services/adminService';

// const orderStatuses = [
//   { value: 'En cours', label: 'En cours', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
//   { value: 'Terminé', label: 'Terminé', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
//   { value: 'En attente', label: 'En attente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
//   { value: 'Annulé', label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
// ];

// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   return new Intl.DateTimeFormat('fr-FR', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   }).format(date);
// };

// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('fr-FR', {
//     style: 'currency',
//     currency: 'EUR'
//   }).format(amount || 0);
// };

// /**
//  * Page de gestion de toutes les commandes pour l'administrateur.
//  */
// const AdminOrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const location = useLocation();
//   const [filters, setFilters] = useState({ status: 'Tous', search: '', dateRange: 'all', category: 'Tous' });
//   const categoryOptions = ['Tous', 'IMEI', 'Server', 'Rental', 'License'];
//   const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [stats, setStats] = useState({
//     total: 0,
//     completed: 0,
//     pending: 0,
//     revenue: 0
//   });

//   useEffect(() => {
//     // Appliquer filtre de catégorie depuis query param (utile pour nav links)
//     const params = new URLSearchParams(location.search);
//     const qcat = params.get('category');
//     if (qcat) {
//       setFilters(f => ({ ...f, category: qcat }));
//     }
//     fetchOrders();
//   }, [location.search]);

//  // AdminOrdersPage.jsx - Version corrigée

// const fetchOrders = async () => {
//   setLoading(true);
//   setError('');
//   try {
//     const response = await adminService.getAllOrders();
//     console.log("Réponse brute:", response);
    
//     // ✅ CORRECTION: Vérifier la structure de la réponse
//     if (response.data && response.data.success && Array.isArray(response.data.data)) {
//       // Nouvelle structure avec { success, data }
//       setOrders(response.data.data);
      
//       // Calculer les stats
//       const ordersList = response.data.data;
//       const total = ordersList.length;
//       const completed = ordersList.filter(o => o.status === 'Terminé').length;
//       const pending = ordersList.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
//       const revenue = ordersList
//         .filter(o => o.status === 'Terminé')
//         .reduce((sum, o) => sum + (o.serviceDetails?.price || o.amount || 0), 0);
      
//       setStats({ total, completed, pending, revenue });
//     } 
//     else if (Array.isArray(response.data)) {
//       // Ancienne structure (simple tableau)
//       setOrders(response.data);
      
//       const total = response.data.length;
//       const completed = response.data.filter(o => o.status === 'Terminé').length;
//       const pending = response.data.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
//       const revenue = response.data
//         .filter(o => o.status === 'Terminé')
//         .reduce((sum, o) => sum + (o.serviceDetails?.price || o.amount || 0), 0);
      
//       setStats({ total, completed, pending, revenue });
//     }
//     else {
//       console.error("Format de réponse inattendu:", response);
//       setOrders([]);
//     }
//   } catch (error) {
//     console.error('Erreur lors du chargement des commandes:', error);
//     setError('Impossible de charger les commandes. Veuillez réessayer.');
//     setOrders([]);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSort = (key) => {
//     setSortConfig(prev => ({
//       key,
//       direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
//     }));
//   };

//   const handleStatusChange = async (orderId, newStatus) => {
//     try {
//       const response = await adminService.updateOrderStatus(orderId, newStatus);
//       setOrders(orders.map(o => o._id === orderId ? { ...o, status: response.data.status } : o));
      
//       // Mettre à jour les stats
//       const updatedOrders = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
//       const completed = updatedOrders.filter(o => o.status === 'Terminé').length;
//       const pending = updatedOrders.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
//       const revenue = updatedOrders
//         .filter(o => o.status === 'Terminé')
//         .reduce((sum, o) => sum + (o.serviceDetails?.price || o.price || 0), 0);
      
//       setStats(prev => ({ ...prev, completed, pending, revenue }));
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour du statut:', error);
//     }
//   };

//   // Logique de filtrage
//   const filteredOrders = useMemo(() => {
//     let filtered = [...orders];

//     // Filtre par catégorie
//     if (filters.category && filters.category !== 'Tous') {
//       filtered = filtered.filter(order => {
//         const cat = (order.service?.category || order.serviceDetails?.category || order.category || '').toString();
//         return cat.toLowerCase() === filters.category.toLowerCase();
//       });
//     }


//     // Filtre par recherche
//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(order => 
//         order.user?.name?.toLowerCase().includes(searchLower) ||
//         order.user?.email?.toLowerCase().includes(searchLower) ||
//         order.service?.name?.toLowerCase().includes(searchLower) ||
//         order.serviceDetails?.name?.toLowerCase().includes(searchLower)
//       );
//     }

//     // Filtre par date
//     if (filters.dateRange !== 'all') {
//       const now = new Date();
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
//       filtered = filtered.filter(order => {
//         const orderDate = new Date(order.date || order.createdAt);
        
//         switch (filters.dateRange) {
//           case 'today':
//             return orderDate >= today;
//           case 'week':
//             const weekAgo = new Date(today);
//             weekAgo.setDate(weekAgo.getDate() - 7);
//             return orderDate >= weekAgo;
//           case 'month':
//             const monthAgo = new Date(today);
//             monthAgo.setMonth(monthAgo.getMonth() - 1);
//             return orderDate >= monthAgo;
//           default:
//             return true;
//         }
//       });
//     }

//     // Tri
//     filtered.sort((a, b) => {
//       let aValue, bValue;
      
//       switch (sortConfig.key) {
//         case 'client':
//           aValue = a.user?.name || a.user?.email || '';
//           bValue = b.user?.name || b.user?.email || '';
//           break;
//         case 'service':
//           aValue = a.service?.name || a.serviceDetails?.name || '';
//           bValue = b.service?.name || b.serviceDetails?.name || '';
//           break;
//         case 'date':
//           aValue = new Date(a.date || a.createdAt);
//           bValue = new Date(b.date || b.createdAt);
//           break;
//         case 'price':
//           aValue = a.serviceDetails?.price || a.price || 0;
//           bValue = b.serviceDetails?.price || b.price || 0;
//           break;
//         default:
//           return 0;
//       }

//       if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//       if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//       return 0;
//     });

//     return filtered;
//   }, [orders, filters, sortConfig]);

//   const SortIcon = ({ column }) => {
//     if (sortConfig.key !== column) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />;
//     return sortConfig.direction === 'asc' 
//       ? <ChevronUp className="w-4 h-4 ml-1" />
//       : <ChevronDown className="w-4 h-4 ml-1" />;
//   };

//   const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
//     <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
//           <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
//         </div>
//         <div className={`p-3 rounded-xl ${bgColor}`}>
//           <Icon className={`w-6 h-6 ${color}`} />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       {/* En-tête */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
//             Gestion des Commandes
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 mt-1">
//             Gérez et suivez toutes les commandes de la plateforme
//           </p>
//         </div>
        
//         <button
//           onClick={fetchOrders}
//           className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//         >
//           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//           <span>Actualiser</span>
//         </button>
//       </div>

//       {/* Cartes de statistiques */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title="Total commandes"
//           value={stats.total}
//           icon={Package}
//           color="text-blue-500"
//           bgColor="bg-blue-50 dark:bg-blue-900/20"
//         />
//         <StatCard
//           title="Commandes terminées"
//           value={stats.completed}
//           icon={CheckCircle}
//           color="text-green-500"
//           bgColor="bg-green-50 dark:bg-green-900/20"
//         />
//         <StatCard
//           title="En cours"
//           value={stats.pending}
//           icon={Clock}
//           color="text-yellow-500"
//           bgColor="bg-yellow-50 dark:bg-yellow-900/20"
//         />
//         <StatCard
//           title="Chiffre d'affaires"
//           value={formatCurrency(stats.revenue)}
//           icon={CreditCard}
//           color="text-purple-500"
//           bgColor="bg-purple-50 dark:bg-purple-900/20"
//         />
//       </div>

//       {/* Barre de filtres */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
//         <div className="flex flex-col md:flex-row gap-4">
//           {/* Recherche */}
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               name="search"
//               placeholder="Rechercher par client, email ou service..."
//               value={filters.search}
//               onChange={handleFilterChange}
//               className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
//             />
//           </div>

//           {/* Filtre catégorie */}
//           <div className="md:w-48">
//             <select
//               name="category"
//               value={filters.category}
//               onChange={handleFilterChange}
//               className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
//             >
//               {categoryOptions.map(cat => (
//                 <option key={cat} value={cat}>{cat === 'Tous' ? 'Toutes catégories' : cat}</option>
//               ))}
//             </select>
//           </div>

//           {/* Filtre statut */}
//           <div className="md:w-48">
//             <select
//               name="status"
//               value={filters.status}
//               onChange={handleFilterChange}
//               className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
//               style={{ backgroundImage: 'none' }}
//             >
//               <option value="Tous">Tous les statuts</option>
//               {orderStatuses.map(s => (
//                 <option key={s.value} value={s.value}>{s.label}</option>
//               ))}
//             </select>
//           </div>

//           {/* Filtre date */}
//           <div className="md:w-48">
//             <select
//               name="dateRange"
//               value={filters.dateRange}
//               onChange={handleFilterChange}
//               className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
//             >
//               <option value="all">Toutes les dates</option>
//               <option value="today">Aujourd'hui</option>
//               <option value="week">7 derniers jours</option>
//               <option value="month">30 derniers jours</option>
//             </select>
//           </div>

//           {/* Résultats */}
//           <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//             <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
//               {filteredOrders.length} résultat(s)
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Tableau des commandes */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
//             </div>
//             <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des commandes...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-20">
//             <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//             <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
//             <button
//               onClick={fetchOrders}
//               className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               Réessayer
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   {[
//                     { key: 'client', label: 'Client' },
//                     { key: 'service', label: 'Service' },
//                     { key: 'date', label: 'Date' },
//                     { key: 'price', label: 'Prix', align: 'right' },
//                     { key: 'status', label: 'Statut' },
//                     { key: 'actions', label: 'Actions', align: 'center' }
//                   ].map((column) => (
//                     <th
//                       key={column.key}
//                       className={`px-6 py-4 text-${column.align || 'left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
//                     >
//                       {column.key !== 'actions' && column.key !== 'status' ? (
//                         <button
//                           onClick={() => handleSort(column.key)}
//                           className="group flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
//                         >
//                           {column.label}
//                           <SortIcon column={column.key} />
//                         </button>
//                       ) : (
//                         column.label
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {filteredOrders.length > 0 ? (
//                   filteredOrders.map((order) => {
//                     const statusConfig = orderStatuses.find(s => s.value === order.status) || orderStatuses[2];
//                     const StatusIcon = statusConfig.icon;
                    
//                     return (
//                       <tr 
//                         key={order._id} 
//                         className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
//                         onClick={() => {
//                           setSelectedOrder(order);
//                           setShowDetailsModal(true);
//                         }}
//                       >
//                         <td className="px-6 py-4">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
//                               <User className="h-5 w-5 text-white" />
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm font-medium text-gray-900 dark:text-white">
//                                 {order.user?.name || 'Utilisateur'}
//                               </div>
//                               <div className="text-sm text-gray-500 dark:text-gray-400">
//                                 {order.user?.email}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="text-sm font-medium text-gray-900 dark:text-white">
//                             {order.service?.name || order.serviceDetails?.name || 'Service'}
//                           </div>
//                           <div className="text-xs text-gray-500 dark:text-gray-400">
//                             {order.service?.type || 'N/A'}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
//                             <Calendar className="w-4 h-4 mr-2" />
//                             {formatDate(order.date || order.createdAt)}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-right">
//                           <span className="text-lg font-bold text-gray-900 dark:text-white">
//                             {formatCurrency(order.serviceDetails?.price || order.price || 0)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <select
//                             value={order.status}
//                             onChange={(e) => {
//                               e.stopPropagation();
//                               handleStatusChange(order._id, e.target.value);
//                             }}
//                             onClick={(e) => e.stopPropagation()}
//                             className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-offset-2 ${statusConfig.color}`}
//                             style={{ backgroundColor: 'transparent' }}
//                           >
//                             {orderStatuses.map(s => (
//                               <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800">
//                                 {s.label}
//                               </option>
//                             ))}
//                           </select>
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           <div className="flex items-center justify-center gap-2">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedOrder(order);
//                                 setShowDetailsModal(true);
//                               }}
//                               className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
//                               title="Voir détails"
//                             >
//                               <Eye className="w-5 h-5" />
//                             </button>
//                             <button
//                               onClick={(e) => e.stopPropagation()}
//                               className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
//                               title="Télécharger"
//                             >
//                               <Download className="w-5 h-5" />
//                             </button>
//                             <button
//                               onClick={(e) => e.stopPropagation()}
//                               className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
//                               title="Plus d'options"
//                             >
//                               <MoreVertical className="w-5 h-5" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="px-6 py-20 text-center">
//                       <div className="flex flex-col items-center">
//                         <Package className="w-12 h-12 text-gray-400 mb-4" />
//                         <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune commande trouvée</p>
//                         <p className="text-sm text-gray-400 dark:text-gray-500">
//                           Essayez de modifier vos filtres de recherche
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !error && filteredOrders.length > 0 && (
//           <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Affichage de <span className="font-medium">{filteredOrders.length}</span> commandes
//               </p>
//               <div className="flex gap-2">
//                 <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50">
//                   Précédent
//                 </button>
//                 <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
//                   1
//                 </button>
//                 <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
//                   2
//                 </button>
//                 <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
//                   3
//                 </button>
//                 <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
//                   Suivant
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* MODAL DE DÉTAILS DE COMMANDE ENRICHIE */}
//       {showDetailsModal && selectedOrder && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   Détails de la commande
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                   Référence: <span className="font-mono">{selectedOrder._id}</span>
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowDetailsModal(false)}
//                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//               >
//                 <XCircle className="w-6 h-6 text-gray-500" />
//               </button>
//             </div>
            
//             <div className="p-6 space-y-6">
//               {/* EN-TÊTE AVEC STATUT ET CODE */}
//               <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Code commande</p>
//                     <p className="text-xl font-bold text-gray-900 dark:text-white">
//                       {selectedOrder.orderCode || 'N/A'}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Statut actuel</p>
//                     <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
//                       orderStatuses.find(s => s.value === selectedOrder.status)?.color
//                     }`}>
//                       {selectedOrder.status}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* SECTION 1: INFORMATIONS CLIENT (id, email) */}
//               <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                   <User className="w-5 h-5 text-blue-500" />
//                   Informations client
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">ID Utilisateur</p>
//                     <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
//                       {selectedOrder.user?._id || 'N/A'}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
//                     <p className="font-medium text-gray-900 dark:text-white">
//                       {selectedOrder.user?.email || 'N/A'}
//                     </p>
//                   </div>
//                   {selectedOrder.user?.name && (
//                     <div className="col-span-2">
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Nom</p>
//                       <p className="font-medium text-gray-900 dark:text-white">
//                         {selectedOrder.user.name}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* SECTION 2: INFORMATIONS SERVICE (nom, type, prix) */}
//               <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                   <Package className="w-5 h-5 text-green-500" />
//                   Détails du service
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="col-span-2">
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Nom du service</p>
//                     <p className="font-medium text-gray-900 dark:text-white">
//                       {selectedOrder.service?.name || selectedOrder.serviceDetails?.name || 'N/A'}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Type de service</p>
//                     <p className="font-medium text-gray-900 dark:text-white">
//                       {selectedOrder.service?.type || 'Non spécifié'}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">ID Service</p>
//                     <p className="font-mono text-sm text-gray-900 dark:text-white">
//                       {selectedOrder.service?._id?.slice(-8) || 'N/A'}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Prix unitaire</p>
//                     <p className="font-medium text-green-600 dark:text-green-400">
//                       {formatCurrency(selectedOrder.serviceDetails?.price || selectedOrder.price || 0)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* SECTION 3: INFORMATIONS COMMANDE (date, prix, statut) */}
//               <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                   <FileText className="w-5 h-5 text-purple-500" />
//                   Informations commande
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Date de commande</p>
//                     <p className="font-medium text-gray-900 dark:text-white">
//                       {formatDate(selectedOrder.date || selectedOrder.createdAt)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Prix total</p>
//                     <p className="font-bold text-lg text-green-600 dark:text-green-400">
//                       {formatCurrency(selectedOrder.serviceDetails?.price || selectedOrder.price || 0)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Date de création</p>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">
//                       {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
//                         day: '2-digit',
//                         month: '2-digit',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">
//                       {selectedOrder.updatedAt ? formatDate(selectedOrder.updatedAt) : 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* SECTION 4: ASSIGNATION (si applicable) */}
//               {(selectedOrder.assignedEmployee || selectedOrder.employeeCode) && (
//                 <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
//                   <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                     <User className="w-5 h-5 text-orange-500" />
//                     Assignation
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     {selectedOrder.employeeCode && (
//                       <div>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Code employé</p>
//                         <p className="font-mono text-sm text-gray-900 dark:text-white">
//                           {selectedOrder.employeeCode}
//                         </p>
//                       </div>
//                     )}
//                     {selectedOrder.assignedEmployee && (
//                       <div>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Employé assigné</p>
//                         <p className="font-medium text-gray-900 dark:text-white">
//                           {selectedOrder.assignedEmployee.name || selectedOrder.assignedEmployee.email || 'N/A'}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* SECTION 5: CHAMPS SUPPLÉMENTAIRES DYNAMIQUES */}
//               {selectedOrder.fields && Object.keys(selectedOrder.fields).length > 0 && (
//                 <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
//                   <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                     <FileText className="w-5 h-5 text-indigo-500" />
//                     Informations complémentaires
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     {Object.entries(selectedOrder.fields).map(([key, value]) => (
//                       <div key={key}>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
//                           {key.replace(/([A-Z])/g, ' $1').trim()}
//                         </p>
//                         <p className="font-medium text-gray-900 dark:text-white break-words">
//                           {typeof value === 'object' ? JSON.stringify(value) : String(value)}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* RÉSUMÉ COMPACT AVEC TOUTES LES INFOS ESSENTIELLES */}
//               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-blue-500" />
//                   Récapitulatif
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
//                   <div>
//                     <span className="text-gray-500 dark:text-gray-400">ID:</span>
//                     <span className="ml-2 font-mono text-gray-900 dark:text-white">
//                       {selectedOrder._id.slice(-8)}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="text-gray-500 dark:text-gray-400">Client:</span>
//                     <span className="ml-2 text-gray-900 dark:text-white">
//                       {selectedOrder.user?.email?.split('@')[0] || 'N/A'}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="text-gray-500 dark:text-gray-400">Service:</span>
//                     <span className="ml-2 text-gray-900 dark:text-white">
//                       {(selectedOrder.service?.name || selectedOrder.serviceDetails?.name || 'N/A').substring(0, 15)}
//                       {(selectedOrder.service?.name || selectedOrder.serviceDetails?.name || '').length > 15 ? '...' : ''}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="text-gray-500 dark:text-gray-400">Type:</span>
//                     <span className="ml-2 text-gray-900 dark:text-white">
//                       {selectedOrder.service?.type || 'N/A'}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="text-gray-500 dark:text-gray-400">Date:</span>
//                     <span className="ml-2 text-gray-900 dark:text-white">
//                       {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="text-gray-500 dark:text-gray-400">Prix:</span>
//                     <span className="ml-2 font-bold text-green-600 dark:text-green-400">
//                       {formatCurrency(selectedOrder.serviceDetails?.price || selectedOrder.price || 0)}
//                     </span>
//                   </div>
//                   <div className="col-span-2 md:col-span-3">
//                     <span className="text-gray-500 dark:text-gray-400">Statut:</span>
//                     <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
//                       orderStatuses.find(s => s.value === selectedOrder.status)?.color
//                     }`}>
//                       {selectedOrder.status}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* ACTIONS */}
//               <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <button
//                   onClick={() => {
//                     const newStatus = selectedOrder.status === 'En cours' ? 'Terminé' : 
//                                      selectedOrder.status === 'En attente' ? 'En cours' : 'En cours';
//                     handleStatusChange(selectedOrder._id, newStatus);
//                     setShowDetailsModal(false);
//                   }}
//                   className="flex-1 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <CheckCircle className="w-5 h-5" />
//                   {selectedOrder.status === 'Terminé' ? 'Réouvrir' : 
//                    selectedOrder.status === 'Annulé' ? 'Réactiver' : 
//                    selectedOrder.status === 'En attente' ? 'Commencer' : 
//                    selectedOrder.status === 'En cours' ? 'Terminer' : 'Changer statut'}
//                 </button>
//                 <button
//                   onClick={() => {
//                     window.print();
//                   }}
//                   className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <Printer className="w-5 h-5" />
//                   Imprimer
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowDetailsModal(false);
//                     // Vous pouvez ajouter ici la logique d'édition
//                   }}
//                   className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
//                 >
//                   Modifier
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminOrdersPage;
// src/pages/admin/AdminOrdersPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  User,
  Package,
  CreditCard,
  MoreVertical,
  ArrowUpDown,
  FileText,
  Printer
} from 'lucide-react';
import adminService from '../../services/adminService';

const orderStatuses = [
  { value: 'En cours', label: 'En cours', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  { value: 'Terminé', label: 'Terminé', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  { value: 'En attente', label: 'En attente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
  { value: 'Annulé', label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
};

/**
 * Page de gestion de toutes les commandes pour l'administrateur.
 */
const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'Tous', search: '', dateRange: 'all' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAllOrders();
      setOrders(response.data);
      
      // Calculer les stats
      const total = response.data.length;
      const completed = response.data.filter(o => o.status === 'Terminé').length;
      const pending = response.data.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
      const revenue = response.data
        .filter(o => o.status === 'Terminé')
        .reduce((sum, o) => sum + (o.serviceDetails?.price || o.price || 0), 0);
      
      setStats({ total, completed, pending, revenue });
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: response.data.status } : o));
      
      // Mettre à jour les stats
      const updatedOrders = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
      const completed = updatedOrders.filter(o => o.status === 'Terminé').length;
      const pending = updatedOrders.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
      const revenue = updatedOrders
        .filter(o => o.status === 'Terminé')
        .reduce((sum, o) => sum + (o.serviceDetails?.price || o.price || 0), 0);
      
      setStats(prev => ({ ...prev, completed, pending, revenue }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Logique de filtrage
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filtre par statut
    if (filters.status !== 'Tous') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        order.service?.name?.toLowerCase().includes(searchLower) ||
        order.serviceDetails?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par date
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date || order.createdAt);
        
        switch (filters.dateRange) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'client':
          aValue = a.user?.name || a.user?.email || '';
          bValue = b.user?.name || b.user?.email || '';
          break;
        case 'service':
          aValue = a.service?.name || a.serviceDetails?.name || '';
          bValue = b.service?.name || b.serviceDetails?.name || '';
          break;
        case 'date':
          aValue = new Date(a.date || a.createdAt);
          bValue = new Date(b.date || b.createdAt);
          break;
        case 'price':
          aValue = a.serviceDetails?.price || a.price || 0;
          bValue = b.serviceDetails?.price || b.price || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, filters, sortConfig]);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />;
  };

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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Gestion des Commandes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gérez et suivez toutes les commandes de la plateforme
          </p>
        </div>
        
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Cartes de statistiques */}
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
          value={stats.pending}
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

      {/* Barre de filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="search"
              placeholder="Rechercher par client, email ou service..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Filtre statut */}
          <div className="md:w-48">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
              style={{ backgroundImage: 'none' }}
            >
              <option value="Tous">Tous les statuts</option>
              {orderStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre date */}
          <div className="md:w-48">
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>
          </div>

          {/* Résultats */}
          <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {filteredOrders.length} résultat(s)
            </span>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des commandes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[
                    { key: 'client', label: 'Client' },
                    { key: 'service', label: 'Service' },
                    { key: 'date', label: 'Date' },
                    { key: 'price', label: 'Prix', align: 'right' },
                    { key: 'status', label: 'Statut' },
                    { key: 'actions', label: 'Actions', align: 'center' }
                  ].map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-4 text-${column.align || 'left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                    >
                      {column.key !== 'actions' && column.key !== 'status' ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="group flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {column.label}
                          <SortIcon column={column.key} />
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusConfig = orderStatuses.find(s => s.value === order.status) || orderStatuses[2];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {order.user?.name || 'Utilisateur'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {order.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.service?.name || order.serviceDetails?.name || 'Service'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {order._id.slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(order.date || order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(order.serviceDetails?.price || order.price || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-offset-2 ${statusConfig.color}`}
                            style={{ backgroundColor: 'transparent' }}
                          >
                            {orderStatuses.map(s => (
                              <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              title="Plus d'options"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune commande trouvée</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Essayez de modifier vos filtres de recherche
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Affichage de <span className="font-medium">{filteredOrders.length}</span> commandes
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50">
                  Précédent
                </button>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                  1
                </button>
                <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                  2
                </button>
                <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                  3
                </button>
                <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails de commande */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Détails de la commande
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations client */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Informations client
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.user?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.user?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations service */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-500" />
                  Détails du service
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Service</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.service?.name || selectedOrder.serviceDetails?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Prix</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedOrder.serviceDetails?.price || selectedOrder.price || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedOrder.date || selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations de commande */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Informations commande
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">ID Commande</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {selectedOrder._id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Statut</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      orderStatuses.find(s => s.value === selectedOrder.status)?.color
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  {selectedOrder.fields && Object.keys(selectedOrder.fields).length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Champs supplémentaires
                      </p>
                      {Object.entries(selectedOrder.fields).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                          <span className="text-gray-900 dark:text-white font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    // Imprimer la commande
                    window.print();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Imprimer
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    // Ici vous pourriez ouvrir un modal de modification
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
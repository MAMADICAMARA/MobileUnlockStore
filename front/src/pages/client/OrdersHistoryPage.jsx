// src/pages/client/OrdersHistoryPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MoreVertical,
  FileText,
  Printer
} from 'lucide-react';
import orderService from '../../services/orderService';
import useAuth from '../../hooks/useAuth';

/**
 * Page d'historique des commandes du client.
 * Affiche toutes les commandes passées avec filtres par statut et recherche.
 */
const OrdersHistoryPage = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalSpent: 0
  });

  // Récupère l'historique des commandes
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await orderService.getHistory();
        const ordersData = response.data || [];
        setOrders(ordersData);
        
        // Calculer les statistiques
        const total = ordersData.length;
        const completed = ordersData.filter(o => o.status === 'Terminé').length;
        const pending = ordersData.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
        const totalSpent = ordersData
          .filter(o => o.status === 'Terminé')
          .reduce((sum, o) => sum + (o.price || 0), 0);
        
        setStats({ total, completed, pending, totalSpent });
      } catch (err) {
        console.error('Erreur lors du chargement des commandes:', err);
        setError("Impossible de charger l'historique des commandes.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Configuration des statuts
  const statusConfig = {
    'Terminé': {
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    'En cours': {
      icon: Clock,
      color: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    'En attente': {
      icon: AlertCircle,
      color: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    'Annulé': {
      icon: XCircle,
      color: 'bg-gradient-to-r from-red-500/10 to-pink-500/10',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  };

  const statusTabs = ['Tous', 'Terminé', 'En cours', 'En attente', 'Annulé'];

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Formatage du prix
  const formatPrice = (price) => {
    if (!price) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Gestion du tri
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filtrage et tri des commandes
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const status = order?.status || '';
      return filterStatus === 'Tous' || status === filterStatus;
    });

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const serviceName = order?.serviceName || '';
        const orderId = order?._id || '';
        return serviceName.toLowerCase().includes(searchLower) ||
               orderId.toLowerCase().includes(searchLower);
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'service':
          aValue = a.serviceName || '';
          bValue = b.serviceName || '';
          break;
        case 'date':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, filterStatus, searchTerm, sortConfig]);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 text-${color.split(' ')[0].replace('from-', '')}-500`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Historique des commandes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Consultez et suivez toutes vos commandes
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total commandes"
          value={stats.total}
          icon={ShoppingBag}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Commandes terminées"
          value={stats.completed}
          icon={CheckCircle}
          trend="up"
          trendValue="+15%"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="En cours"
          value={stats.pending}
          icon={Clock}
          color="from-yellow-500 to-amber-500"
        />
        <StatCard
          title="Total dépensé"
          value={formatPrice(stats.totalSpent)}
          icon={DollarSign}
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col gap-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par service ou numéro de commande..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Filter className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filtres par statut */}
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              {statusTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterStatus === tab
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Résultats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {filteredOrders.length} commande(s)
              </span>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement de vos commandes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {[
                      { key: 'service', label: 'Service', align: 'left' },
                      { key: 'date', label: 'Date', align: 'left' },
                      { key: 'status', label: 'Statut', align: 'left' },
                      { key: 'price', label: 'Prix', align: 'right' },
                      { key: 'actions', label: 'Actions', align: 'center' }
                    ].map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-4 text-${column.align} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
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
                      const status = order?.status || 'En attente';
                      const config = statusConfig[status] || statusConfig['En attente'];
                      const StatusIcon = config.icon;

                      return (
                        <tr 
                          key={order._id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {order?.serviceName || "Service inconnu"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Réf: #{order._id?.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(order?.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.color} ${config.textColor} border ${config.borderColor}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {order?.status || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatPrice(order?.price)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Voir détails"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Télécharger la facture"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
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
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune commande trouvée</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            {searchTerm 
                              ? 'Essayez de modifier vos critères de recherche'
                              : 'Vos commandes apparaîtront ici'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Affichage de <span className="font-medium">1</span> à{' '}
                    <span className="font-medium">{Math.min(10, filteredOrders.length)}</span> sur{' '}
                    <span className="font-medium">{filteredOrders.length}</span> commandes
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
          </>
        )}
      </div>

      {/* Modal de détails de commande */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Détails de la commande
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* En-tête avec statut */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Commande</p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      #{selectedOrder._id}
                    </p>
                  </div>
                </div>
                <StatusBadge status={selectedOrder.status} />
              </div>

              {/* Service */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Service commandé
                </h3>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {selectedOrder.serviceName}
                </p>
                {selectedOrder.serviceDescription && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedOrder.serviceDescription}
                  </p>
                )}
              </div>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prix total</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatPrice(selectedOrder.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              {selectedOrder.fields && Object.keys(selectedOrder.fields).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    Informations fournies
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(selectedOrder.fields).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    // Imprimer la facture
                    window.print();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Imprimer
                </button>
                <button
                  onClick={() => {
                    // Télécharger la facture
                    alert('Téléchargement de la facture...');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Facture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant StatusBadge pour le modal
const StatusBadge = ({ status }) => {
  const config = {
    'Terminé': {
      icon: CheckCircle,
      bg: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800'
    },
    'En cours': {
      icon: Clock,
      bg: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    'En attente': {
      icon: AlertCircle,
      bg: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    'Annulé': {
      icon: XCircle,
      bg: 'bg-gradient-to-r from-red-500/10 to-pink-500/10',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800'
    }
  };

  const { icon: Icon, bg, text, border } = config[status] || config['En attente'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text} border ${border}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export default OrdersHistoryPage;
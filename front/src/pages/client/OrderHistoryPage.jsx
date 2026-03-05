// src/pages/client/OrderHistoryPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ShoppingBag, 
  DollarSign,
  X,
  Loader,
  Hash,
  Tag,
  CreditCard,
  User,
  FileText,
  Info,
  Copy
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { formatOrderStatus } from '../../services/orderService';

/**
 * Page d'historique des commandes du client.
 * Affiche toutes les commandes passées avec filtres par statut et recherche.
 */
const OrderHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // État pour les commandes et le chargement
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // État pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  
  // État pour les détails de commande
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  
  // État pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalSpent: 0
  });

  const location = useLocation();

  // Catégories disponibles
  const categoryTabs = ['Tous', 'imei', 'serveur', 'remote', 'licences'];

  // Récupère l'historique des commandes au chargement
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await orderService.getHistory();
        const ordersData = response.data?.data || response.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        
        // Calculer les statistiques
        const total = ordersData.length;
        const completed = ordersData.filter(o => o.status === 'completed' || o.status === 'Terminé').length;
        const pending = ordersData.filter(o => 
          o.status === 'pending' || o.status === 'processing' || 
          o.status === 'En attente' || o.status === 'En cours'
        ).length;
        const totalSpent = ordersData
          .filter(o => o.status === 'completed' || o.status === 'Terminé')
          .reduce((sum, o) => sum + (o.amount || 0), 0);
        
        setStats({ total, completed, pending, totalSpent });

        const params = new URLSearchParams(location.search);
        const qcat = params.get('category');
        if (qcat) {
          setFilterCategory(qcat);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement des commandes:', err);
        setError("Impossible de charger l'historique des commandes.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [location.search]);

  // Configuration des statuts
  const statusConfig = {
    'pending': {
      icon: AlertCircle,
      labelFr: '⏳ En attente',
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    'processing': {
      icon: Clock,
      labelFr: '🔄 En cours',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    'completed': {
      icon: CheckCircle,
      labelFr: '✅ Terminé',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    'En attente': {
      icon: AlertCircle,
      labelFr: '⏳ En attente',
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    'En cours': {
      icon: Clock,
      labelFr: '🔄 En cours',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    'Terminé': {
      icon: CheckCircle,
      labelFr: '✅ Terminé',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800'
    }
  };

  /**
   * Formate une date pour l'affichage
   */
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

  /**
   * Formate un montant en euros
   */
  const formatPrice = (price) => {
    if (!price && price !== 0) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  /**
   * Copie un texte dans le presse-papier
   */
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Gère le changement de critère de tri
   */
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  /**
   * Filtre et trie les commandes
   */
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const status = order?.status || '';
      if (filterStatus === 'Tous') return true;
      return status === filterStatus;
    });

    if (filterCategory !== 'Tous') {
      filtered = filtered.filter(order => {
        const cat = (order?.serviceDetails?.category || order?.service?.category || '').toString().toLowerCase();
        return cat === filterCategory.toLowerCase();
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const serviceName = order?.serviceDetails?.name || '';
        const orderId = order?._id || '';
        const transactionId = order?.transactionId || '';
        return serviceName.toLowerCase().includes(searchLower) ||
               orderId.toLowerCase().includes(searchLower) ||
               transactionId.toLowerCase().includes(searchLower);
      });
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'serviceName':
          aValue = a?.serviceDetails?.name || '';
          bValue = b?.serviceDetails?.name || '';
          break;
        case 'createdAt':
          aValue = new Date(a?.createdAt || 0);
          bValue = new Date(b?.createdAt || 0);
          break;
        case 'amount':
          aValue = a?.amount || 0;
          bValue = b?.amount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, filterStatus, filterCategory, searchTerm, sortConfig]);

  /**
   * Ouvre le modal des détails
   */
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  /**
   * Ferme le modal des détails
   */
  const closeOrderDetails = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
    setCopiedField(null);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 text-${color.split(' ')[0].replace('from-', '')}-500`} />
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Historique des commandes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Consultez et suivez toutes vos commandes passées
          </p>
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
          {/* Recherche */}
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

          {/* Filtres avancés */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Filtres par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Tous', 'pending', 'processing', 'completed'].map(status => {
                    const config = statusConfig[status];
                    return (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          filterStatus === status
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {status === 'Tous' ? 'Tous' : config?.labelFr || status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtres par catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryTabs.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${
                        filterCategory === cat
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                <Loader className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement de vos commandes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('serviceName')}
                      className="group flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Service
                      <SortIcon column="serviceName" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="group flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Date
                      <SortIcon column="createdAt" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('amount')}
                      className="group flex items-center justify-end gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Prix
                      <SortIcon column="amount" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const serviceName = order?.serviceDetails?.name || order?.service?.name || 'Service inconnu';
                    const status = order?.status || 'pending';
                    const config = statusConfig[status] || statusConfig['pending'];
                    const StatusIcon = config.icon;

                    return (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                        onClick={() => openOrderDetails(order)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {serviceName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                #{order._id?.slice(-8)}
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
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.badgeColor} border ${config.borderColor}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.labelFr}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(order?.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDetails(order);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
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
        )}
      </div>

      {/* 🔥 MODAL DES DÉTAILS DE COMMANDE */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* En-tête */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Détails de la commande
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Référence: {selectedOrder.transactionId || selectedOrder._id}
                </p>
              </div>
              <button
                onClick={closeOrderDetails}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* INFORMATIONS GÉNÉRALES */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Informations générales
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID Commande</p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white break-all">
                      {selectedOrder._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Transaction</p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {selectedOrder.transactionId || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Statut</p>
                    <div>
                      {(() => {
                        const config = statusConfig[selectedOrder.status] || statusConfig['pending'];
                        const StatusIcon = config.icon;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.badgeColor}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.labelFr}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Montant</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatPrice(selectedOrder.amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* SERVICE */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-500" />
                  Service commandé
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nom du service</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.serviceDetails?.name || selectedOrder.service?.name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Catégorie</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedOrder.serviceDetails?.category || selectedOrder.service?.category || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* DONNÉES FOURNIES PAR LE CLIENT */}
              {selectedOrder.userSubmittedData && Object.keys(selectedOrder.userSubmittedData).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Informations fournies
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedOrder.userSubmittedData).map(([key, value]) => {
                      // Chercher le label dans les métadonnées si disponibles
                      let label = key;
                      if (selectedOrder.userSubmittedDataMetadata) {
                        const meta = selectedOrder.userSubmittedDataMetadata.find(m => m.name === key);
                        if (meta) label = meta.label;
                      }
                      
                      return (
                        <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                                {label.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white break-words font-mono text-sm">
                                {value || '—'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopy(value, key)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              title="Copier"
                            >
                              <Copy className="w-4 h-4" />
                              {copiedField === key && (
                                <span className="absolute -mt-6 -ml-2 text-xs text-green-500">Copié!</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DONNÉES DE LIVRAISON (générées par l'admin) */}
              {selectedOrder.deliveryData && Object.keys(selectedOrder.deliveryData).length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Informations de livraison
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedOrder.deliveryData).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white break-words font-mono text-sm">
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(value, key)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Copier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTES ADMIN */}
              {selectedOrder.adminNotes && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Notes
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    {selectedOrder.adminNotes}
                  </p>
                </div>
              )}

              {/* BOUTONS D'ACTION */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    // Télécharger les détails au format JSON
                    const dataStr = JSON.stringify(selectedOrder, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `order-${selectedOrder._id}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exporter
                </button>
                <button
                  onClick={closeOrderDetails}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
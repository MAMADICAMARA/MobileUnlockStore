// src/pages/client/OrdersPage.jsx
import { useState, useEffect, useMemo } from 'react';
import orderService from '../../services/orderService';
import Footer from '../../components/Footer';
import {
  ShoppingBagIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  TruckIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

// Fonction pour formater la date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Badge de statut amélioré
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Terminé': {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: CheckCircleIcon,
      gradient: 'from-emerald-500 to-green-500'
    },
    'En cours': {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: ArrowPathIcon,
      gradient: 'from-amber-500 to-orange-500'
    },
    'En attente': {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: ClockIcon,
      gradient: 'from-blue-500 to-indigo-500'
    },
    'Annulé': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: XCircleIcon,
      gradient: 'from-red-500 to-rose-500'
    },
    'Expédié': {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      icon: TruckIcon,
      gradient: 'from-purple-500 to-pink-500'
    },
  };

  const config = statusConfig[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: BellAlertIcon,
    gradient: 'from-gray-500 to-gray-600'
  };
  
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text} text-xs font-medium`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </div>
  );
};

/**
 * Page affichant l'historique des commandes du client.
 */
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'cards'
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await orderService.getOrders();
        setOrders(response.data);
      } catch (err) {
        setError('Impossible de charger l\'historique des commandes.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filtrage et tri des commandes
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];
    
    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tri par date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filtered;
  }, [orders, sortOrder, filterStatus, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      completed: orders.filter(o => o.status === 'Terminé').length,
      pending: orders.filter(o => o.status === 'En attente').length,
      totalSpent: orders.reduce((acc, order) => acc + (order.price || 0), 0)
    };
  }, [orders]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Terminé': return 'bg-emerald-600';
      case 'En cours': return 'bg-amber-600';
      case 'En attente': return 'bg-blue-600';
      case 'Annulé': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
          <ShoppingBagIcon className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-bounce" />
        </div>
        <p className="text-gray-700 font-semibold text-xl mb-2">Chargement de vos commandes</p>
        <p className="text-gray-500">Préparation de votre historique...</p>
        <div className="mt-8 flex justify-center gap-2">
          <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl border-l-4 border-red-500 p-8 rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-red-100 rounded-full p-3">
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Erreur de chargement</h2>
            <p className="text-gray-500 text-sm">Impossible de récupérer vos commandes</p>
          </div>
        </div>
        <p className="text-gray-600 mb-8 bg-red-50 p-4 rounded-xl">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* Header avec statistiques */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-800 mb-3 tracking-tight flex items-center gap-3">
                <ShoppingBagIcon className="h-10 w-10 text-blue-600" />
                Mes Commandes
              </h1>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {filteredAndSortedOrders.length} commande{filteredAndSortedOrders.length > 1 ? 's' : ''} trouvée{filteredAndSortedOrders.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.total}</span>
              </div>
              <p className="text-gray-600 text-sm">Total commandes</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.completed}</span>
              </div>
              <p className="text-gray-600 text-sm">Terminées</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.pending}</span>
              </div>
              <p className="text-gray-600 text-sm">En attente</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CurrencyEuroIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.totalSpent.toFixed(2)} €</span>
              </div>
              <p className="text-gray-600 text-sm">Total dépensé</p>
            </div>
          </div>
        </div>

        {/* Barre de filtres */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
              />
            </div>
            
            <div className="sm:w-48 relative">
              <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all duration-300"
              >
                <option value="all">Tous les statuts</option>
                <option value="Terminé">Terminé</option>
                <option value="En cours">En cours</option>
                <option value="En attente">En attente</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 text-gray-700 font-medium"
            >
              {sortOrder === 'asc' ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
              {sortOrder === 'asc' ? "Plus anciennes" : "Plus récentes"}
            </button>
          </div>
        </div>

        {/* Affichage des commandes */}
        {filteredAndSortedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-500 mb-8">
              {searchTerm || filterStatus !== 'all' 
                ? 'Essayez de modifier vos filtres' 
                : 'Vous n\'avez pas encore passé de commande'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg">
                Découvrir nos services
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* Vue Tableau */
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedOrders.map((order, index) => (
                    <tr 
                      key={order._id} 
                      className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 ${getStatusColor(order.status)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                            <DocumentTextIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                              {order.serviceName}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{order._id?.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(order.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {typeof order.price === 'number' ? `${order.price.toFixed(2)} €` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Vue Cartes */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedOrders.map((order) => (
              <div
                key={order._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className={`h-3 bg-gradient-to-r ${getStatusColor(order.status)}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{order.serviceName}</h3>
                      <p className="text-xs text-gray-500">#{order._id?.slice(-8)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm">{formatDate(order.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CurrencyEuroIcon className="h-4 w-4" />
                      <span className="text-sm font-semibold">{order.price?.toFixed(2)} €</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm">
                      Détails
                    </button>
                    <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300">
                      <EyeIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (optionnelle) */}
        {filteredAndSortedOrders.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-2 inline-flex gap-1">
              <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all duration-300">Précédent</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all duration-300">2</button>
              <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all duration-300">3</button>
              <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all duration-300">Suivant</button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default OrdersPage;
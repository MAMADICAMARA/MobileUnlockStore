// src/pages/client/PaymentsHistoryPage.jsx
import { useEffect, useState } from 'react';
import { 
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Printer,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import paymentService from '../../services/paymentService';

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
  }).format(amount);
};

const StatusBadge = ({ status }) => {
  const config = {
    'Réussi': {
      bg: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
      label: 'Réussi'
    },
    'Échoué': {
      bg: 'bg-gradient-to-r from-red-500/10 to-pink-500/10',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      label: 'Échoué'
    },
    'En attente': {
      bg: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: Clock,
      label: 'En attente'
    },
    'Remboursé': {
      bg: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      icon: TrendingDown,
      label: 'Remboursé'
    }
  };

  const { bg, text, border, icon: Icon, label } = config[status] || config['En attente'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text} border ${border}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
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
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const PaymentsHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'Tous',
    dateRange: 'all',
    type: 'Tous'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentService.getPayments();
      setPayments(response.data);
      
      // Calculer les stats
      const total = response.data.length;
      const successful = response.data.filter(p => p.status === 'Réussi').length;
      const pending = response.data.filter(p => p.status === 'En attente').length;
      const totalAmount = response.data
        .filter(p => p.status === 'Réussi')
        .reduce((sum, p) => sum + p.amount, 0);
      
      setStats({ total, successful, pending, totalAmount });
    } catch (err) {
      console.error('Erreur lors du chargement des paiements:', err);
      setError('Impossible de charger l\'historique des paiements.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des paiements
  const filteredPayments = payments.filter(payment => {
    // Filtre recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        payment.type?.toLowerCase().includes(searchLower) ||
        payment.reference?.toLowerCase().includes(searchLower) ||
        payment.amount.toString().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtre statut
    if (filters.status !== 'Tous' && payment.status !== filters.status) {
      return false;
    }

    // Filtre type
    if (filters.type !== 'Tous' && payment.type !== filters.type) {
      return false;
    }

    // Filtre date
    if (filters.dateRange !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          if (paymentDate < today) return false;
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (paymentDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (paymentDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  // Types de paiement uniques pour le filtre
  const paymentTypes = ['Tous', ...new Set(payments.map(p => p.type))];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Historique des Paiements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Consultez et gérez l'ensemble de vos transactions
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total transactions"
          value={stats.total}
          icon={CreditCard}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Transactions réussies"
          value={stats.successful}
          icon={CheckCircle}
          trend="up"
          trendValue="+12%"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          icon={Clock}
          color="from-yellow-500 to-amber-500"
        />
        <StatCard
          title="Montant total"
          value={formatCurrency(stats.totalAmount)}
          icon={Wallet}
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col gap-4">
          {/* Barre de recherche principale */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par type, référence ou montant..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Filtre statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Réussi">Réussi</option>
                  <option value="En attente">En attente</option>
                  <option value="Échoué">Échoué</option>
                  <option value="Remboursé">Remboursé</option>
                </select>
              </div>

              {/* Filtre type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de paiement
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  {paymentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Filtre date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Période
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                </select>
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {filteredPayments.length} transaction(s)
              </span>
            </div>
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPayments}
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment, index) => (
                      <tr 
                        key={payment._id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(payment.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className={`text-lg font-bold ${
                              payment.amount > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {payment.amount > 0 ? '+' : ''}{payment.amount.toFixed(2)} €
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${
                              payment.type?.toLowerCase().includes('carte') 
                                ? 'bg-blue-100 dark:bg-blue-900/30' 
                                : 'bg-purple-100 dark:bg-purple-900/30'
                            }`}>
                              <CreditCard className={`w-4 h-4 ${
                                payment.type?.toLowerCase().includes('carte')
                                  ? 'text-blue-500'
                                  : 'text-purple-500'
                              }`} />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {payment.type || 'Paiement'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                            {payment.reference || `#${payment._id.slice(-8)}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Télécharger le reçu"
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                            <CreditCard className="w-12 h-12 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune transaction trouvée</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            {filters.search 
                              ? 'Essayez de modifier vos filtres de recherche'
                              : 'Vos paiements apparaîtront ici'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredPayments.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Affichage de <span className="font-medium">1</span> à{' '}
                    <span className="font-medium">{Math.min(10, filteredPayments.length)}</span> sur{' '}
                    <span className="font-medium">{filteredPayments.length}</span> transactions
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

      {/* Modal de détails de paiement */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Détails du paiement
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Montant */}
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Montant</p>
                <p className={`text-4xl font-bold ${
                  selectedPayment.amount > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {selectedPayment.amount > 0 ? '+' : ''}{selectedPayment.amount.toFixed(2)} €
                </p>
              </div>

              {/* Détails */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedPayment.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedPayment.type || 'Paiement'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Référence</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {selectedPayment.reference || `#${selectedPayment._id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Statut</span>
                  <StatusBadge status={selectedPayment.status} />
                </div>
                {selectedPayment.method && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Méthode</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedPayment.method}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    // Imprimer le reçu
                    window.print();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Imprimer
                </button>
                <button
                  onClick={() => {
                    // Télécharger le reçu
                    alert('Téléchargement du reçu...');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsHistoryPage;
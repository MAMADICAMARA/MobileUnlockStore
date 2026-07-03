
// src/pages/client/OrdersPage.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import orderService from '../../services/orderService';
import {
  ShoppingBagIcon,
  CalendarIcon,
  ClockIcon,
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
  BellAlertIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ─── Utilitaires ─────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '—';
  return `${new Intl.NumberFormat('fr-FR').format(amount)} FG`;
};

const getServiceName = (order) =>
  order?.serviceDetails?.name ||
  order?.service?.name ||
  order?.serviceName ||
  'Service inconnu';

const getAmount = (order) =>
  order?.amount ?? order?.price ?? order?.serviceDetails?.price ?? 0;

// ─── Badge statut ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  'En cours': { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: ArrowPathIcon   },
  'Terminé':  { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircleIcon },
  'Annulé':   { bg: 'bg-red-100',     text: 'text-red-700',     icon: XCircleIcon     },
};

const STATUS_DOT = {
  'En cours': 'bg-amber-500',
  'Terminé':  'bg-emerald-500',
  'Annulé':   'bg-red-500',
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: BellAlertIcon };
  const Icon = config.icon;
  const label = status || '—';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text} text-xs font-semibold whitespace-nowrap`}>
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      {label}
    </span>
  );
};

// ─── Modal détail commande ────────────────────────────────────────────────────

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Détail de la commande</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{getServiceName(order)}</p>
              <p className="text-xs text-gray-500 font-mono">#{order._id?.slice(-8)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-gray-900 text-sm">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Montant</p>
              <p className="font-bold text-green-600">{formatPrice(getAmount(order))}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Catégorie</p>
              <p className="font-medium text-gray-900 text-sm capitalize">
                {order.serviceDetails?.category || order.service?.category || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ID complet</p>
              <p className="font-mono text-xs text-gray-700 break-all">{order._id}</p>
            </div>
          </div>
          {order.userSubmittedData && Object.keys(order.userSubmittedData).length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Informations fournies</p>
              <div className="space-y-2">
                {Object.entries(order.userSubmittedData).map(([k, v]) => (
                  <div key={k} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500 capitalize">{k}</span>
                    <span className="text-xs font-mono text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {order.adminNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
              <p className="text-sm text-amber-800">{order.adminNotes}</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

const OrdersPage = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [sortOrder, setSortOrder]     = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Sur mobile, vue cartes par défaut ; sur desktop, tableau
  const [viewMode, setViewMode]       = useState(
    window.innerWidth < 768 ? 'cards' : 'table'
  );

  // ── Chargement des commandes ────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await orderService.getOrders();
      let data = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.orders && Array.isArray(response.data.orders)) {
        data = response.data.orders;
      }
      setOrders(data);
    } catch (err) {
      console.error('❌ Erreur commandes:', err);
      if (!silent) setError("Impossible de charger l'historique des commandes.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ✅ Polling toutes les 30 secondes pour mise à jour instantanée des statuts
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Filtrage & tri ──────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    let list = [...orders];

    if (filterStatus !== 'all') {
      list = list.filter(o => o.status === filterStatus);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(o =>
        getServiceName(o).toLowerCase().includes(q) ||
        (o._id || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const dA = new Date(a.createdAt || a.date || 0);
      const dB = new Date(b.createdAt || b.date || 0);
      return sortOrder === 'asc' ? dA - dB : dB - dA;
    });

    return list;
  }, [orders, filterStatus, searchTerm, sortOrder]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const arr = Array.isArray(orders) ? orders : [];
    return {
      total:      arr.length,
      completed:  arr.filter(o => o.status === 'Terminé').length,
      pending:    arr.filter(o => o.status === 'En cours').length,
      totalSpent: arr.filter(o => o.status === 'Terminé').reduce((s, o) => s + getAmount(o), 0),
    };
  }, [orders]);

  // ── Rendu états ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="text-center">
        <ShoppingBagIcon className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-bounce" />
        <p className="text-gray-700 font-semibold text-xl mb-2">Chargement de vos commandes</p>
        <div className="mt-4 flex justify-center gap-2">
          {[0, 0.2, 0.4].map((d, i) => (
            <div key={i} className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full py-20 flex items-center justify-center p-4">
      <div className="bg-white border-l-4 border-red-500 p-8 rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center gap-4 mb-4">
          <XCircleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
          <h2 className="text-xl font-bold text-gray-800">Erreur de chargement</h2>
        </div>
        <p className="text-gray-600 mb-6 bg-red-50 p-4 rounded-xl">{error}</p>
        <button onClick={() => fetchOrders()}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
          <ArrowPathIcon className="h-5 w-5" /> Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <main className="w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ── En-tête ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-800 flex items-center gap-2">
              <ShoppingBagIcon className="h-7 w-7 sm:h-10 sm:w-10 text-blue-600 flex-shrink-0" />
              Mes Commandes
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} trouvée{filteredOrders.length > 1 ? 's' : ''}
              {' '}
              {/* Indicateur polling */}
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Mise à jour auto
              </span>
            </p>
          </div>

          {/* Toggle vue */}
          <div className="flex gap-2 self-end sm:self-auto">
            <button onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button onClick={() => setViewMode('cards')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            {/* Bouton refresh manuel */}
            <button onClick={() => fetchOrders()}
              className="p-2.5 rounded-xl bg-white text-gray-600 hover:bg-gray-50 transition-all"
              title="Actualiser">
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Statistiques ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total',      value: stats.total,                           icon: ShoppingBagIcon,  color: 'bg-blue-100 text-blue-600' },
            { label: 'Terminées',  value: stats.completed,                       icon: CheckCircleIcon,  color: 'bg-emerald-100 text-emerald-600' },
            { label: 'En cours',  value: stats.pending,                         icon: ClockIcon,        color: 'bg-amber-100 text-amber-600' },
            { label: 'Dépensé',    value: formatPrice(stats.totalSpent),         icon: DocumentTextIcon, color: 'bg-purple-100 text-purple-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-xl sm:text-3xl font-bold text-gray-800">{value}</span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filtres ── */}
        <div className="mb-6 bg-white rounded-2xl shadow p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Recherche */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            {/* Filtre statut */}
            <div className="sm:w-44 relative">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
            {/* Tri */}
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-gray-700 text-sm font-medium whitespace-nowrap"
            >
              {sortOrder === 'asc'
                ? <><ArrowUpIcon className="h-4 w-4" /> Plus anciennes</>
                : <><ArrowDownIcon className="h-4 w-4" /> Plus récentes</>
              }
            </button>
          </div>
        </div>

        {/* ── Contenu ── */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-12 text-center">
            <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || filterStatus !== 'all'
                ? 'Essayez de modifier vos filtres'
                : "Vous n'avez pas encore passé de commande"}
            </p>
          </div>

        ) : viewMode === 'table' ? (
          /* ── Vue Tableau (desktop) ── */
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Service', 'Date', 'Statut', 'Montant', 'Actions'].map(h => (
                      <th key={h} className={`px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Montant' ? 'text-right' : h === 'Actions' ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, i) => (
                    <tr key={order._id || i}
                      className="hover:bg-blue-50/40 transition cursor-pointer"
                      onClick={() => setSelectedOrder(order)}>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${STATUS_DOT[order.status] || 'bg-gray-400'}`}>
                            <DocumentTextIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-[140px] sm:max-w-none">
                              {getServiceName(order)}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">#{order._id?.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                          {formatPrice(getAmount(order))}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
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
          /* ── Vue Cartes (mobile) ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order, i) => (
              <div key={order._id || i}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => setSelectedOrder(order)}>
                {/* Barre statut */}
                <div className={`h-1.5 w-full ${STATUS_DOT[order.status] || 'bg-gray-300'}`} />
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{getServiceName(order)}</p>
                      <p className="text-xs text-gray-400 font-mono">#{order._id?.slice(-8)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      {formatDate(order.createdAt)}
                    </div>
                    <span className="font-bold text-gray-900 whitespace-nowrap">
                      {formatPrice(getAmount(order))}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    Voir les détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal détail ── */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default OrdersPage;


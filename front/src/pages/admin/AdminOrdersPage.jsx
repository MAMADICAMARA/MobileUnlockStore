// src/pages/admin/AdminOrdersPage.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle,
  AlertCircle, Eye, RefreshCw, CreditCard, ArrowUpDown,
  FileText, ClipboardList, X, ArrowLeftRight, Package, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

// ─── Constantes ───────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
  { value: 'En cours',   label: 'En cours',   dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',          icon: Clock },
  { value: 'Terminé',    label: 'Terminé',    dot: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',   icon: CheckCircle },
  { value: 'Annulé',     label: 'Annulé',     dot: 'bg-red-400',     pill: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',                  icon: XCircle },
  { value: 'Remboursé',  label: 'Remboursé',  dot: 'bg-purple-400',  pill: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',      icon: ArrowLeftRight },
];

const CATEGORIES = ['Tous', 'IMEI', 'Server', 'Rental', 'License'];

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(d))
  : '—';

const fmtCurrency = (n) =>
  `${new Intl.NumberFormat('fr-FR').format(n || 0)} FG`;

const humanize = (key) =>
  key.replace(/([A-Z])/g,' $1').replace(/_/g,' ').trim().replace(/^\w/, c => c.toUpperCase());

const extractSubmitted = (order) => {
  const src = order.userSubmittedData || order.fields || {};
  if (src instanceof Map) return [...src.entries()].filter(([,v]) => v !== '' && v != null);
  return Object.entries(src).filter(([,v]) => v !== '' && v != null);
};

const statusConf = (s) => ORDER_STATUSES.find(x => x.value === s) || ORDER_STATUSES[0];

// ─── StatusPill ───────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const c = statusConf(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
      {c.label}
    </span>
  );
};

// ─── KpiCard ──────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, icon: Icon, accent }) => {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
    green:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className={`w-9 h-9 ${colors[accent] || colors.blue} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
    </div>
  );
};

// ─── Modal détails ────────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onStatusChange }) => {
  const navigate  = useNavigate();
  const submitted = extractSubmitted(order);
  const client    = order.userId   || {};
  const service   = order.serviceId || {};
  const isTermine   = order.status === 'Terminé';
  const isRembourse = order.status === 'Remboursé';

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-800 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          {/* Drag indicator mobile */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full sm:hidden" />
          <div className="min-w-0 mt-2 sm:mt-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {service.name || order.serviceDetails?.name || 'Commande'}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">#{order._id?.slice(-10)}</p>
          </div>
          <button onClick={onClose}
            className="ml-3 mt-1 sm:mt-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* ── Body scrollable ── */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-5 py-4 space-y-4">

          {/* Statut + montant */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Statut</p>
              {isRembourse ? (
                <StatusPill status={order.status} />
              ) : (
                <select value={order.status}
                  onChange={e => onStatusChange(order._id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className={`text-xs font-semibold border-0 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer ${statusConf(order.status).pill}`}
                  style={{ backgroundColor: 'transparent' }}>
                  {ORDER_STATUSES.filter(s => s.value !== 'Remboursé').map(s => (
                    <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Montant</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {fmtCurrency(order.amount || order.serviceDetails?.price || 0)}
              </p>
            </div>
          </div>

          {/* Client */}
          <div className="bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
              <User className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Client</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <Field label="Nom"   value={client.name} />
              <Field label="Email" value={client.email} />
              <Field label="Solde" value={fmtCurrency(client.balance)} />
              <Field label="Rôle"  value={client.role} />
            </div>
          </div>

          {/* Service */}
          <div className="bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
              <Package className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Service</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <Field label="Nom"       value={order.serviceDetails?.name || service.name} span />
              <Field label="Catégorie" value={order.serviceDetails?.category || service.category} />
              <Field label="Date"      value={fmtDate(order.createdAt)} />
            </div>
          </div>

          {/* Données soumises */}
          {submitted.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-purple-100 dark:border-purple-900/30">
                <ClipboardList className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Données client ({submitted.length})
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {submitted.map(([key, value]) => (
                  <div key={key} className="bg-white dark:bg-slate-700 rounded-xl p-3 border border-purple-100 dark:border-purple-900/30">
                    <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-1">{humanize(key)}</p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes admin */}
          {order.adminNotes && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Note admin</p>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{order.adminNotes}</p>
            </div>
          )}

          {/* ✅ Bouton remboursement N2 */}
          {isTermine && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Litige technique</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Le service n'a pas été rendu malgré le statut Terminé ?
                  </p>
                </div>
              </div>
              <button onClick={() => { onClose(); navigate('/admin/refund', { state: { order } }); }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Transférer vers Remboursement
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 sm:gap-3 flex-shrink-0">
          {!isRembourse && (
            <button
              onClick={() => {
                const next = order.status === 'Terminé' ? 'En cours' : 'Terminé';
                onStatusChange(order._id, next);
              }}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
              {order.status === 'Terminé' ? 'Réouvrir' : '→ Terminer'}
            </button>
          )}
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Composant Field ──────────────────────────────────────────────────────────
const Field = ({ label, value, span }) => (
  <div className={span ? 'col-span-2' : ''}>
    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-900 dark:text-white break-all">{value || '—'}</p>
  </div>
);

// ─── Page principale ──────────────────────────────────────────────────────────
const AdminOrdersPage = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState('');
  const [filters, setFilters]             = useState({ status:'Tous', search:'', category:'Tous' });
  const [sortConfig, setSortConfig]       = useState({ key:'date', direction:'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats]                 = useState({ total:0, completed:0, pending:0, revenue:0 });
  const [page, setPage]                   = useState(1);
  const [pagination, setPagination]       = useState({ total:0, pages:1 });
  const LIMIT = 20;

  const computeStats = (arr) => ({
    total:     arr.length,
    completed: arr.filter(o => o.status === 'Terminé').length,
    pending:   arr.filter(o => o.status === 'En cours').length,
    revenue:   arr.filter(o => o.status === 'Terminé').reduce((s,o) => s + (o.amount || o.serviceDetails?.price || 0), 0),
  });

  const fetchOrders = async (isRefresh = false, currentPage = page) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const res = await adminService.getAllOrders({ page: currentPage, limit: LIMIT });
      const arr = Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data) ? res.data : [];
      setOrders(arr);
      setStats(computeStats(arr));
      if (res.data?.pagination) setPagination(res.data.pagination);
    } catch {
      setError('Impossible de charger les commandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(false, page); }, [page]);

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, status);
      setOrders(prev => {
        const updated = prev.map(o => o._id === id ? { ...o, status } : o);
        setStats(computeStats(updated));
        return updated;
      });
      if (selectedOrder?._id === id) setSelectedOrder(p => ({ ...p, status }));
    } catch (e) { console.error(e); }
  };

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (filters.category !== 'Tous')
      list = list.filter(o => (o.serviceId?.category || o.serviceDetails?.category || '').toLowerCase() === filters.category.toLowerCase());
    if (filters.status !== 'Tous')
      list = list.filter(o => o.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(o =>
        o.userId?.name?.toLowerCase().includes(q) ||
        o.userId?.email?.toLowerCase().includes(q) ||
        (o.serviceId?.name || o.serviceDetails?.name || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'date')  return dir * (new Date(a.createdAt) - new Date(b.createdAt));
      if (sortConfig.key === 'price') return dir * ((a.amount || 0) - (b.amount || 0));
      if (sortConfig.key === 'client') return dir * (a.userId?.name || '').localeCompare(b.userId?.name || '');
      return 0;
    });
    return list;
  }, [orders, filters, sortConfig]);

  const SortBtn = ({ col, label }) => (
    <button onClick={() => setSortConfig(p => ({ key: col, direction: p.key === col && p.direction === 'asc' ? 'desc' : 'asc' }))}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
      {label}
      {sortConfig.key === col
        ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
        : <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </button>
  );

  return (
    <div className="w-full py-4 sm:py-6 px-3 sm:px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">

        {/* En-tête */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">Commandes</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => fetchOrders(true)} disabled={refreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard title="Total"            value={stats.total}              icon={Package}     accent="blue" />
          <KpiCard title="Terminées"        value={stats.completed}          icon={CheckCircle} accent="green" />
          <KpiCard title="En cours"         value={stats.pending}            icon={Clock}       accent="amber" />
          <KpiCard title="Chiffre d'aff."   value={fmtCurrency(stats.revenue)} icon={CreditCard} accent="purple" />
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-3 sm:p-4">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher client, email, service…"
                value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key:'category', opts: CATEGORIES.map(c => ({ v:c, l:c === 'Tous' ? 'Toutes catégories' : c })) },
                { key:'status',   opts: [{ v:'Tous', l:'Tous statuts' }, ...ORDER_STATUSES.map(s => ({ v:s.value, l:s.label }))] },
              ].map(({ key, opts }) => (
                <select key={key} value={filters[key]} onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
                  className="flex-1 min-w-[130px] px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Chargement…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-slate-600 dark:text-slate-300 text-sm">{error}</p>
              <button onClick={() => fetchOrders()} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Réessayer
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
              <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Aucune commande trouvée</p>
            </div>
          ) : (
            <>
              {/* ── TABLE desktop (md+) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                      <th className="px-4 py-3 text-left"><SortBtn col="client" label="Client" /></th>
                      <th className="px-4 py-3 text-left"><SortBtn col="service" label="Service" /></th>
                      <th className="px-4 py-3 text-left"><SortBtn col="date" label="Date" /></th>
                      <th className="px-4 py-3 text-right"><SortBtn col="price" label="Prix" /></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statut</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {filteredOrders.map(order => (
                      <tr key={order._id} onClick={() => setSelectedOrder(order)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                              {(order.userId?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{order.userId?.name || '—'}</p>
                              <p className="text-xs text-slate-400 truncate">{order.userId?.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                            {order.serviceId?.name || order.serviceDetails?.name || '—'}
                          </p>
                          <p className="text-xs text-slate-400">{order.serviceId?.category || order.serviceDetails?.category || '—'}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {fmtCurrency(order.amount || order.serviceDetails?.price || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          {order.status === 'Remboursé' ? (
                            <StatusPill status={order.status} />
                          ) : (
                            <select value={order.status}
                              onChange={e => handleStatusChange(order._id, e.target.value)}
                              className={`text-xs font-semibold border-0 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer ${statusConf(order.status).pill}`}
                              style={{ backgroundColor: 'transparent' }}>
                              {ORDER_STATUSES.filter(s => s.value !== 'Remboursé').map(s => (
                                <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s.label}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── LISTE mobile (< md) ── */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                {filteredOrders.map(order => (
                  <button key={order._id} onClick={() => setSelectedOrder(order)}
                    className="w-full text-left px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 active:bg-slate-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {(order.userId?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {order.userId?.name || '—'}
                          </p>
                          <StatusPill status={order.status} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                          {order.serviceId?.name || order.serviceDetails?.name || '—'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {fmtCurrency(order.amount || order.serviceDetails?.price || 0)}
                          </span>
                          <span className="text-xs text-slate-400">{fmtDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400">
                  {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {pagination.page} sur {pagination.pages} — {pagination.total} commande{pagination.total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Précédent
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}>
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;

// // src/pages/admin/AdminOrdersPage.jsx
// import { useState, useEffect, useMemo } from 'react';
// import {
//   Search, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle,
//   AlertCircle, Eye, RefreshCw, Calendar, User, Package, CreditCard,
//   ArrowUpDown, FileText, ClipboardList, X, ArrowLeftRight
// } from 'lucide-react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import adminService from '../../services/adminService';

// // ─── Constantes ───────────────────────────────────────────────────────────────

// const ORDER_STATUSES = [
//   { value: 'En cours', label: 'En cours', dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',       icon: Clock },
//   { value: 'Terminé',  label: 'Terminé',  dot: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle },
//   { value: 'Annulé',   label: 'Annulé',   dot: 'bg-red-400',     pill: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',                 icon: XCircle },
// ];

// const CATEGORIES = ['Tous', 'IMEI', 'Server', 'Rental', 'License'];

// // ─── Utils ────────────────────────────────────────────────────────────────────

// const fmtDate = (d) => d
//   ? new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(d))
//   : '—';

// const fmtCurrency = (n) =>
//   `${new Intl.NumberFormat('fr-FR').format(n || 0)} FG`;

// const humanize = (key) =>
//   key.replace(/([A-Z])/g,' $1').replace(/_/g,' ').trim().replace(/^\w/, c => c.toUpperCase());

// const extractSubmitted = (order) => {
//   const src = order.userSubmittedData || order.fields || {};
//   if (src instanceof Map) return [...src.entries()].filter(([,v]) => v !== '' && v != null);
//   return Object.entries(src).filter(([,v]) => v !== '' && v != null);
// };

// const statusConf = (s) => ORDER_STATUSES.find(x => x.value === s) || ORDER_STATUSES[0];

// // ─── Sous-composants ──────────────────────────────────────────────────────────

// const KpiCard = ({ title, value, icon: Icon, accent }) => {
//   const colors = {
//     blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-500 ring-blue-100 dark:ring-blue-900',
//     green:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 ring-emerald-100 dark:ring-emerald-900',
//     amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-500 ring-amber-100 dark:ring-amber-900',
//     purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 ring-purple-100 dark:ring-purple-900',
//   };
//   const cls = (colors[accent] || colors.blue).split(' ');
//   return (
//     <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
//       <div className={`w-10 h-10 ${cls[0]} ${cls[1]} ${cls[2]} ${cls[3]} ring-1 rounded-xl flex items-center justify-center mb-3`}>
//         <Icon className="w-5 h-5" />
//       </div>
//       <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">{value}</p>
//       <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</p>
//     </div>
//   );
// };

// const StatusPill = ({ status }) => {
//   const c = statusConf(status);
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.pill}`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
//       {c.label}
//     </span>
//   );
// };

// const Section = ({ title, icon, children, accent }) => {
//   const accents = {
//     purple: 'bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30',
//     amber:  'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30',
//   };
//   return (
//     <div className={`rounded-xl overflow-hidden ${accents[accent] || 'bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700'}`}>
//       <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
//         {icon}
//         <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
//       </div>
//       <div className="p-4">{children}</div>
//     </div>
//   );
// };

// const Field = ({ label, value, span }) => (
//   <div className={span ? 'col-span-2' : ''}>
//     <p className="text-xs text-slate-400 mb-0.5">{label}</p>
//     <p className="text-sm font-medium text-slate-900 dark:text-white break-all">{value || '—'}</p>
//   </div>
// );

// // ─── Modal détails ────────────────────────────────────────────────────────────

// const OrderModal = ({ order, onClose, onStatusChange }) => {
//   const navigate  = useNavigate();
//   const submitted = extractSubmitted(order);
//   const client    = order.userId  || {};
//   const service   = order.serviceId || {};

//   const isTermine = order.status === 'Terminé';

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
//       <div className="flex min-h-full items-center justify-center p-4">
//       <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

//         {/* Header */}
//         <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
//           <div className="min-w-0">
//             <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
//               {service.name || order.serviceDetails?.name || 'Commande'}
//             </h2>
//             <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">#{order._id?.slice(-12)}</p>
//           </div>
//           <button onClick={onClose} className="ml-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0">
//             <X className="w-5 h-5 text-slate-400" />
//           </button>
//         </div>

//         {/* Body scrollable */}
//         <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

//           {/* Statut + montant */}
//           <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
//             <div>
//               <p className="text-xs text-slate-400 mb-1.5">Statut actuel</p>
//               <select
//                 value={order.status}
//                 onChange={e => onStatusChange(order._id, e.target.value)}
//                 onClick={e => e.stopPropagation()}
//                 className={`text-sm font-semibold border-0 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer ${statusConf(order.status).pill}`}
//                 style={{ backgroundColor: 'transparent' }}
//               >
//                 {ORDER_STATUSES.map(s => (
//                   <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
//                     {s.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="text-right">
//               <p className="text-xs text-slate-400 mb-1">Montant</p>
//               <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
//                 {fmtCurrency(order.amount || order.serviceDetails?.price || 0)}
//               </p>
//             </div>
//           </div>

//           {/* Client */}
//           <Section title="Client" icon={<User className="w-4 h-4 text-indigo-500" />}>
//             {client._id ? (
//               <div className="grid grid-cols-2 gap-3">
//                 <Field label="Nom"             value={client.name} />
//                 <Field label="Email"           value={client.email} />
//                 <Field label="Rôle"            value={client.role} />
//                 <Field label="Solde"           value={fmtCurrency(client.balance)} />
//                 <Field label="Membre depuis"   value={fmtDate(client.createdAt)} />
//               </div>
//             ) : (
//               <p className="text-sm text-slate-400 italic">Informations client non disponibles</p>
//             )}
//           </Section>

//           {/* Service */}
//           <Section title="Service commandé" icon={<Package className="w-4 h-4 text-emerald-500" />}>
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Nom"       value={service.name || order.serviceDetails?.name} span />
//               <Field label="Catégorie" value={service.category || order.serviceDetails?.category} />
//               <Field label="Date"      value={fmtDate(order.createdAt)} />
//             </div>
//           </Section>

//           {/* Données soumises */}
//           {submitted.length > 0 ? (
//             <Section
//               title={`Données client (${submitted.length})`}
//               icon={<ClipboardList className="w-4 h-4 text-purple-500" />}
//               accent="purple"
//             >
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {submitted.map(([key, value]) => (
//                   <div key={key} className="bg-white dark:bg-slate-700 rounded-xl p-3 border border-purple-100 dark:border-purple-900/30">
//                     <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">
//                       {humanize(key)}
//                     </p>
//                     <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
//                       {typeof value === 'object' ? JSON.stringify(value) : String(value)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </Section>
//           ) : (
//             <div className="flex flex-col items-center py-6 text-center bg-slate-50 dark:bg-slate-700/30 rounded-xl">
//               <ClipboardList className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
//               <p className="text-sm text-slate-400">Aucune donnée soumise par le client</p>
//             </div>
//           )}

//           {/* Notes admin */}
//           {order.adminNotes && (
//             <Section title="Notes admin" icon={<FileText className="w-4 h-4 text-amber-500" />} accent="amber">
//               <p className="text-sm text-slate-700 dark:text-slate-300">{order.adminNotes}</p>
//             </Section>
//           )}

//           {/* ✅ Bouton remboursement N2 — visible uniquement si statut = Terminé */}
//           {isTermine && (
//             <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
//               <div className="flex items-start gap-3 mb-3">
//                 <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Litige technique</p>
//                   <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
//                     La commande est marquée terminée mais le service n'a pas été rendu ?
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   onClose();
//                   navigate('/admin/refund', { state: { order } });
//                 }}
//                 className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
//               >
//                 <ArrowLeftRight className="w-4 h-4" />
//                 Transférer vers Remboursement
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-3 flex-shrink-0">
//           <button
//             onClick={() => onStatusChange(order._id, order.status === 'En cours' ? 'Terminé' : 'En cours')}
//             className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
//           >
//             {order.status === 'Terminé' ? 'Réouvrir' : '→ Terminer'}
//           </button>
//           <button onClick={onClose}
//             className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">
//             Fermer
//           </button>
//         </div>
//       </div>
//       </div>
//     </div>
//   );
// };

// // ─── Page principale ──────────────────────────────────────────────────────────

// const AdminOrdersPage = () => {
//   const [orders, setOrders]               = useState([]);
//   const [loading, setLoading]             = useState(true);
//   const [refreshing, setRefreshing]       = useState(false);
//   const [error, setError]                 = useState('');
//   const [filters, setFilters]             = useState({ status:'Tous', search:'', dateRange:'all', category:'Tous' });
//   const [sortConfig, setSortConfig]       = useState({ key:'date', direction:'desc' });
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [stats, setStats]                 = useState({ total:0, completed:0, pending:0, revenue:0 });
//   const location = useLocation();

//   useEffect(() => {
//     const qcat = new URLSearchParams(location.search).get('category');
//     if (qcat) setFilters(f => ({ ...f, category: qcat }));
//     fetchOrders();
//   }, [location.search]);

//   const fetchOrders = async (isRefresh = false) => {
//     isRefresh ? setRefreshing(true) : setLoading(true);
//     setError('');
//     try {
//       const res = await adminService.getAllOrders();
//       const arr = Array.isArray(res.data?.data) ? res.data.data
//         : Array.isArray(res.data) ? res.data : [];
//       setOrders(arr);
//       const completed = arr.filter(o => o.status === 'Terminé').length;
//       const pending   = arr.filter(o => o.status === 'En cours').length;
//       const revenue   = arr.filter(o => o.status === 'Terminé').reduce((s,o) => s + (o.serviceDetails?.price || o.amount || 0), 0);
//       setStats({ total: arr.length, completed, pending, revenue });
//     } catch {
//       setError('Impossible de charger les commandes.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleStatusChange = async (id, status) => {
//     try {
//       await adminService.updateOrderStatus(id, status);
//       setOrders(prev => {
//         const updated = prev.map(o => o._id === id ? { ...o, status } : o);
//         const completed = updated.filter(o => o.status === 'Terminé').length;
//         const pending   = updated.filter(o => o.status === 'En cours').length;
//         const revenue   = updated.filter(o => o.status === 'Terminé').reduce((s,o) => s + (o.serviceDetails?.price || o.amount || 0), 0);
//         setStats({ total: updated.length, completed, pending, revenue });
//         return updated;
//       });
//       if (selectedOrder?._id === id) setSelectedOrder(p => ({ ...p, status }));
//     } catch (e) { console.error(e); }
//   };

//   const filteredOrders = useMemo(() => {
//     let list = [...orders];
//     if (filters.category !== 'Tous')
//       list = list.filter(o => (o.serviceId?.category || o.serviceDetails?.category || '').toLowerCase() === filters.category.toLowerCase());
//     if (filters.status !== 'Tous')
//       list = list.filter(o => o.status === filters.status);
//     if (filters.search) {
//       const q = filters.search.toLowerCase();
//       list = list.filter(o =>
//         o.userId?.name?.toLowerCase().includes(q) ||
//         o.userId?.email?.toLowerCase().includes(q) ||
//         (o.serviceId?.name || o.serviceDetails?.name || '').toLowerCase().includes(q)
//       );
//     }
//     if (filters.dateRange !== 'all') {
//       const today = new Date(); today.setHours(0,0,0,0);
//       list = list.filter(o => {
//         const d = new Date(o.createdAt);
//         if (filters.dateRange === 'today') return d >= today;
//         if (filters.dateRange === 'week')  { const w = new Date(today); w.setDate(w.getDate()-7); return d >= w; }
//         if (filters.dateRange === 'month') { const m = new Date(today); m.setMonth(m.getMonth()-1); return d >= m; }
//         return true;
//       });
//     }
//     list.sort((a,b) => {
//       const dir = sortConfig.direction === 'asc' ? 1 : -1;
//       if (sortConfig.key === 'client')  return dir * (a.userId?.name || '').localeCompare(b.userId?.name || '');
//       if (sortConfig.key === 'service') return dir * ((a.serviceId?.name || a.serviceDetails?.name || '').localeCompare(b.serviceId?.name || b.serviceDetails?.name || ''));
//       if (sortConfig.key === 'date')    return dir * (new Date(a.createdAt) - new Date(b.createdAt));
//       if (sortConfig.key === 'price')   return dir * ((a.amount || a.serviceDetails?.price || 0) - (b.amount || b.serviceDetails?.price || 0));
//       return 0;
//     });
//     return list;
//   }, [orders, filters, sortConfig]);

//   const SortBtn = ({ col, label }) => (
//     <button onClick={() => setSortConfig(p => ({ key: col, direction: p.key === col && p.direction === 'asc' ? 'desc' : 'asc' }))}
//       className="group inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
//       {label}
//       {sortConfig.key === col
//         ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
//         : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60" />}
//     </button>
//   );

//   return (
//     <div className="w-full py-4 sm:py-6 px-4 sm:px-6 overflow-x-hidden">
//       <div className="max-w-7xl mx-auto space-y-5">

//         {/* En-tête */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Administration</p>
//             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Commandes</h1>
//             <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gérez et suivez toutes les commandes</p>
//           </div>
//           <button onClick={() => fetchOrders(true)} disabled={refreshing}
//             className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-60">
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//             Actualiser
//           </button>
//         </div>

//         {/* KPIs */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//           <KpiCard title="Total commandes"    value={stats.total}              icon={Package}     accent="blue" />
//           <KpiCard title="Terminées"          value={stats.completed}          icon={CheckCircle} accent="green" />
//           <KpiCard title="En cours"           value={stats.pending}            icon={Clock}       accent="amber" />
//           <KpiCard title="Chiffre d'affaires" value={fmtCurrency(stats.revenue)} icon={CreditCard} accent="purple" />
//         </div>

//         {/* Filtres */}
//         <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
//           <div className="flex flex-col gap-3">
//             <div className="relative">
//               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <input type="text" placeholder="Rechercher par client, email ou service…"
//                 value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {[
//                 { key:'category',  opts: CATEGORIES.map(c => ({ v:c, l: c==='Tous' ? 'Toutes catégories' : c })) },
//                 { key:'status',    opts: [{ v:'Tous', l:'Tous les statuts' }, ...ORDER_STATUSES.map(s => ({ v:s.value, l:s.label }))] },
//                 { key:'dateRange', opts: [{ v:'all', l:'Toutes les dates' },{ v:'today', l:"Aujourd'hui" },{ v:'week', l:'7 jours' },{ v:'month', l:'30 jours' }] },
//               ].map(({ key, opts }) => (
//                 <select key={key} value={filters[key]} onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
//                   className="flex-1 min-w-[130px] px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                   {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
//                 </select>
//               ))}
//               <div className="flex items-center px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex-shrink-0">
//                 <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
//                   {filteredOrders.length} résultat{filteredOrders.length !== 1 ? 's' : ''}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tableau */}
//         <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-24 gap-4">
//               <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
//               <p className="text-sm text-slate-400">Chargement des commandes…</p>
//             </div>
//           ) : error ? (
//             <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
//               <AlertCircle className="w-12 h-12 text-red-400" />
//               <p className="text-slate-600 dark:text-slate-300">{error}</p>
//               <button onClick={() => fetchOrders()} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">Réessayer</button>
//             </div>
//           ) : filteredOrders.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
//               <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
//               <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune commande trouvée</p>
//             </div>
//           ) : (
//             <>
//               {/* Table desktop */}
//               <div className="hidden md:block overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead>
//                     <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
//                       <th className="px-5 py-3.5 text-left"><SortBtn col="client"  label="Client" /></th>
//                       <th className="px-5 py-3.5 text-left"><SortBtn col="service" label="Service" /></th>
//                       <th className="px-5 py-3.5 text-left"><SortBtn col="date"    label="Date" /></th>
//                       <th className="px-5 py-3.5 text-right"><SortBtn col="price"  label="Prix" /></th>
//                       <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statut</th>
//                       <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
//                     {filteredOrders.map(order => {
//                       const submitted = extractSubmitted(order);
//                       return (
//                         <tr key={order._id} onClick={() => setSelectedOrder(order)}
//                           className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
//                           <td className="px-5 py-4">
//                             <div className="flex items-center gap-3">
//                               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
//                                 {(order.userId?.name || 'U').charAt(0).toUpperCase()}
//                               </div>
//                               <div className="min-w-0">
//                                 <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{order.userId?.name || 'Utilisateur'}</p>
//                                 <p className="text-xs text-slate-400 truncate">{order.userId?.email || '—'}</p>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-5 py-4">
//                             <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
//                               {order.serviceId?.name || order.serviceDetails?.name || '—'}
//                             </p>
//                             <div className="flex items-center gap-2 mt-0.5">
//                               <span className="text-xs text-slate-400">{order.serviceId?.category || order.serviceDetails?.category || '—'}</span>
//                               {submitted.length > 0 && (
//                                 <span className="text-xs text-indigo-500 flex items-center gap-0.5">
//                                   <ClipboardList className="w-3 h-3" />{submitted.length}
//                                 </span>
//                               )}
//                             </div>
//                           </td>
//                           <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
//                           <td className="px-5 py-4 text-right">
//                             <span className="text-sm font-bold text-slate-900 dark:text-white">
//                               {fmtCurrency(order.amount || order.serviceDetails?.price || 0)}
//                             </span>
//                           </td>
//                           <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
//                             <select value={order.status}
//                               onChange={e => handleStatusChange(order._id, e.target.value)}
//                               className={`text-xs font-semibold border-0 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer ${statusConf(order.status).pill}`}
//                               style={{ backgroundColor:'transparent' }}>
//                               {ORDER_STATUSES.map(s => (
//                                 <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s.label}</option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="px-5 py-4 text-center" onClick={e => e.stopPropagation()}>
//                             <button onClick={() => setSelectedOrder(order)}
//                               className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
//                               <Eye className="w-4 h-4" />
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Liste mobile */}
//               <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
//                 {filteredOrders.map(order => {
//                   const submitted = extractSubmitted(order);
//                   return (
//                     <button key={order._id} onClick={() => setSelectedOrder(order)}
//                       className="w-full text-left px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors active:bg-slate-100">
//                       <div className="flex items-start gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
//                           {(order.userId?.name || 'U').charAt(0).toUpperCase()}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center justify-between gap-2 mb-0.5">
//                             <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{order.userId?.name || 'Utilisateur'}</p>
//                             <StatusPill status={order.status} />
//                           </div>
//                           <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
//                             {order.serviceId?.name || order.serviceDetails?.name || 'Service'}
//                           </p>
//                           <div className="flex items-center gap-3">
//                             <span className="text-sm font-bold text-slate-900 dark:text-white">
//                               {fmtCurrency(order.amount || order.serviceDetails?.price || 0)}
//                             </span>
//                             <span className="text-xs text-slate-400">{fmtDate(order.createdAt)}</span>
//                             {submitted.length > 0 && (
//                               <span className="text-xs text-indigo-500 flex items-center gap-0.5">
//                                 <ClipboardList className="w-3 h-3" />{submitted.length}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0 -rotate-90 mt-1" />
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Footer */}
//               <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
//                 <p className="text-xs text-slate-400">
//                   {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''} affichée{filteredOrders.length !== 1 ? 's' : ''}
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {selectedOrder && (
//         <OrderModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           onStatusChange={handleStatusChange}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminOrdersPage;

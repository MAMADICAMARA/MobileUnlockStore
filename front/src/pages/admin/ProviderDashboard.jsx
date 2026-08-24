// src/pages/admin/ProviderDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { Eye, RotateCcw, Wallet2, XCircle, CheckCircle2, Clock3, X } from 'lucide-react';
import adminService from '../../services/adminService';

const formatDate = (d) => d ? new Date(d).toLocaleString('fr-FR') : '—';
const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FG';

const STATUS_META = {
  'Terminé':   { label: '✅ Terminé',   color: 'bg-green-100 text-green-700' },
  'En cours':  { label: '⏳ En cours',  color: 'bg-yellow-100 text-yellow-700' },
  'en cours':  { label: '⏳ En cours',  color: 'bg-yellow-100 text-yellow-700' },
  'Échoué':    { label: '❌ Échoué',    color: 'bg-red-100 text-red-700' },
  'Rejeté':    { label: '❌ Rejeté',    color: 'bg-red-100 text-red-700' },
  'Remboursé': { label: '💰 Remboursé', color: 'bg-purple-100 text-purple-700' },
  'Annulé':    { label: '🚫 Annulé',    color: 'bg-gray-100 text-gray-600' },
};

const ProviderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ providerId: '', status: '' });
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filters.providerId) params.providerId = filters.providerId;
      if (filters.status)     params.status = filters.status;
      const res = await adminService.getProviderOrders(params);
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Erreur chargement commandes fournisseurs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminService.getAllProviders().then(res => setProviders(res.data?.data || [])).catch(() => {});
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchOrders(); }, [filters]);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    return {
      total: todayOrders.length,
      enCours: orders.filter(o => ['En cours', 'en cours'].includes(o.status)).length,
      terminees: orders.filter(o => o.status === 'Terminé').length,
      echouees: orders.filter(o => ['Échoué', 'Rejeté'].includes(o.status)).length,
    };
  }, [orders]);

  const handleRetry = async (order) => {
    setActionLoading(true);
    try {
      await adminService.retryProviderOrder(order._id);
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Erreur lors du renvoi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (order) => {
    if (!window.confirm('Rembourser cette commande ?')) return;
    setActionLoading(true);
    try {
      await adminService.refundProviderOrder(order._id);
      await fetchOrders();
      setSelected(null);
    } catch (err) {
      alert(err.message || 'Erreur lors du remboursement.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Tableau de bord fournisseurs</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Clock3} label="Total aujourd'hui" value={stats.total} color="from-blue-400 to-cyan-400" />
        <StatCard icon={Clock3} label="En cours" value={stats.enCours} color="from-yellow-400 to-amber-400" />
        <StatCard icon={CheckCircle2} label="Terminées" value={stats.terminees} color="from-green-400 to-emerald-400" />
        <StatCard icon={XCircle} label="Échouées" value={stats.echouees} color="from-red-400 to-rose-400" />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <select value={filters.providerId} onChange={e => setFilters(f => ({ ...f, providerId: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg text-sm">
          <option value="">Tous les fournisseurs</option>
          {providers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg text-sm">
          <option value="">Tous les statuts</option>
          {['En cours', 'Terminé', 'Échoué', 'Rejeté', 'Remboursé'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucune commande automatique pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  {['ID commande', 'Client', 'Service', 'Fournisseur', 'Statut', 'Tentatives', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-white/10">
                {orders.map(order => {
                  const meta = STATUS_META[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
                  const maxRetries = order.providerId?.retryConfig?.maxRetries ?? 3;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">#{order._id.slice(-8)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{order.userId?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{order.serviceDetails?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{order.providerId?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{order.retryCount || 0}/{maxRetries}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelected(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                            <Eye className="w-3.5 h-3.5" /> Voir
                          </button>
                          {['Échoué', 'Rejeté'].includes(order.status) && (
                            <>
                              <button onClick={() => handleRetry(order)} disabled={actionLoading}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition disabled:opacity-50">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleRefund(order)} disabled={actionLoading}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition disabled:opacity-50">
                                <Wallet2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panneau détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Détail de la commande</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <DetailRow label="ID site" value={selected._id} mono />
              <DetailRow label="ID fournisseur" value={selected.providerOrderId || '—'} mono />
              <DetailRow label="Client" value={`${selected.userId?.name || '—'} (${selected.userId?.email || ''})`} />
              <DetailRow label="Service" value={selected.serviceDetails?.name} />
              <DetailRow label="Fournisseur" value={selected.providerId?.name || '—'} />
              <DetailRow label="Envoyé le" value={formatDate(selected.sentToProviderAt)} />
              <DetailRow label="Terminé le" value={formatDate(selected.completedAt)} />
              <DetailRow label="Résultat livré" value={selected.deliveryData?.unlockCode || selected.deliveryData?.get?.('unlockCode') || '—'} />
              <DetailRow label="Statut fournisseur brut" value={selected.providerStatus || '—'} mono />
              <DetailRow label="Statut site" value={selected.status} />
              <DetailRow label="Montant" value={formatCurrency(selected.amount)} />
              {selected.providerError && <DetailRow label="Dernière erreur" value={selected.providerError} />}

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                <button onClick={() => handleRetry(selected)} disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-sm font-medium disabled:opacity-50">
                  <RotateCcw className="w-4 h-4" /> Renvoyer manuellement
                </button>
                <button onClick={() => handleRefund(selected)} disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium disabled:opacity-50">
                  <Wallet2 className="w-4 h-4" /> Rembourser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/10 p-4 shadow-sm">
    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const DetailRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between gap-4">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`text-right text-gray-800 dark:text-gray-100 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
  </div>
);

export default ProviderDashboard;

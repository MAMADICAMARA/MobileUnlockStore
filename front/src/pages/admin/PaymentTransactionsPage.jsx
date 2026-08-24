// src/pages/admin/PaymentTransactionsPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Eye, X } from 'lucide-react';
import adminService from '../../services/adminService';

const formatDate = (d) => d ? new Date(d).toLocaleString('fr-FR') : '—';
const formatFG = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

const STATUS_META = {
  pending:   { label: '⏳ En attente', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: '✅ Complété',   color: 'bg-green-100 text-green-700' },
  failed:    { label: '❌ Échoué',     color: 'bg-red-100 text-red-700' },
  cancelled: { label: '🚫 Annulé',     color: 'bg-gray-100 text-gray-600' },
};

const PaymentTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState([]);
  const [providers, setProviders] = useState([]);
  const [filters, setFilters] = useState({ providerId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filters.providerId) params.providerId = filters.providerId;
      if (filters.status)      params.status = filters.status;
      const res = await adminService.getAllPaymentTransactions(params);
      setTransactions(res.data.data || []);
      setStats(res.data.stats || []);
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminService.getPaymentProviders().then(res => setProviders(res.data?.data || [])).catch(() => {});
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTransactions(); }, [filters]);

  const statMap = useMemo(() => {
    const m = { completed: 0, failed: 0, total: 0, revenue: 0 };
    stats.forEach(s => {
      m.total += s.count;
      if (s._id === 'completed') { m.completed = s.count; m.revenue = s.amount; }
      if (s._id === 'failed') m.failed = s.count;
    });
    return m;
  }, [stats]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Historique des transactions</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={statMap.total} />
        <StatCard label="Complétées" value={statMap.completed} />
        <StatCard label="Échouées" value={statMap.failed} />
        <StatCard label="Revenu" value={`${formatFG(statMap.revenue)} FG`} />
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filters.providerId} onChange={e => setFilters(f => ({ ...f, providerId: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg text-sm">
          <option value="">Tous les providers</option>
          {providers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-white/10 dark:bg-slate-800 dark:text-white rounded-lg text-sm">
          <option value="">Tous les statuts</option>
          {Object.keys(STATUS_META).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucune transaction pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  {['Date', 'Client', 'Provider', 'Montant', 'Statut', 'Réf. interne', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-white/10">
                {transactions.map(tx => {
                  const meta = STATUS_META[tx.status] || STATUS_META.pending;
                  return (
                    <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{tx.userId?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{tx.providerId?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatFG(tx.amountCharged)} {tx.currency}</td>
                      <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span></td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{tx.internalRef}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Détail de la transaction</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <Row label="Référence interne" value={selected.internalRef} mono />
              <Row label="Réf. provider" value={selected.providerRef || '—'} mono />
              <Row label="Client" value={`${selected.userId?.name || '—'} (${selected.userId?.email || ''})`} />
              <Row label="Provider" value={selected.providerId?.name || '—'} />
              <Row label="Montant demandé" value={`${formatFG(selected.amountRequested)} FG`} />
              <Row label="Frais" value={`${formatFG(selected.fees?.amount)} FG`} />
              <Row label="Montant débité" value={`${formatFG(selected.amountCharged)} ${selected.currency}`} />
              <Row label="Montant crédité" value={`${formatFG(selected.amountCredited)} FG`} />
              <Row label="Statut" value={selected.status} />
              <Row label="Créé le" value={formatDate(selected.createdAt)} />
              <Row label="Crédité le" value={formatDate(selected.creditedAt)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/10 p-4 shadow-sm">
    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const Row = ({ label, value, mono = false }) => (
  <div className="flex justify-between gap-4">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`text-right text-gray-800 dark:text-gray-100 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
  </div>
);

export default PaymentTransactionsPage;

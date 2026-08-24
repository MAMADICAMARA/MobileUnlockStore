// src/pages/admin/Providers.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Zap, Pencil, Trash2, Globe2, Radio, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService';

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
    isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {isActive ? 'Actif' : 'Inactif'}
  </span>
);

const MODE_LABELS = { webhook: 'Webhook', polling: 'Polling', both: 'Les deux' };

const Providers = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllProviders();
      setProviders(res.data?.data || []);
    } catch (err) {
      console.error('Erreur chargement fournisseurs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleTest = async (id) => {
    setTestingId(id);
    setTestResults(prev => ({ ...prev, [id]: null }));
    try {
      const res = await adminService.testProviderConnection(id);
      setTestResults(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      setTestResults(prev => ({ ...prev, [id]: { success: false, message: err.message || 'Erreur de connexion' } }));
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (provider) => {
    try {
      const res = await adminService.updateProvider(provider._id, { isActive: !provider.isActive });
      setProviders(prev => prev.map(p => p._id === provider._id ? { ...p, isActive: res.data.data.isActive } : p));
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de statut.');
    }
  };

  const handleDelete = async (provider) => {
    if (!window.confirm(`Supprimer le fournisseur "${provider.name}" ?`)) return;
    try {
      await adminService.deleteProvider(provider._id);
      setProviders(prev => prev.filter(p => p._id !== provider._id));
    } catch (err) {
      alert(err.message || 'Impossible de supprimer ce fournisseur.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Fournisseurs API</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les fournisseurs de déblocage automatique.</p>
        </div>
        <button
          onClick={() => navigate('/admin/providers/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
          <Plus className="w-4 h-4" /> Ajouter un fournisseur
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : providers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun fournisseur configuré. Les commandes seront traitées manuellement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  {['Fournisseur', 'Environnement', 'Statut', 'Mode suivi', 'Services liés', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-white/10">
                {providers.map(provider => (
                  <tr key={provider._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {provider.logoUrl
                            ? <img src={provider.logoUrl} alt="" className="w-full h-full object-cover" />
                            : <Globe2 className="w-5 h-5 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{provider.name}</p>
                          <p className="text-xs text-gray-400 truncate">{provider.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        provider.apiConfig?.environment === 'production' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {provider.apiConfig?.environment === 'production' ? 'Production' : 'Sandbox'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleToggleActive(provider)}>
                        <StatusBadge isActive={provider.isActive} />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5" /> {MODE_LABELS[provider.trackingConfig?.mode] || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                        {provider.linkedServices ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleTest(provider._id)}
                          disabled={testingId === provider._id}
                          title="Tester la connexion"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50">
                          {testingId === provider._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                          Tester
                        </button>
                        <Link to={`/admin/providers/${provider._id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                          <Pencil className="w-3.5 h-3.5" /> Modifier
                        </Link>
                        <button onClick={() => handleDelete(provider)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                          <Trash2 className="w-3.5 h-3.5" /> Supprimer
                        </button>
                      </div>
                      {testResults[provider._id] && (
                        <p className={`mt-1.5 text-xs flex items-center gap-1 ${testResults[provider._id].success ? 'text-emerald-600' : 'text-red-600'}`}>
                          {testResults[provider._id].success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {testResults[provider._id].message}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Providers;

// src/pages/admin/ProviderServiceMapping.jsx
import { useState, useEffect } from 'react';
import { Info, CheckCircle2, Wrench, Save } from 'lucide-react';
import adminService from '../../services/adminService';

const ProviderServiceMapping = () => {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [rows, setRows] = useState({}); // état local par serviceId : { providerId, providerServiceCode, backupProviderId, linkId }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [servicesRes, providersRes, linksRes] = await Promise.all([
          adminService.getAllServices(),
          adminService.getAllProviders(),
          adminService.getAllProviderServices(),
        ]);
        const servicesData  = servicesRes.data?.data || servicesRes.data || [];
        const providersData = providersRes.data?.data || [];
        const linksData     = linksRes.data?.data || [];

        setServices(servicesData);
        setProviders(providersData);

        const initialRows = {};
        servicesData.forEach(s => {
          const primary = linksData.find(l => l.serviceId?._id === s._id && l.isPrimary);
          const backup  = linksData.find(l => l.serviceId?._id === s._id && l.isBackup);
          initialRows[s._id] = {
            linkId: primary?._id || null,
            providerId: primary?.providerId?._id || '',
            providerServiceCode: primary?.providerServiceCode || '',
            backupLinkId: backup?._id || null,
            backupProviderId: backup?.providerId?._id || '',
          };
        });
        setRows(initialRows);
      } catch (err) {
        console.error('Erreur chargement associations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const updateRow = (serviceId, key, value) => {
    setRows(prev => ({ ...prev, [serviceId]: { ...prev[serviceId], [key]: value } }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');
    try {
      for (const service of services) {
        const row = rows[service._id];
        if (!row) continue;

        // Fournisseur principal
        if (row.providerId) {
          const payload = {
            serviceId: service._id,
            providerId: row.providerId,
            providerServiceCode: row.providerServiceCode || '',
            isPrimary: true,
            isBackup: false,
            priority: 1,
            isActive: true,
          };
          if (row.linkId) {
            await adminService.updateProviderService(row.linkId, payload);
          } else {
            const res = await adminService.createProviderService(payload);
            updateRow(service._id, 'linkId', res.data.data._id);
          }
        } else if (row.linkId) {
          await adminService.deleteProviderService(row.linkId);
          updateRow(service._id, 'linkId', null);
        }

        // Fournisseur de secours
        if (row.backupProviderId) {
          const payload = {
            serviceId: service._id,
            providerId: row.backupProviderId,
            providerServiceCode: row.providerServiceCode || '',
            isPrimary: false,
            isBackup: true,
            priority: 2,
            isActive: true,
          };
          if (row.backupLinkId) {
            await adminService.updateProviderService(row.backupLinkId, payload);
          } else {
            const res = await adminService.createProviderService(payload);
            updateRow(service._id, 'backupLinkId', res.data.data._id);
          }
        } else if (row.backupLinkId) {
          await adminService.deleteProviderService(row.backupLinkId);
          updateRow(service._id, 'backupLinkId', null);
        }
      }
      setMessage('✅ Associations enregistrées avec succès.');
    } catch (err) {
      setMessage(`❌ ${err.message || 'Erreur lors de l\'enregistrement.'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Association Service ↔ Fournisseur</h1>
      </div>

      <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-sm text-blue-800 dark:text-blue-300">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Les services sans fournisseur configuré seront traités manuellement par l'admin (comportement actuel).
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {['Service', 'Fournisseur principal', 'Code service', 'Secours', 'Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-white/10">
              {services.map(service => {
                const row = rows[service._id] || {};
                const isAuto = Boolean(row.providerId);
                return (
                  <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                      <p className="text-xs text-gray-400">{service.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select value={row.providerId || ''} onChange={e => updateRow(service._id, 'providerId', e.target.value)}
                        className="w-44 px-2.5 py-1.5 border border-gray-300 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-lg text-sm">
                        <option value="">Aucun</option>
                        {providers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input value={row.providerServiceCode || ''} onChange={e => updateRow(service._id, 'providerServiceCode', e.target.value)}
                        placeholder="Ex: ATT_IPH_001" disabled={!isAuto}
                        className="w-40 px-2.5 py-1.5 border border-gray-300 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-lg text-sm disabled:opacity-50" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={row.backupProviderId || ''} onChange={e => updateRow(service._id, 'backupProviderId', e.target.value)}
                        className="w-40 px-2.5 py-1.5 border border-gray-300 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-lg text-sm">
                        <option value="">Aucun</option>
                        {providers.filter(p => p._id !== row.providerId).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {isAuto ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Auto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Wrench className="w-3.5 h-3.5" /> Manuel
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSaveAll} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        {message && <span className="text-sm">{message}</span>}
      </div>
    </div>
  );
};

export default ProviderServiceMapping;

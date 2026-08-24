// src/pages/admin/PaymentProvidersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings2, Wallet, Pencil, Power, AlertTriangle } from 'lucide-react';
import adminService from '../../services/adminService';

const TYPE_LABELS = { mobile_money: 'Mobile Money', crypto: 'Crypto', card: 'Carte bancaire' };

const formatFG = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

const calcPreview = (amount, fees) => {
  if (!fees?.enabled) return { fees: 0, total: amount };
  let f = 0;
  if (fees.type === 'percentage' || fees.type === 'both') f += amount * (Number(fees.percentage) / 100);
  if (fees.type === 'fixed' || fees.type === 'both') f += Number(fees.fixedAmount);
  f = Math.round(f);
  const total = fees.appliedTo === 'client' ? amount + f : amount;
  return { fees: f, total };
};

const PaymentProvidersPage = () => {
  const [settings, setSettings] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingFees, setSavingFees] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [settingsRes, providersRes] = await Promise.all([
        adminService.getPaymentSettings(),
        adminService.getPaymentProviders(),
      ]);
      setSettings(settingsRes.data.data);
      setProviders(providersRes.data.data || []);
    } catch (err) {
      console.error('Erreur chargement paramètres paiement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateFees = (key, value) => setSettings(prev => ({ ...prev, fees: { ...prev.fees, [key]: value } }));

  const handleSaveGlobalToggle = async () => {
    setSavingSettings(true);
    setMessage('');
    try {
      const res = await adminService.updatePaymentSettings({ automaticPaymentEnabled: settings.automaticPaymentEnabled });
      setSettings(res.data.data);
      setMessage('✅ Paramètres enregistrés.');
    } catch (err) {
      setMessage(`❌ ${err.message || 'Erreur'}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveFees = async () => {
    setSavingFees(true);
    setMessage('');
    try {
      const res = await adminService.updatePaymentSettings({ fees: settings.fees });
      setSettings(res.data.data);
      setMessage('✅ Frais enregistrés.');
    } catch (err) {
      setMessage(`❌ ${err.message || 'Erreur'}`);
    } finally {
      setSavingFees(false);
    }
  };

  const handleToggleProvider = async (provider) => {
    try {
      const res = await adminService.togglePaymentProvider(provider._id);
      setProviders(prev => prev.map(p => p._id === provider._id ? { ...p, isActive: res.data.isActive } : p));
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de statut.');
    }
  };

  if (loading || !settings) return <div className="p-12 text-center text-gray-500">Chargement...</div>;

  const preview = calcPreview(100000, settings.fees);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Gestion des paiements</h1>
      {message && <p className="text-sm">{message}</p>}

      {/* ── Interrupteur global ── */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-100 dark:border-white/10 p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
          <Settings2 className="w-5 h-5" /> Paramètres généraux du paiement
        </h2>
        <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 cursor-pointer">
          <input type="checkbox" className="mt-1 w-4 h-4"
            checked={settings.automaticPaymentEnabled}
            onChange={e => setSettings(prev => ({ ...prev, automaticPaymentEnabled: e.target.checked }))} />
          <span>
            <span className="block font-medium text-gray-800 dark:text-white">Activer le système de paiement automatique</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              Les clients pourront payer directement via les providers actifs ci-dessous.
            </span>
            {!settings.automaticPaymentEnabled && (
              <span className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" /> Si désactivé : les clients voient uniquement le bouton WhatsApp (comportement actuel).
              </span>
            )}
          </span>
        </label>
        <button onClick={handleSaveGlobalToggle} disabled={savingSettings}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50">
          {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>

      {/* ── Frais applicatifs ── */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-100 dark:border-white/10 p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
          <Wallet className="w-5 h-5" /> Frais applicatifs
        </h2>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input type="checkbox" checked={settings.fees.enabled} onChange={e => updateFees('enabled', e.target.checked)} />
          Activer les frais applicatifs
        </label>

        {settings.fees.enabled && (
          <div className="space-y-4 pl-1">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Type de frais</p>
              <div className="flex flex-col gap-1.5">
                {[
                  ['percentage', 'Pourcentage seulement'],
                  ['fixed', 'Montant fixe seulement'],
                  ['both', 'Les deux combinés'],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <input type="radio" name="feesType" value={value} checked={settings.fees.type === value}
                      onChange={() => updateFees('type', value)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Pourcentage (%)</label>
                <input type="number" min={0} step="0.1" value={settings.fees.percentage}
                  onChange={e => updateFees('percentage', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Montant fixe (FG)</label>
                <input type="number" min={0} value={settings.fees.fixedAmount}
                  onChange={e => updateFees('fixedAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Qui supporte les frais</p>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input type="radio" name="appliedTo" checked={settings.fees.appliedTo === 'client'} onChange={() => updateFees('appliedTo', 'client')} />
                  Le client (frais ajoutés au montant)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input type="radio" name="appliedTo" checked={settings.fees.appliedTo === 'admin'} onChange={() => updateFees('appliedTo', 'admin')} />
                  La plateforme (frais absorbés)
                </label>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={settings.fees.displayToClient} onChange={e => updateFees('displayToClient', e.target.checked)} />
              Afficher les frais au client avant paiement
            </label>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Aperçu pour une recharge de 100 000 FG :</p>
              <p>Frais : {formatFG(preview.fees)} FG</p>
              <p>Total débité : {formatFG(preview.total)} FG</p>
              <p>Solde crédité : {formatFG(100000)} FG</p>
            </div>
          </div>
        )}

        <button onClick={handleSaveFees} disabled={savingFees}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50">
          {savingFees ? 'Enregistrement...' : 'Enregistrer les frais'}
        </button>
      </div>

      {/* ── Liste des providers ── */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {['Provider', 'Type', 'Environnement', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-white/10">
              {providers.map(provider => {
                const configured = provider.apiKeys?.hasKey1 && provider.apiKeys?.hasKey2;
                return (
                  <tr key={provider._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{provider.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{TYPE_LABELS[provider.type]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        provider.environment === 'production' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {provider.environment === 'production' ? 'Production' : 'Sandbox'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!configured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">⚙️ Non configuré</span>
                      ) : provider.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">✅ Actif</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">⏸ Inactif</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/admin/payment-providers/${provider._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                          <Pencil className="w-3.5 h-3.5" /> Config
                        </Link>
                        <button onClick={() => handleToggleProvider(provider)} disabled={!configured}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${
                            provider.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          }`}>
                          <Power className="w-3.5 h-3.5" /> {provider.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentProvidersPage;

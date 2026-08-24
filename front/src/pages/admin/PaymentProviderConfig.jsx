// src/pages/admin/PaymentProviderConfig.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Plus, Trash2, Loader2, CheckCircle2, XCircle, Copy } from 'lucide-react';
import adminService from '../../services/adminService';
import api from '../../services/api';

const TABS = ['Général', 'Clés API', 'Limites & Montants', 'Webhook'];

// Signification de key1..key4 selon le provider (voir back/services/payment/*.js)
const KEY_FIELDS = {
  paydunya:   [{ field: 'key1', label: 'Master Key' }, { field: 'key2', label: 'Public Key' }, { field: 'key3', label: 'Private Key' }, { field: 'key4', label: 'Token' }],
  cinetpay:   [{ field: 'key1', label: 'API Key' }, { field: 'key2', label: 'Site ID', plain: true }],
  binancepay: [{ field: 'key1', label: 'API Key (Certificate SN)' }, { field: 'key2', label: 'Secret Key' }, { field: 'key3', label: 'Merchant ID', plain: true }],
  stripe:     [{ field: 'key1', label: 'Publishable Key', plain: true }, { field: 'key2', label: 'Secret Key' }],
};

const emptyKeys = { key1: '', key2: '', key3: '', key4: '', webhookSecret: '' };

const PaymentProviderConfig = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [provider, setProvider] = useState(null);
  const [hasKeys, setHasKeys] = useState({});
  const [apiKeys, setApiKeys] = useState(emptyKeys);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getPaymentProviderById(id);
        setProvider(res.data.data);
        setHasKeys(res.data.data.apiKeys || {});
      } catch (err) {
        setError(err.message || 'Provider introuvable.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const update = (path, value) => {
    setProvider(prev => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addQuickAmount = () => update('quickAmounts', [...(provider.quickAmounts || []), 100000]);
  const setQuickAmount = (i, value) => {
    const next = [...provider.quickAmounts];
    next[i] = Number(value) || 0;
    update('quickAmounts', next);
  };
  const removeQuickAmount = (i) => update('quickAmounts', provider.quickAmounts.filter((_, idx) => idx !== i));

  const addMethod = () => update('supportedMethods', [...(provider.supportedMethods || []), '']);
  const setMethod = (i, value) => {
    const next = [...provider.supportedMethods];
    next[i] = value;
    update('supportedMethods', next);
  };
  const removeMethod = (i) => update('supportedMethods', provider.supportedMethods.filter((_, idx) => idx !== i));

  const webhookUrl = `${api.defaults.baseURL}/api/payments/webhook/${provider?.slug}`;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await adminService.testPaymentProvider(id);
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Erreur de connexion' });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...provider };
      // N'envoyer que les clés effectivement saisies — un champ vide = ne pas changer
      const filledKeys = Object.fromEntries(Object.entries(apiKeys).filter(([, v]) => v));
      if (Object.keys(filledKeys).length > 0) payload.apiKeys = filledKeys;
      else delete payload.apiKeys;

      await adminService.updatePaymentProvider(id, payload);
      navigate('/admin/payment-providers');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Chargement...</div>;
  if (!provider) return <div className="p-12 text-center text-red-500">{error || 'Provider introuvable.'}</div>;

  const keyFields = KEY_FIELDS[provider.slug] || [];

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Configuration — {provider.name}</h1>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-white/10">
          {TABS.map((label, i) => (
            <button key={label} type="button" onClick={() => setTab(i)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Onglet 1 — Général */}
          {tab === 0 && (
            <div className="space-y-4">
              <F label="Nom du provider"><input disabled value={provider.name} className="input opacity-60" /></F>
              <F label="Type"><input disabled value={provider.type} className="input opacity-60" /></F>
              <F label="Logo URL"><input value={provider.logoUrl} onChange={e => update('logoUrl', e.target.value)} className="input" /></F>
              <F label="Environnement">
                <Segmented value={provider.environment} onChange={v => update('environment', v)}
                  options={[{ value: 'sandbox', label: 'Sandbox' }, { value: 'production', label: 'Production' }]} />
              </F>
              <F label="Statut">
                <Segmented value={provider.isActive ? 'active' : 'inactive'} onChange={v => update('isActive', v === 'active')}
                  options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} />
              </F>
              <F label="Méthodes supportées (affichées au client)">
                <div className="space-y-2">
                  {(provider.supportedMethods || []).map((m, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={m} onChange={e => setMethod(i, e.target.value)} className="input flex-1" />
                      <button type="button" onClick={() => removeMethod(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addMethod} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    <Plus className="w-3.5 h-3.5" /> Ajouter une méthode
                  </button>
                </div>
              </F>
            </div>
          )}

          {/* Onglet 2 — Clés API */}
          {tab === 1 && (
            <div className="space-y-4">
              {keyFields.map(({ field, label, plain }) => (
                <F key={field} label={`${label} ${hasKeys[`has${field.charAt(0).toUpperCase()}${field.slice(1)}`] ? '(configurée — laisser vide pour ne pas changer)' : ''}`}>
                  <div className="relative">
                    <input
                      type={plain || visibleKeys[field] ? 'text' : 'password'}
                      value={apiKeys[field]}
                      onChange={e => setApiKeys(prev => ({ ...prev, [field]: e.target.value }))}
                      className="input pr-10"
                      placeholder={hasKeys[`has${field.charAt(0).toUpperCase()}${field.slice(1)}`] ? '••••••••••••••••' : ''}
                    />
                    {!plain && (
                      <button type="button" onClick={() => setVisibleKeys(v => ({ ...v, [field]: !v[field] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {visibleKeys[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </F>
              ))}
              <F label={`Webhook Secret ${hasKeys.hasWebhookSecret ? '(configuré — laisser vide pour ne pas changer)' : ''}`}>
                <div className="relative">
                  <input type={visibleKeys.webhookSecret ? 'text' : 'password'} value={apiKeys.webhookSecret}
                    onChange={e => setApiKeys(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    className="input pr-10" placeholder={hasKeys.hasWebhookSecret ? '••••••••••••••••' : ''} />
                  <button type="button" onClick={() => setVisibleKeys(v => ({ ...v, webhookSecret: !v.webhookSecret }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {visibleKeys.webhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </F>

              <button type="button" onClick={handleTest} disabled={testing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium disabled:opacity-50">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Tester la connexion
              </button>
              {testResult && (
                <p className={`text-sm flex items-center gap-1.5 ${testResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {testResult.message}
                </p>
              )}
              <p className="text-xs text-gray-400">
                ⚠️ Enregistrez d'abord vos clés avant de tester — le test utilise les clés déjà sauvegardées en base.
              </p>
            </div>
          )}

          {/* Onglet 3 — Limites & Montants */}
          {tab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F label="Montant minimum autorisé">
                  <input type="number" min={0} value={provider.limits.minAmount} onChange={e => update('limits.minAmount', Number(e.target.value))} className="input" />
                </F>
                <F label="Montant maximum autorisé">
                  <input type="number" min={0} value={provider.limits.maxAmount} onChange={e => update('limits.maxAmount', Number(e.target.value))} className="input" />
                </F>
              </div>
              <F label="Devise">
                <select value={provider.limits.currency} onChange={e => update('limits.currency', e.target.value)} className="input">
                  {['GNF', 'XOF', 'USD', 'USDT'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </F>
              {provider.limits.currency !== 'GNF' && (
                <F label={`Taux de conversion (1 ${provider.limits.currency} = X GNF)`}>
                  <input type="number" min={0} value={provider.limits.exchangeRateToProviderCurrency}
                    onChange={e => update('limits.exchangeRateToProviderCurrency', Number(e.target.value))} className="input" />
                </F>
              )}
              <F label="Montants rapides suggérés au client">
                <div className="space-y-2">
                  {(provider.quickAmounts || []).map((amt, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="number" value={amt} onChange={e => setQuickAmount(i, e.target.value)} className="input flex-1" />
                      <button type="button" onClick={() => removeQuickAmount(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addQuickAmount} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    <Plus className="w-3.5 h-3.5" /> Ajouter un montant
                  </button>
                </div>
              </F>
            </div>
          )}

          {/* Onglet 4 — Webhook */}
          {tab === 3 && (
            <div className="space-y-4">
              <F label="URL Webhook (à copier chez le provider)">
                <div className="flex gap-2">
                  <input readOnly value={webhookUrl} className="input font-mono text-xs bg-gray-100 dark:bg-slate-900" />
                  <button type="button" onClick={() => navigator.clipboard?.writeText(webhookUrl)}
                    className="px-3 rounded-lg border border-gray-300 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </F>
              <F label="URL de retour succès">
                <input value={provider.config.returnUrl} onChange={e => update('config.returnUrl', e.target.value)} className="input" />
              </F>
              <F label="URL d'annulation">
                <input value={provider.config.cancelUrl} onChange={e => update('config.cancelUrl', e.target.value)} className="input" />
              </F>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button type="button" onClick={() => navigate('/admin/payment-providers')}
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid rgb(209 213 219); border-radius: 0.5rem; font-size: 0.875rem; background: white; }
        .input:focus { outline: none; box-shadow: 0 0 0 2px rgb(59 130 246); }
        html.dark .input { background: rgb(15 23 42); border-color: rgba(255,255,255,0.1); color: white; }
      `}</style>
    </div>
  );
};

const F = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label>
    {children}
  </div>
);

const Segmented = ({ value, onChange, options }) => (
  <div className="inline-flex rounded-lg border border-gray-300 dark:border-white/10 overflow-hidden">
    {options.map(opt => (
      <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 text-sm font-medium transition ${
          value === opt.value ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
        }`}>
        {opt.label}
      </button>
    ))}
  </div>
);

export default PaymentProviderConfig;

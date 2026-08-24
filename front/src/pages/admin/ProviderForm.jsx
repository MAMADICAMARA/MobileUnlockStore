// src/pages/admin/ProviderForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Plus, Trash2, Loader2, CheckCircle2, XCircle, Copy } from 'lucide-react';
import adminService from '../../services/adminService';
import api from '../../services/api';

const TABS = ['Général', 'Configuration API', 'Mode de suivi', 'Mapping des champs', 'Mapping des statuts'];

const SITE_FIELDS = ['imei', 'network', 'model', 'service_code', 'email', 'username', 'quantity', 'notes', 'remoteId'];
const SITE_STATUSES = ['En attente', 'En cours', 'Terminé', 'Échoué', 'Rejeté', 'Remboursé'];

const emptyProvider = {
  name: '', slug: '', description: '', logoUrl: '', isActive: true,
  apiConfig: {
    baseUrl: '', authType: 'api_key', apiKey: '', authHeader: 'Authorization',
    requestFormat: 'json', httpMethod: 'POST', orderEndpoint: '', statusEndpoint: '', environment: 'sandbox',
  },
  trackingConfig: {
    mode: 'polling', webhookSecret: '', pollingIntervalMinutes: 15,
    statusField: 'status', orderIdField: 'order_id', resultField: 'unlock_code',
  },
  fieldMapping: [],
  statusMapping: [],
  retryConfig: { maxRetries: 3, retryDelays: [60, 300, 900], autoRefundOnFailure: true },
};

const slugify = (str) => str.toLowerCase().trim()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ProviderForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [provider, setProvider] = useState(emptyProvider);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await adminService.getProviderById(id);
        const data = res.data.data;
        setHasApiKey(!!data.apiConfig?.hasApiKey);
        setProvider({
          ...emptyProvider,
          ...data,
          apiConfig: { ...emptyProvider.apiConfig, ...data.apiConfig, apiKey: '' },
          trackingConfig: { ...emptyProvider.trackingConfig, ...data.trackingConfig },
          retryConfig: { ...emptyProvider.retryConfig, ...data.retryConfig },
        });
      } catch (err) {
        setError(err.message || 'Fournisseur introuvable.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

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

  const handleNameChange = (name) => {
    update('name', name);
    if (!slugTouched) update('slug', slugify(name));
  };

  const webhookUrl = `${api.defaults.baseURL}/api/webhook/${provider.slug || '{slug}'}`;

  const addFieldMapping = () => update('fieldMapping', [...provider.fieldMapping, { siteField: SITE_FIELDS[0], providerField: '', required: false, defaultValue: '' }]);
  const removeFieldMapping = (i) => update('fieldMapping', provider.fieldMapping.filter((_, idx) => idx !== i));
  const setFieldMapping = (i, key, value) => {
    const next = provider.fieldMapping.map((f, idx) => idx === i ? { ...f, [key]: value } : f);
    update('fieldMapping', next);
  };

  const addStatusMapping = () => update('statusMapping', [...provider.statusMapping, { providerStatus: '', siteStatus: 'En cours' }]);
  const removeStatusMapping = (i) => update('statusMapping', provider.statusMapping.filter((_, idx) => idx !== i));
  const setStatusMapping = (i, key, value) => {
    const next = provider.statusMapping.map((s, idx) => idx === i ? { ...s, [key]: value } : s);
    update('statusMapping', next);
  };

  const setRetryDelay = (i, value) => {
    const next = [...provider.retryConfig.retryDelays];
    next[i] = Number(value) || 0;
    update('retryConfig.retryDelays', next);
  };

  const handleTest = async () => {
    if (!isEdit) {
      setTestResult({ success: false, message: 'Enregistrez d\'abord le fournisseur pour tester la connexion.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await adminService.testProviderConnection(id);
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
      const payload = structuredClone(provider);
      if (!payload.apiConfig.apiKey) delete payload.apiConfig.apiKey;

      if (isEdit) {
        await adminService.updateProvider(id, payload);
      } else {
        await adminService.createProvider(payload);
      }
      navigate('/admin/providers');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du fournisseur.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Chargement...</div>;

  const trackingMode = provider.trackingConfig.mode;
  const showWebhookFields = trackingMode === 'webhook' || trackingMode === 'both';
  const showPollingFields = trackingMode === 'polling' || trackingMode === 'both';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          {isEdit ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
        </h1>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
      )}

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {/* Onglets */}
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
          {/* Onglet 1 — Informations générales */}
          {tab === 0 && (
            <div className="space-y-4">
              <Field label="Nom du fournisseur *">
                <input required value={provider.name} onChange={e => handleNameChange(e.target.value)}
                  className="input" placeholder="Ex: DoctorUnlock" />
              </Field>
              <Field label="Slug (identifiant unique)">
                <input required value={provider.slug}
                  onChange={e => { setSlugTouched(true); update('slug', slugify(e.target.value)); }}
                  className="input font-mono" placeholder="doctorunlock" />
              </Field>
              <Field label="Description">
                <textarea value={provider.description} onChange={e => update('description', e.target.value)}
                  className="input" rows={2} />
              </Field>
              <Field label="URL du logo (optionnel)">
                <input value={provider.logoUrl} onChange={e => update('logoUrl', e.target.value)} className="input" />
              </Field>
              <Field label="Environnement">
                <SegmentedControl
                  value={provider.apiConfig.environment}
                  onChange={v => update('apiConfig.environment', v)}
                  options={[{ value: 'sandbox', label: 'Sandbox / Test' }, { value: 'production', label: 'Production / Live' }]}
                />
              </Field>
              <Field label="Statut">
                <SegmentedControl
                  value={provider.isActive ? 'active' : 'inactive'}
                  onChange={v => update('isActive', v === 'active')}
                  options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]}
                />
              </Field>
            </div>
          )}

          {/* Onglet 2 — Configuration API */}
          {tab === 1 && (
            <div className="space-y-4">
              <Field label="URL de base de l'API *">
                <input required value={provider.apiConfig.baseUrl} onChange={e => update('apiConfig.baseUrl', e.target.value)}
                  className="input" placeholder="https://api.doctorunlock.com/v1" />
              </Field>
              <Field label="Type d'authentification *">
                <SegmentedControl
                  value={provider.apiConfig.authType}
                  onChange={v => update('apiConfig.authType', v)}
                  options={[{ value: 'api_key', label: 'Clé API' }, { value: 'bearer', label: 'Bearer Token' }, { value: 'basic', label: 'Basic Auth' }]}
                />
              </Field>
              <Field label={`Clé API ${isEdit && hasApiKey ? '(laisser vide pour ne pas changer)' : '*'}`}>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    required={!isEdit || !hasApiKey}
                    value={provider.apiConfig.apiKey}
                    onChange={e => update('apiConfig.apiKey', e.target.value)}
                    className="input pr-10"
                    placeholder={isEdit && hasApiKey ? '••••••••••••••••' : ''}
                  />
                  <button type="button" onClick={() => setShowApiKey(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              {provider.apiConfig.authType === 'api_key' && (
                <Field label="Nom de l'en-tête d'auth">
                  <input value={provider.apiConfig.authHeader} onChange={e => update('apiConfig.authHeader', e.target.value)}
                    className="input" placeholder="Authorization ou X-API-Key" />
                </Field>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Format des requêtes">
                  <select value={provider.apiConfig.requestFormat} onChange={e => update('apiConfig.requestFormat', e.target.value)} className="input">
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="form-data">Form-data</option>
                  </select>
                </Field>
                <Field label="Méthode HTTP">
                  <select value={provider.apiConfig.httpMethod} onChange={e => update('apiConfig.httpMethod', e.target.value)} className="input">
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                  </select>
                </Field>
              </div>
              <Field label="Endpoint création de commande *">
                <input required value={provider.apiConfig.orderEndpoint} onChange={e => update('apiConfig.orderEndpoint', e.target.value)}
                  className="input" placeholder="/order/create" />
                <p className="text-xs text-gray-400 mt-1 break-all">
                  URL complète : {provider.apiConfig.baseUrl}{provider.apiConfig.orderEndpoint}
                </p>
              </Field>
              <Field label="Endpoint vérification de statut">
                <input value={provider.apiConfig.statusEndpoint} onChange={e => update('apiConfig.statusEndpoint', e.target.value)}
                  className="input" placeholder="/order/status/{order_id}" />
                <p className="text-xs text-gray-400 mt-1">{'{order_id}'} sera remplacé automatiquement par l'ID de la commande.</p>
              </Field>

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
            </div>
          )}

          {/* Onglet 3 — Mode de suivi */}
          {tab === 2 && (
            <div className="space-y-5">
              <Field label="Mode de suivi *">
                <SegmentedControl
                  value={trackingMode}
                  onChange={v => update('trackingConfig.mode', v)}
                  options={[{ value: 'webhook', label: 'Webhook' }, { value: 'polling', label: 'Polling' }, { value: 'both', label: 'Les deux' }]}
                />
              </Field>

              {showWebhookFields && (
                <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <Field label="URL webhook (à configurer chez le fournisseur)">
                    <div className="flex gap-2">
                      <input readOnly value={webhookUrl} className="input font-mono text-xs bg-gray-100 dark:bg-slate-900" />
                      <button type="button" onClick={() => navigator.clipboard?.writeText(webhookUrl)}
                        className="px-3 rounded-lg border border-gray-300 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </Field>
                  <Field label="Secret webhook">
                    <input value={provider.trackingConfig.webhookSecret} onChange={e => update('trackingConfig.webhookSecret', e.target.value)}
                      className="input" placeholder="Fourni par le fournisseur" />
                  </Field>
                </div>
              )}

              {showPollingFields && (
                <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <Field label="Intervalle de vérification (minutes) *">
                    <input type="number" min={1} required value={provider.trackingConfig.pollingIntervalMinutes}
                      onChange={e => update('trackingConfig.pollingIntervalMinutes', Number(e.target.value))} className="input" />
                  </Field>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Champ ID commande">
                  <input value={provider.trackingConfig.orderIdField} onChange={e => update('trackingConfig.orderIdField', e.target.value)} className="input" placeholder="order_id" />
                </Field>
                <Field label="Champ statut">
                  <input value={provider.trackingConfig.statusField} onChange={e => update('trackingConfig.statusField', e.target.value)} className="input" placeholder="status" />
                </Field>
                <Field label="Champ résultat">
                  <input value={provider.trackingConfig.resultField} onChange={e => update('trackingConfig.resultField', e.target.value)} className="input" placeholder="unlock_code" />
                </Field>
              </div>
            </div>
          )}

          {/* Onglet 4 — Mapping des champs */}
          {tab === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Traduit les champs de votre site vers les champs attendus par le fournisseur.</p>
              <div className="space-y-2">
                {provider.fieldMapping.map((f, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                    <select value={f.siteField} onChange={e => setFieldMapping(i, 'siteField', e.target.value)} className="input w-full sm:w-40">
                      {SITE_FIELDS.map(sf => <option key={sf} value={sf}>{sf}</option>)}
                    </select>
                    <span className="hidden sm:inline text-gray-400">→</span>
                    <input value={f.providerField} onChange={e => setFieldMapping(i, 'providerField', e.target.value)}
                      placeholder="champ_fournisseur" className="input flex-1 min-w-[140px]" />
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                      <input type="checkbox" checked={f.required} onChange={e => setFieldMapping(i, 'required', e.target.checked)} /> Requis
                    </label>
                    <input value={f.defaultValue} onChange={e => setFieldMapping(i, 'defaultValue', e.target.value)}
                      placeholder="Défaut" className="input w-full sm:w-24" />
                    <button type="button" onClick={() => removeFieldMapping(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addFieldMapping}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                <Plus className="w-4 h-4" /> Ajouter un champ
              </button>
            </div>
          )}

          {/* Onglet 5 — Mapping des statuts + gestion des erreurs */}
          {tab === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Traduit les statuts renvoyés par le fournisseur vers les statuts affichés sur votre site.</p>
                <div className="space-y-2">
                  {provider.statusMapping.map((s, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                      <input value={s.providerStatus} onChange={e => setStatusMapping(i, 'providerStatus', e.target.value)}
                        placeholder="completed" className="input w-full sm:w-40" />
                      <span className="hidden sm:inline text-gray-400">→</span>
                      <select value={s.siteStatus} onChange={e => setStatusMapping(i, 'siteStatus', e.target.value)} className="input flex-1 min-w-[140px]">
                        {SITE_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                      <button type="button" onClick={() => removeStatusMapping(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addStatusMapping}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <Plus className="w-4 h-4" /> Ajouter un statut
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Gestion des erreurs</h3>
                <Field label="Nombre maximum de tentatives">
                  <input type="number" min={0} value={provider.retryConfig.maxRetries}
                    onChange={e => update('retryConfig.maxRetries', Number(e.target.value))} className="input w-32" />
                </Field>
                <Field label="Délais entre tentatives (secondes)">
                  <div className="flex gap-2">
                    {provider.retryConfig.retryDelays.map((d, i) => (
                      <input key={i} type="number" min={0} value={d} onChange={e => setRetryDelay(i, e.target.value)} className="input w-24" />
                    ))}
                  </div>
                </Field>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input type="checkbox" checked={provider.retryConfig.autoRefundOnFailure}
                    onChange={e => update('retryConfig.autoRefundOnFailure', e.target.checked)} />
                  Rembourser automatiquement si échec définitif
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button type="button" onClick={() => navigate('/admin/providers')}
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer le fournisseur'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.55rem 0.75rem;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus { outline: none; box-shadow: 0 0 0 2px rgb(59 130 246); }
        html.dark .input { background: rgb(15 23 42); border-color: rgba(255,255,255,0.1); color: white; }
      `}</style>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label>
    {children}
  </div>
);

const SegmentedControl = ({ value, onChange, options }) => (
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

export default ProviderForm;

// src/pages/admin/AdminOrderDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Calendar, Euro, CheckCircle,
  AlertCircle, Save, Loader, Copy, User, Mail, CreditCard,
  Shield, Tag, Clock, Hash, FileText, Plus, Trash2
} from 'lucide-react';
import adminService from '../../services/adminService';

const formatDate = (d) => d ? new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
}).format(new Date(d)) : '—';

// 🔁 Remplacement du symbole par FG (design uniquement)
const formatCurrency = (v) =>
  `${new Intl.NumberFormat('fr-FR').format(v || 0)} Fg`;

// ✅ Statuts du modèle Order (pending/processing/completed)
const STATUS_OPTIONS = [
  { value: 'pending',    label: '⏳ En attente',  badge: 'bg-blue-100 text-blue-700' },
  { value: 'processing', label: '🔄 En cours',    badge: 'bg-yellow-100 text-yellow-700' },
  { value: 'completed',  label: '✅ Terminé',      badge: 'bg-green-100 text-green-700' },
  // Anciens statuts français (compatibilité)
  { value: 'En attente', label: '⏳ En attente',  badge: 'bg-blue-100 text-blue-700' },
  { value: 'En cours',   label: '🔄 En cours',    badge: 'bg-yellow-100 text-yellow-700' },
  { value: 'Terminé',    label: '✅ Terminé',      badge: 'bg-green-100 text-green-700' },
  { value: 'Annulé',     label: '❌ Annulé',       badge: 'bg-red-100 text-red-700' },
];

const getBadge = (status) => {
  const s = STATUS_OPTIONS.find(o => o.value === status);
  return s?.badge || 'bg-gray-100 text-gray-700';
};

const getLabel = (status) => {
  const s = STATUS_OPTIONS.find(o => o.value === status);
  return s?.label || status;
};

// Labels lisibles pour les champs soumis
const FIELD_LABELS = {
  imei: 'Numéro IMEI',
  serialNumber: 'Numéro de série (SN)',
  imageUrl: 'Lien image',
  username: "Nom d'utilisateur",
  email: 'Email (logiciel)',
  quantity: 'Quantité',
  duration: 'Durée',
  notes: 'Notes',
  remoteType: 'Outil remote',
  remoteId: 'ID de connexion',
};

const AdminOrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('pending');
  const [deliveryData, setDeliveryData] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!orderId) return;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminService.getOrderById(orderId);
        const data = res.data?.data || res.data;
        setOrder(data);
        setNewStatus(data?.status || 'pending');
        // deliveryData est un Map MongoDB → convertir en objet JS
        const dd = data?.deliveryData;
        setDeliveryData(dd instanceof Map ? Object.fromEntries(dd) : (dd || {}));
        setAdminNotes(data?.adminNotes || '');
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les détails de la commande.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(String(text));
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const addDeliveryField = () => {
    const key = prompt('Nom du champ (ex: licenseKey, accessCode, password):');
    if (key?.trim()) setDeliveryData(p => ({ ...p, [key.trim()]: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg({ type: '', text: '' });
    try {
      const res = await adminService.updateOrder(orderId, {
        status: newStatus,
        deliveryData,
        adminNotes,
      });
      const data = res.data?.data || res.data;
      setOrder(data);
      setSaveMsg({ type: 'success', text: '✅ Commande mise à jour avec succès !' });
    } catch {
      setSaveMsg({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="mt-4 text-gray-500">Chargement...</p>
    </div>
  );

  if (error || !order) return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 text-blue-500 mb-6">
        <ArrowLeft className="w-5 h-5" /> Retour
      </button>
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error || 'Commande non trouvée'}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white rounded-lg">
          Réessayer
        </button>
      </div>
    </div>
  );

  // ✅ Champs corrects : userId et serviceId (pas user/service)
  const client  = order.userId  || {};
  const service = order.serviceId || {};
  const fieldsRequired = service.fieldsRequired || [];

  // ✅ userSubmittedData est un Map MongoDB → convertir en objet
  const submitted = order.userSubmittedData instanceof Map
    ? Object.fromEntries(order.userSubmittedData)
    : (order.userSubmittedData || {});

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">

      {/* Retour */}
      <button onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition">
        <ArrowLeft className="w-5 h-5" /> Retour aux commandes
      </button>

      {/* Message */}
      {saveMsg.text && (
        <div className={`p-4 rounded-xl border ${saveMsg.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'}`}>
          {saveMsg.text}
        </div>
      )}

      {/* ── En-tête commande ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                {order.serviceDetails?.name || service.name || 'Service inconnu'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {order.serviceDetails?.category || service.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadge(order.status)}`}>
                  {getLabel(order.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500 mb-1">Référence</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                #{order._id?.slice(-8)}
              </span>
              <button onClick={() => copy(order._id, 'id')} className="text-gray-400 hover:text-blue-500">
                <Copy className="w-4 h-4" />
              </button>
              {copied === 'id' && <span className="text-xs text-green-500">Copié!</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <InfoBox icon={Calendar} label="Date"       value={formatDate(order.createdAt)} />
          <InfoBox icon={Euro}     label="Montant"    value={formatCurrency(order.serviceDetails?.price || order.amount)} color="text-green-600" />
          <InfoBox icon={Clock}    label="Délai"      value={service.deliveryTime || 'N/A'} />
          <InfoBox icon={Tag}      label="Catégorie"  value={order.serviceDetails?.category || service.category || 'N/A'} />
        </div>
      </div>

      {/* ── Informations du client ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" /> Informations du client
        </h2>

        {client._id ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClientField icon={User}       label="Nom"          value={client.name} />
            <ClientField icon={Mail}       label="Email"        value={client.email}
              copyKey="email" onCopy={copy} copied={copied} />
            <ClientField icon={CreditCard} label="Solde"        value={formatCurrency(client.balance)} />
            <ClientField icon={Shield}     label="Rôle"         value={client.role} />
            <ClientField icon={Calendar}   label="Membre depuis" value={formatDate(client.createdAt)} />
            <ClientField icon={Hash}       label="ID Client"    value={client._id}
              mono copyKey="uid" onCopy={copy} copied={copied} />
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ Informations client non disponibles — la commande a peut-être été créée 
              avant la mise à jour du système.
            </p>
            {order.userId && (
              <p className="text-xs text-yellow-600 mt-1 font-mono break-all">
                ID stocké : {order.userId?.toString?.() || String(order.userId)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Données soumises par le client ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" /> Données soumises par le client
        </h2>

        {Object.keys(submitted).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(submitted).map(([key, value]) => {
              const fieldDef = fieldsRequired.find(f => f.name === key);
              const label = fieldDef?.label || FIELD_LABELS[key] || key;
              return (
                <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
                    {label}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
                      {String(value)}
                    </p>
                    <button onClick={() => copy(String(value), key)}
                      className="text-gray-400 hover:text-blue-500 flex-shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied === key && <span className="text-xs text-green-500">Copié!</span>}
                  {fieldDef?.helpText && (
                    <p className="text-xs text-gray-400 mt-1">{fieldDef.helpText}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Aucune donnée soumise par le client pour cette commande.
          </p>
        )}
      </div>

      {/* ── Traitement ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" /> Traitement de la commande
        </h2>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Statut
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="pending">⏳ En attente</option>
            <option value="processing">🔄 En cours</option>
            <option value="completed">✅ Terminé</option>
            <option value="En attente">⏳ En attente (ancien)</option>
            <option value="En cours">🔄 En cours (ancien)</option>
            <option value="Terminé">✅ Terminé (ancien)</option>
            <option value="Annulé">❌ Annulé</option>
          </select>
        </div>

        {/* Données de livraison */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Données de livraison
            </label>
            <button onClick={addDeliveryField}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200">
              <Plus className="w-4 h-4" /> Ajouter un champ
            </button>
          </div>

          {Object.keys(deliveryData).length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Aucune donnée de livraison. Cliquez sur "Ajouter un champ".
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(deliveryData).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="w-full sm:w-36 text-xs font-medium text-gray-500 uppercase flex-shrink-0 break-words">
                    {key}
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setDeliveryData(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={`Valeur pour ${key}`}
                    className="flex-1 w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setDeliveryData(p => { const n = { ...p }; delete n[key]; return n; })}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0 self-end sm:self-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes admin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes internes (admin)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Notes visibles uniquement par les admins..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium">
          {saving
            ? <><Loader className="w-5 h-5 animate-spin" /> Enregistrement...</>
            : <><Save className="w-5 h-5" /> Enregistrer les modifications</>}
        </button>
      </div>
    </div>
  );
};

const InfoBox = ({ icon: Icon, label, value, color = 'text-gray-900' }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className={`text-sm font-bold ${color} dark:text-white break-words`}>{value}</span>
    </div>
  </div>
);

const ClientField = ({ icon: Icon, label, value, mono = false, copyKey, onCopy, copied }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-medium text-gray-900 dark:text-white break-all ${mono ? 'font-mono text-xs' : ''}`}>
          {value || '—'}
        </p>
        {copyKey && value && (
          <button onClick={() => onCopy(value, copyKey)} className="text-gray-400 hover:text-blue-500 flex-shrink-0">
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {copied === copyKey && <span className="text-xs text-green-500">Copié!</span>}
    </div>
  </div>
);

export default AdminOrderDetailsPage;



// // src/pages/admin/AdminOrderDetailsPage.jsx
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   ArrowLeft, Package, Calendar, Euro, CheckCircle,
//   AlertCircle, Save, Loader, Copy, User, Mail, CreditCard,
//   Shield, Tag, Clock, Hash, FileText, Plus, Trash2
// } from 'lucide-react';
// import adminService from '../../services/adminService';

// const formatDate = (d) => d ? new Intl.DateTimeFormat('fr-FR', {
//   day: '2-digit', month: '2-digit', year: 'numeric',
//   hour: '2-digit', minute: '2-digit'
// }).format(new Date(d)) : '—';

// const formatCurrency = (v) =>
//   new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0);

// // ✅ Statuts du modèle Order (pending/processing/completed)
// const STATUS_OPTIONS = [
//   { value: 'pending',    label: '⏳ En attente',  badge: 'bg-blue-100 text-blue-700' },
//   { value: 'processing', label: '🔄 En cours',    badge: 'bg-yellow-100 text-yellow-700' },
//   { value: 'completed',  label: '✅ Terminé',      badge: 'bg-green-100 text-green-700' },
//   // Anciens statuts français (compatibilité)
//   { value: 'En attente', label: '⏳ En attente',  badge: 'bg-blue-100 text-blue-700' },
//   { value: 'En cours',   label: '🔄 En cours',    badge: 'bg-yellow-100 text-yellow-700' },
//   { value: 'Terminé',    label: '✅ Terminé',      badge: 'bg-green-100 text-green-700' },
//   { value: 'Annulé',     label: '❌ Annulé',       badge: 'bg-red-100 text-red-700' },
// ];

// const getBadge = (status) => {
//   const s = STATUS_OPTIONS.find(o => o.value === status);
//   return s?.badge || 'bg-gray-100 text-gray-700';
// };

// const getLabel = (status) => {
//   const s = STATUS_OPTIONS.find(o => o.value === status);
//   return s?.label || status;
// };

// // Labels lisibles pour les champs soumis
// const FIELD_LABELS = {
//   imei: 'Numéro IMEI',
//   serialNumber: 'Numéro de série (SN)',
//   imageUrl: 'Lien image',
//   username: "Nom d'utilisateur",
//   email: 'Email (logiciel)',
//   quantity: 'Quantité',
//   duration: 'Durée',
//   notes: 'Notes',
//   remoteType: 'Outil remote',
//   remoteId: 'ID de connexion',
// };

// const AdminOrderDetailsPage = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [newStatus, setNewStatus] = useState('pending');
//   const [deliveryData, setDeliveryData] = useState({});
//   const [adminNotes, setAdminNotes] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
//   const [copied, setCopied] = useState('');

//   useEffect(() => {
//     if (!orderId) return;
//     const fetch = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const res = await adminService.getOrderById(orderId);
//         const data = res.data?.data || res.data;
//         setOrder(data);
//         setNewStatus(data?.status || 'pending');
//         // deliveryData est un Map MongoDB → convertir en objet JS
//         const dd = data?.deliveryData;
//         setDeliveryData(dd instanceof Map ? Object.fromEntries(dd) : (dd || {}));
//         setAdminNotes(data?.adminNotes || '');
//       } catch (err) {
//         console.error('Erreur:', err);
//         setError('Impossible de charger les détails de la commande.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, [orderId]);

//   const copy = (text, key) => {
//     navigator.clipboard.writeText(String(text));
//     setCopied(key);
//     setTimeout(() => setCopied(''), 2000);
//   };

//   const addDeliveryField = () => {
//     const key = prompt('Nom du champ (ex: licenseKey, accessCode, password):');
//     if (key?.trim()) setDeliveryData(p => ({ ...p, [key.trim()]: '' }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSaveMsg({ type: '', text: '' });
//     try {
//       const res = await adminService.updateOrder(orderId, {
//         status: newStatus,
//         deliveryData,
//         adminNotes,
//       });
//       const data = res.data?.data || res.data;
//       setOrder(data);
//       setSaveMsg({ type: 'success', text: '✅ Commande mise à jour avec succès !' });
//     } catch {
//       setSaveMsg({ type: 'error', text: 'Erreur lors de la mise à jour.' });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center py-20">
//       <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
//       <p className="mt-4 text-gray-500">Chargement...</p>
//     </div>
//   );

//   if (error || !order) return (
//     <div className="max-w-4xl mx-auto p-6">
//       <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 text-blue-500 mb-6">
//         <ArrowLeft className="w-5 h-5" /> Retour
//       </button>
//       <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
//         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//         <p className="text-red-600 mb-4">{error || 'Commande non trouvée'}</p>
//         <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white rounded-lg">
//           Réessayer
//         </button>
//       </div>
//     </div>
//   );

//   // ✅ Champs corrects : userId et serviceId (pas user/service)
//   const client  = order.userId  || {};
//   const service = order.serviceId || {};
//   const fieldsRequired = service.fieldsRequired || [];

//   // ✅ userSubmittedData est un Map MongoDB → convertir en objet
//   const submitted = order.userSubmittedData instanceof Map
//     ? Object.fromEntries(order.userSubmittedData)
//     : (order.userSubmittedData || {});

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6">

//       {/* Retour */}
//       <button onClick={() => navigate('/admin/orders')}
//         className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition">
//         <ArrowLeft className="w-5 h-5" /> Retour aux commandes
//       </button>

//       {/* Message */}
//       {saveMsg.text && (
//         <div className={`p-4 rounded-xl border ${saveMsg.type === 'success'
//           ? 'bg-green-50 border-green-200 text-green-700'
//           : 'bg-red-50 border-red-200 text-red-700'}`}>
//           {saveMsg.text}
//         </div>
//       )}

//       {/* ── En-tête commande ── */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <div className="flex items-center gap-4">
//             <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
//               <Package className="w-7 h-7 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 {order.serviceDetails?.name || service.name || 'Service inconnu'}
//               </h1>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="text-sm text-gray-500">
//                   {order.serviceDetails?.category || service.category}
//                 </span>
//                 <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadge(order.status)}`}>
//                   {getLabel(order.status)}
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-xs text-gray-500 mb-1">Référence</p>
//             <div className="flex items-center gap-2 justify-end">
//               <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
//                 #{order._id?.slice(-8)}
//               </span>
//               <button onClick={() => copy(order._id, 'id')} className="text-gray-400 hover:text-blue-500">
//                 <Copy className="w-4 h-4" />
//               </button>
//               {copied === 'id' && <span className="text-xs text-green-500">Copié!</span>}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <InfoBox icon={Calendar} label="Date"       value={formatDate(order.createdAt)} />
//           <InfoBox icon={Euro}     label="Montant"    value={formatCurrency(order.serviceDetails?.price || order.amount)} color="text-green-600" />
//           <InfoBox icon={Clock}    label="Délai"      value={service.deliveryTime || 'N/A'} />
//           <InfoBox icon={Tag}      label="Catégorie"  value={order.serviceDetails?.category || service.category || 'N/A'} />
//         </div>
//       </div>

//       {/* ── Informations du client ── */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
//         <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//           <User className="w-5 h-5 text-blue-500" /> Informations du client
//         </h2>

//         {client._id ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <ClientField icon={User}       label="Nom"          value={client.name} />
//             <ClientField icon={Mail}       label="Email"        value={client.email}
//               copyKey="email" onCopy={copy} copied={copied} />
//             <ClientField icon={CreditCard} label="Solde"        value={formatCurrency(client.balance)} />
//             <ClientField icon={Shield}     label="Rôle"         value={client.role} />
//             <ClientField icon={Calendar}   label="Membre depuis" value={formatDate(client.createdAt)} />
//             <ClientField icon={Hash}       label="ID Client"    value={client._id}
//               mono copyKey="uid" onCopy={copy} copied={copied} />
//           </div>
//         ) : (
//           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <p className="text-sm text-yellow-700">
//               ⚠️ Informations client non disponibles — la commande a peut-être été créée 
//               avant la mise à jour du système.
//             </p>
//             {order.userId && (
//               <p className="text-xs text-yellow-600 mt-1 font-mono">
//                 ID stocké : {order.userId?.toString?.() || String(order.userId)}
//               </p>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Données soumises par le client ── */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
//         <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//           <FileText className="w-5 h-5 text-purple-500" /> Données soumises par le client
//         </h2>

//         {Object.keys(submitted).length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {Object.entries(submitted).map(([key, value]) => {
//               const fieldDef = fieldsRequired.find(f => f.name === key);
//               const label = fieldDef?.label || FIELD_LABELS[key] || key;
//               return (
//                 <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
//                     {label}
//                   </p>
//                   <div className="flex items-center justify-between gap-2">
//                     <p className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
//                       {String(value)}
//                     </p>
//                     <button onClick={() => copy(String(value), key)}
//                       className="text-gray-400 hover:text-blue-500 flex-shrink-0">
//                       <Copy className="w-4 h-4" />
//                     </button>
//                   </div>
//                   {copied === key && <span className="text-xs text-green-500">Copié!</span>}
//                   {fieldDef?.helpText && (
//                     <p className="text-xs text-gray-400 mt-1">{fieldDef.helpText}</p>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500 italic">
//             Aucune donnée soumise par le client pour cette commande.
//           </p>
//         )}
//       </div>

//       {/* ── Traitement ── */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 space-y-6">
//         <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
//           <CheckCircle className="w-5 h-5 text-green-500" /> Traitement de la commande
//         </h2>

//         {/* Statut */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//             Statut
//           </label>
//           <select
//             value={newStatus}
//             onChange={(e) => setNewStatus(e.target.value)}
//             className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
//           >
//             <option value="pending">⏳ En attente</option>
//             <option value="processing">🔄 En cours</option>
//             <option value="completed">✅ Terminé</option>
//             <option value="En attente">⏳ En attente (ancien)</option>
//             <option value="En cours">🔄 En cours (ancien)</option>
//             <option value="Terminé">✅ Terminé (ancien)</option>
//             <option value="Annulé">❌ Annulé</option>
//           </select>
//         </div>

//         {/* Données de livraison */}
//         <div>
//           <div className="flex items-center justify-between mb-3">
//             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//               Données de livraison
//             </label>
//             <button onClick={addDeliveryField}
//               className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200">
//               <Plus className="w-4 h-4" /> Ajouter un champ
//             </button>
//           </div>

//           {Object.keys(deliveryData).length === 0 ? (
//             <p className="text-sm text-gray-500 italic">
//               Aucune donnée de livraison. Cliquez sur "Ajouter un champ".
//             </p>
//           ) : (
//             <div className="space-y-3">
//               {Object.entries(deliveryData).map(([key, value]) => (
//                 <div key={key} className="flex gap-3 items-center">
//                   <span className="w-36 text-xs font-medium text-gray-500 uppercase flex-shrink-0">{key}</span>
//                   <input
//                     type="text"
//                     value={value}
//                     onChange={(e) => setDeliveryData(p => ({ ...p, [key]: e.target.value }))}
//                     placeholder={`Valeur pour ${key}`}
//                     className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                   <button
//                     onClick={() => setDeliveryData(p => { const n = { ...p }; delete n[key]; return n; })}
//                     className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Notes admin */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//             Notes internes (admin)
//           </label>
//           <textarea
//             value={adminNotes}
//             onChange={(e) => setAdminNotes(e.target.value)}
//             rows={3}
//             placeholder="Notes visibles uniquement par les admins..."
//             className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
//           />
//         </div>

//         <button onClick={handleSave} disabled={saving}
//           className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium">
//           {saving
//             ? <><Loader className="w-5 h-5 animate-spin" /> Enregistrement...</>
//             : <><Save className="w-5 h-5" /> Enregistrer les modifications</>}
//         </button>
//       </div>
//     </div>
//   );
// };

// const InfoBox = ({ icon: Icon, label, value, color = 'text-gray-900' }) => (
//   <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
//     <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
//     <div className="flex items-center gap-2">
//       <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
//       <span className={`text-sm font-bold ${color} dark:text-white`}>{value}</span>
//     </div>
//   </div>
// );

// const ClientField = ({ icon: Icon, label, value, mono = false, copyKey, onCopy, copied }) => (
//   <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
//     <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
//       <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//     </div>
//     <div className="min-w-0 flex-1">
//       <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
//       <div className="flex items-center justify-between gap-2">
//         <p className={`text-sm font-medium text-gray-900 dark:text-white break-all ${mono ? 'font-mono text-xs' : ''}`}>
//           {value || '—'}
//         </p>
//         {copyKey && value && (
//           <button onClick={() => onCopy(value, copyKey)} className="text-gray-400 hover:text-blue-500 flex-shrink-0">
//             <Copy className="w-3.5 h-3.5" />
//           </button>
//         )}
//       </div>
//       {copied === copyKey && <span className="text-xs text-green-500">Copié!</span>}
//     </div>
//   </div>
// );

// export default AdminOrderDetailsPage;

// // src/pages/admin/AdminOrderDetailsPage.jsx
// // Page d'admin pour afficher les détails d'une commande et entrer les données de livraison

// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   ArrowLeft,
//   Package,
//   Calendar,
//   DollarSign,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   Save,
//   Loader,
//   Copy,
//   Send
// } from 'lucide-react';
// import orderService from '../../services/orderService';
// import { useAuth } from '../../hooks/useAuth';

// /**
//  * Page admin pour gérer les détails d'une commande.
//  * Permet de visualiser les informations de la commande,
//  * entrer les données de livraison, et changer le statut.
//  */
// const AdminOrderDetailsPage = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   // État pour la commande
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // État pour l'édition des données de livraison
//   const [deliveryData, setDeliveryData] = useState({});
//   const [newStatus, setNewStatus] = useState('pending');
//   const [saving, setSaving] = useState(false);
//   const [saveError, setSaveError] = useState('');
//   const [saveSuccess, setSaveSuccess] = useState('');
//   const [copied, setCopied] = useState(false);

//   // Récupère les détails de la commande
//   useEffect(() => {
//     const fetchOrder = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         // Utiliser l'endpoint admin pour accéder aux commandes
//         const response = await orderService.getAdminOrderById(orderId);
//         const orderData = response.data || response;
//         setOrder(orderData);
        
//         // Initialiser les données de livraison s'elles existent
//         if (orderData?.deliveryData) {
//           setDeliveryData(orderData.deliveryData);
//         }
        
//         // Initialiser le nouveau statut
//         setNewStatus(orderData?.status || 'pending');
//       } catch (err) {
//         console.error('❌ Erreur lors du chargement de la commande:', err);
//         setError('Impossible de charger les détails de la commande.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (orderId) {
//       fetchOrder();
//     }
//   }, [orderId]);

//   /**
//    * Formate une date pour l'affichage
//    */
//   const formatDate = (dateString) => {
//     if (!dateString) return '—';
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('fr-FR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }).format(date);
//   };

//   /**
//    * Formate un montant en euros
//    */
//   const formatPrice = (price) => {
//     if (!price && price !== 0) return '—';
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'EUR'
//     }).format(price);
//   };

//   /**
//    * Gère les changements dans les champs de livraison
//    */
//   const handleDeliveryFieldChange = (key, value) => {
//     setDeliveryData(prev => ({
//       ...prev,
//       [key]: value
//     }));
//   };

//   /**
//    * Ajoute un nouveau champ de livraison
//    */
//   const addDeliveryField = () => {
//     const fieldName = prompt('Nom du champ de livraison (ex: "licenseKey", "accessCode"):');
//     if (fieldName && fieldName.trim()) {
//       setDeliveryData(prev => ({
//         ...prev,
//         [fieldName.trim()]: ''
//       }));
//     }
//   };

//   /**
//    * Supprime un champ de livraison
//    */
//   const removeDeliveryField = (key) => {
//     setDeliveryData(prev => {
//       const updated = { ...prev };
//       delete updated[key];
//       return updated;
//     });
//   };

//   /**
//    * Enregistre les modifications de la commande
//    */
//   const handleSaveChanges = async () => {
//     if (!order) return;

//     setSaving(true);
//     saveError && setSaveError('');
//     setSaveSuccess('');

//     try {
//       // Mettre à jour le statut et les données de livraison
//       const updateData = {
//         status: newStatus,
//         deliveryData: deliveryData
//       };

//       await orderService.updateOrderStatus(orderId, updateData);

//       // Message de succès
//       setSaveSuccess('✅ Commande mise à jour avec succès !');

//       // Recharger les détails
//       setTimeout(() => {
//         const fetchUpdated = async () => {
//           const response = await orderService.getAdminOrderById(orderId);
//           setOrder(response.data || response);
//         };
//         fetchUpdated();
//       }, 1000);
//     } catch (err) {
//       console.error('❌ Erreur lors de la mise à jour:', err);
//       setSaveError('Erreur lors de la mise à jour. Réessayez.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   /**
//    * Copie le texte dans le presse-papiers
//    */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <div className="relative">
//           <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <Loader className="w-6 h-6 text-blue-500 animate-pulse" />
//           </div>
//         </div>
//         <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement de la commande...</p>
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <button
//           onClick={() => navigate('/admin/orders')}
//           className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Retour aux commandes
//         </button>

//         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Commande non trouvée'}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//           >
//             Réessayer
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Récupérer les informations
//   const serviceName = order?.serviceDetails?.name || 'Service inconnu';
//   const serviceCategory = order?.serviceDetails?.category || 'Inconnu';
//   const userSubmittedData = order?.userSubmittedData || {};
//   const userId = order?.userId;

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6">
//       {/* Bouton Retour */}
//       <button
//         onClick={() => navigate('/admin/orders')}
//         className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
//       >
//         <ArrowLeft className="w-5 h-5" />
//         Retour aux commandes
//       </button>

//       {/* Messages de succès/erreur */}
//       {saveSuccess && (
//         <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
//           <p className="text-green-700 dark:text-green-400">{saveSuccess}</p>
//         </div>
//       )}
//       {saveError && (
//         <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
//           <p className="text-red-700 dark:text-red-400">{saveError}</p>
//         </div>
//       )}

//       {/* En-tête avec informations principales */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
//               <Package className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//                 {serviceName}
//               </h1>
//               <p className="text-gray-500 dark:text-gray-400">
//                 Catégorie: {serviceCategory}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Grille d'informations */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {/* Numéro de commande */}
//           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
//             <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Numéro</p>
//             <div className="flex items-center gap-2">
//               <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
//                 #{order._id?.slice(-8)}
//               </span>
//               <button
//                 onClick={() => copyToClipboard(order._id)}
//                 className="p-1 text-gray-400 hover:text-blue-500"
//               >
//                 <Copy className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Date */}
//           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
//             <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Date</p>
//             <div className="flex items-center gap-2">
//               <Calendar className="w-4 h-4 text-gray-400" />
//               <span className="text-sm font-bold text-gray-900 dark:text-white">
//                 {formatDate(order?.createdAt)}
//               </span>
//             </div>
//           </div>

//           {/* Montant */}
//           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
//             <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Montant</p>
//             <div className="flex items-center gap-2">
//               <DollarSign className="w-4 h-4 text-green-500" />
//               <span className="text-sm font-bold text-green-600 dark:text-green-400">
//                 {formatPrice(order?.amount)}
//               </span>
//             </div>
//           </div>

//           {/* Client */}
//           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
//             <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Client</p>
//             <div className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
//               {userId?.slice(-8) || '—'}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Données soumises par l'utilisateur (lecture seule) */}
//       {Object.keys(userSubmittedData).length > 0 && (
//         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
//             Données soumises par le client
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {Object.entries(userSubmittedData).map(([key, value]) => (
//               <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase">
//                   {key.replace(/([A-Z])/g, ' $1').trim()}
//                 </p>
//                 <p className="text-lg font-mono font-bold text-gray-900 dark:text-white break-all">
//                   {String(value)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Formulaire pour les données de livraison et le statut */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
//         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
//           Traitement de la commande
//         </h2>

//         <div className="space-y-6">
//           {/* Sélection du statut */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Statut de la commande
//             </label>
//             <select
//               value={newStatus}
//               onChange={(e) => setNewStatus(e.target.value)}
//               className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
//             >
//               <option value="pending">⏳ En attente</option>
//               <option value="processing">🔄 En cours</option>
//               <option value="completed">✅ Terminé</option>
//             </select>
//           </div>

//           {/* Données de livraison */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Données de livraison
//               </label>
//               <button
//                 onClick={addDeliveryField}
//                 className="text-xl text-blue-500 hover:text-blue-600"
//                 title="Ajouter un champ"
//               >
//                 +
//               </button>
//             </div>

//             <div className="space-y-3">
//               {Object.keys(deliveryData).length > 0 ? (
//                 Object.entries(deliveryData).map(([key, value]) => (
//                   <div key={key} className="flex gap-3">
//                     <input
//                       type="text"
//                       value={value}
//                       onChange={(e) => handleDeliveryFieldChange(key, e.target.value)}
//                       placeholder={key}
//                       className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
//                     />
//                     <button
//                       onClick={() => removeDeliveryField(key)}
//                       className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Aucune donnée de livraison. Cliquez sur + pour ajouter des champs.
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Bouton d'enregistrement */}
//           <button
//             onClick={handleSaveChanges}
//             disabled={saving}
//             className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
//           >
//             {saving ? (
//               <>
//                 <Loader className="w-5 h-5 animate-spin" />
//                 Enregistrement...
//               </>
//             ) : (
//               <>
//                 <Save className="w-5 h-5" />
//                 Enregistrer les modifications
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Informations utiles */}
//       <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
//         <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
//           <AlertCircle className="w-5 h-5 text-blue-600" />
//           Conseils
//         </h3>
//         <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
//           <li>• Entrez les données de livraison (clés de licence, codes d'accès, etc.).</li>
//           <li>• Changez le statut en "Terminé" lorsque la commande est traitée.</li>
//           <li>• Le client recevra une notification une fois la commande finalisée.</li>
//           <li>• Vous pouvez ajouter autant de champs que nécessaire avec le bouton +.</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default AdminOrderDetailsPage;

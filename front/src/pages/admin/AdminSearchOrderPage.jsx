// src/pages/admin/AdminSearchOrderPage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Search, Package, User, Calendar, CreditCard,
  Copy, Eye, Download, AlertCircle, CheckCircle,
  Clock, XCircle, Hash, Mail, Smartphone, Key, Server, Globe
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminSearchOrderPage = () => {
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [searchType, setSearchType]   = useState('code');

  const { register, handleSubmit, watch } = useForm({ defaultValues: { searchTerm: '' } });

  // ─── Types de recherche ───────────────────────────────────────────────────
  const searchTypes = [
    { value: 'code',        label: 'ID Commande',    icon: Hash,       placeholder: 'ex: 6a47012dc60316f57b24d18d' },
    { value: 'transaction', label: 'ID Transaction',  icon: CreditCard, placeholder: 'ex: TXN-123456-ABC' },
    { value: 'email',       label: 'Email client',    icon: Mail,       placeholder: 'ex: client@email.com' },
    { value: 'imei',        label: 'Numéro IMEI',     icon: Smartphone, placeholder: 'ex: 123456789012345' },
  ];

  // ─── Formatage ────────────────────────────────────────────────────────────
  const fmtDate = (d) => d
    ? new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : '—';

  const fmtPrice = (n) =>
    (n !== undefined && n !== null)
      ? `${new Intl.NumberFormat('fr-FR').format(n)} FG`
      : '—';

  // ─── Badge statut ─────────────────────────────────────────────────────────
  const statusMap = {
    'En cours':   { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock,         label: 'En cours' },
    'Terminé':    { bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle,   label: 'Terminé' },
    'Annulé':     { bg: 'bg-red-100',    text: 'text-red-800',    icon: XCircle,       label: 'Annulé' },
    'Remboursé':  { bg: 'bg-purple-100', text: 'text-purple-800', icon: CheckCircle,   label: 'Remboursé' },
    'pending':    { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: Clock,         label: 'En attente' },
    'processing': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock,         label: 'En cours' },
    'completed':  { bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle,   label: 'Terminé' },
  };

  const getStatusBadge = (status) => {
    const c = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: status || '—' };
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {c.label}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = { IMEI: Smartphone, Server: Server, Rental: Globe, Credit: Key };
    const Icon = icons[category] || Package;
    return <Icon className="w-5 h-5" />;
  };

  // ─── Copier dans le presse-papier ─────────────────────────────────────────
  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copié !');
  };

  // ─── Recherche ────────────────────────────────────────────────────────────
  const searchOrder = async ({ type, term }) => {
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      let response;
      switch (type) {
        case 'code':        response = await adminService.getOrderByCode(term);        break;
        case 'transaction': response = await adminService.getOrderByTransaction(term); break;
        case 'email':       response = await adminService.getOrdersByEmail(term);      break;
        case 'imei':        response = await adminService.getOrderByIMEI(term);        break;
        default:            response = await adminService.getOrderByCode(term);
      }

      const data = response.data?.data ?? response.data;

      // Recherche par email → peut retourner un tableau
      if (Array.isArray(data)) {
        if (data.length === 0) {
          setError('Aucune commande trouvée');
          toast.warning('Aucune commande trouvée');
          return;
        }
        if (data.length > 1) {
          setOrder({ multiple: true, orders: data });
          toast.info(`${data.length} commandes trouvées`);
          return;
        }
        setOrder(data[0]);
      } else {
        setOrder(data);
      }

      toast.success('Commande trouvée !');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Commande non trouvée';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const term = data.searchTerm?.trim();
    if (!term) { setError('Veuillez entrer un terme de recherche'); return; }

    if (searchType === 'imei' && !/^[0-9]{15}$/.test(term)) {
      setError("L'IMEI doit contenir exactement 15 chiffres"); return;
    }
    if (searchType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(term)) {
      setError('Format d\'email invalide'); return;
    }

    await searchOrder({ type: searchType, term });
  };

  // ─── Extraire les données d'un ordre ─────────────────────────────────────
  // ✅ La réponse backend utilise userId et serviceId (populate Mongoose)
  const getClient  = (o) => o?.userId  || {};
  const getService = (o) => o?.serviceId || {};

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Rechercher une commande
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Recherchez par ID, transaction, email client ou numéro IMEI
        </p>
      </div>

      {/* Formulaire */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700 mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Types */}
          <div className="flex flex-wrap gap-2">
            {searchTypes.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setSearchType(value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  searchType === value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Champ + bouton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" {...register('searchTerm', { required: true })}
                placeholder={searchTypes.find(t => t.value === searchType)?.placeholder}
                className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-medium flex items-center justify-center gap-2 min-w-[120px]">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Recherche...</>
                : <><Search className="w-4 h-4" /> Rechercher</>
              }
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Résultats multiples (email) */}
      {order?.multiple && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {order.orders.length} commande(s) trouvée(s)
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.orders.map((o) => (
              <div key={o._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{o._id}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {o.serviceDetails?.name || o.serviceId?.name} — {fmtPrice(o.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(o.status)}
                    <button onClick={() => setOrder(o)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultat unique */}
      {order && !order.multiple && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Commande</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                  {order._id}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* Infos générales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoBox label="ID Commande" value={order._id} mono onCopy={() => handleCopy(order._id, 'id')} copied={copiedField === 'id'} />
              <InfoBox label="Transaction"  value={order.transactionId || '—'} mono onCopy={order.transactionId ? () => handleCopy(order.transactionId, 'txn') : null} copied={copiedField === 'txn'} />
              <InfoBox label="Date"         value={fmtDate(order.createdAt)} />
            </div>

            {/* Client — ✅ order.userId (populate Mongoose) */}
            <Section title="Client" icon={<User className="w-4 h-4 text-blue-500" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoBox label="Nom"   value={getClient(order).name  || '—'} />
                <InfoBox label="Email" value={getClient(order).email || '—'}
                  onCopy={getClient(order).email ? () => handleCopy(getClient(order).email, 'email') : null}
                  copied={copiedField === 'email'} />
              </div>
            </Section>

            {/* Service — ✅ order.serviceId (populate Mongoose) + order.serviceDetails (snapshot) */}
            <Section title="Service" icon={getCategoryIcon(order.serviceDetails?.category || getService(order).category)}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InfoBox label="Nom"       value={order.serviceDetails?.name     || getService(order).name     || '—'} span />
                <InfoBox label="Catégorie" value={order.serviceDetails?.category || getService(order).category || '—'} />
                <InfoBox label="Prix"      value={fmtPrice(order.amount ?? order.serviceDetails?.price ?? getService(order).price)} />
              </div>
            </Section>

            {/* Données soumises */}
            {order.userSubmittedData && Object.keys(order.userSubmittedData).length > 0 && (
              <Section title="Informations fournies" icon={<Package className="w-4 h-4 text-purple-500" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(order.userSubmittedData).map(([key, value]) => {
                    const meta = order.userSubmittedDataMetadata?.find(m => m.name === key);
                    const label = meta?.label || key.replace(/([A-Z])/g, ' $1').trim();
                    return (
                      <InfoBox key={key} label={label} value={String(value) || '—'} mono
                        onCopy={value ? () => handleCopy(String(value), key) : null}
                        copied={copiedField === key} />
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Données de livraison */}
            {order.deliveryData && Object.keys(order.deliveryData).length > 0 && (
              <Section title="Données de livraison" icon={<CheckCircle className="w-4 h-4 text-green-500" />} accent="green">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(order.deliveryData).map(([key, value]) => (
                    <InfoBox key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={String(value)} mono
                      onCopy={() => handleCopy(String(value), key)} copied={copiedField === key} />
                  ))}
                </div>
              </Section>
            )}

            {/* Notes admin */}
            {order.adminNotes && (
              <Section title="Notes admin" icon={<Package className="w-4 h-4 text-orange-500" />}>
                <p className="text-sm text-gray-700 dark:text-gray-300">{order.adminNotes}</p>
              </Section>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `order-${order._id}.json`;
                a.click();
              }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Exporter JSON
              </button>
              <button onClick={() => { setOrder(null); setError(''); }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
                Nouvelle recherche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

const InfoBox = ({ label, value, mono, onCopy, copied, span }) => (
  <div className={`bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg ${span ? 'sm:col-span-2' : ''}`}>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <div className="flex items-center justify-between gap-2">
      <p className={`text-sm font-medium text-gray-900 dark:text-white break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
      {onCopy && (
        <button onClick={onCopy} className="p-1 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0">
          {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  </div>
);

const Section = ({ title, icon, children, accent }) => {
  const accents = {
    green: 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800',
  };
  return (
    <div className={`rounded-xl overflow-hidden ${accents[accent] || 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
        {icon}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default AdminSearchOrderPage;

// // src/pages/admin/AdminSearchOrderPage.jsx
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'react-toastify';
// import { 
//   Search, 
//   Package, 
//   User, 
//   Calendar, 
//   CreditCard,
//   Copy,
//   Eye,
//   Download,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   XCircle,
//   Hash,
//   Mail,
//   Smartphone,
//   Key,
//   Server,
//   Globe
// } from 'lucide-react';
// import adminService from '../../services/adminService';

// const AdminSearchOrderPage = () => {
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [copiedField, setCopiedField] = useState(null);
//   const [searchType, setSearchType] = useState('code'); // code, id, transaction, email, imei
  
//   const { register, handleSubmit, watch } = useForm({
//     defaultValues: {
//       searchTerm: ''
//     }
//   });

//   const searchTerm = watch('searchTerm');

//   // Configuration des types de recherche
//   const searchTypes = [
//     { value: 'code', label: 'Code commande', icon: Hash, placeholder: 'ex: ORD-123456-ABC' },
//     { value: 'id', label: 'ID MongoDB', icon: Package, placeholder: 'ex: 60d21b4667d0d8992e610c85' },
//     { value: 'transaction', label: 'ID Transaction', icon: CreditCard, placeholder: 'ex: TXN-123456-ABC' },
//     { value: 'email', label: 'Email client', icon: Mail, placeholder: 'ex: client@email.com' },
//     { value: 'imei', label: 'Numéro IMEI', icon: Smartphone, placeholder: 'ex: 123456789012345' }
//   ];

//   // Fonction de recherche unifiée
//   const searchOrder = async (searchParams) => {
//     setLoading(true);
//     setError('');
//     setOrder(null);
    
//     try {
//       let response;
      
//       // Selon le type de recherche, appeler la bonne méthode
//       switch(searchParams.type) {
//         case 'code':
//           response = await adminService.getOrderByCode(searchParams.term);
//           break;
//         case 'id':
//           response = await adminService.getOrderById(searchParams.term);
//           break;
//         case 'transaction':
//           response = await adminService.getOrderByTransaction(searchParams.term);
//           break;
//         case 'email':
//           response = await adminService.getOrdersByEmail(searchParams.term);
//           if (response.data?.length > 1) {
//             // Si plusieurs commandes trouvées, on affiche la liste
//             setOrder({ multiple: true, orders: response.data });
//             toast.info(`${response.data.length} commandes trouvées pour cet email`);
//             setLoading(false);
//             return;
//           }
//           break;
//         case 'imei':
//           response = await adminService.getOrderByIMEI(searchParams.term);
//           break;
//         default:
//           response = await adminService.getOrderByCode(searchParams.term);
//       }
      
//       setOrder(response.data);
//       toast.success('Commande trouvée !');
      
//     } catch (err) {
//       console.error('❌ Erreur recherche:', err);
      
//       let errorMessage = 'Commande non trouvée';
      
//       if (err.response?.status === 404) {
//         errorMessage = 'Aucune commande trouvée avec ces critères';
//       } else if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = async (data) => {
//     if (!data.searchTerm || data.searchTerm.trim() === '') {
//       setError('Veuillez entrer un terme de recherche');
//       toast.warning('Terme de recherche requis');
//       return;
//     }

//     // Validation selon le type
//     const term = data.searchTerm.trim();
    
//     // Validation IMEI (15 chiffres)
//     if (searchType === 'imei' && !/^[0-9]{15}$/.test(term)) {
//       setError('L\'IMEI doit contenir exactement 15 chiffres');
//       toast.error('Format IMEI invalide');
//       return;
//     }
    
//     // Validation email
//     if (searchType === 'email') {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(term)) {
//         setError('Format d\'email invalide');
//         toast.error('Email invalide');
//         return;
//       }
//     }

//     // Validation ID MongoDB (24 caractères hex)
//     if (searchType === 'id' && !/^[0-9a-fA-F]{24}$/.test(term)) {
//       setError('L\'ID MongoDB doit contenir 24 caractères hexadécimaux');
//       toast.error('Format ID invalide');
//       return;
//     }

//     await searchOrder({ type: searchType, term });
//   };

//   const handleCopy = (text, field) => {
//     navigator.clipboard.writeText(text);
//     setCopiedField(field);
//     setTimeout(() => setCopiedField(null), 2000);
//     toast.success('Copié !');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '—';
//     return new Date(dateString).toLocaleString('fr-FR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatPrice = (price) => {
//     if (!price && price !== 0) return '—';
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'EUR'
//     }).format(price);
//   };

//   const getStatusBadge = (status) => {
//     const statusMap = {
//       'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'en cours' },
//       'processing': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'En cours' },
//       'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Terminé' },
//       'cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Annulé' },
//       'en cours': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'en cours' },
//       'En cours': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'En cours' },
//       'Terminé': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Terminé' },
//       'Annulé': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Annulé' }
//     };
    
//     const config = statusMap[status] || statusMap['pending'];
//     const Icon = config.icon;
    
//     return (
//       <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
//         <Icon className="w-3.5 h-3.5" />
//         {config.label}
//       </span>
//     );
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       'imei': Smartphone,
//       'serveur': Server,
//       'remote': Globe,
//       'licences': Key
//     };
//     const Icon = icons[category?.toLowerCase()] || Package;
//     return <Icon className="w-5 h-5" />;
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* En-tête */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
//           Rechercher une commande
//         </h1>
//         <p className="text-gray-500 dark:text-gray-400 mt-1">
//           Recherchez par code, ID, transaction, email client ou numéro IMEI
//         </p>
//       </div>

//       {/* Formulaire de recherche */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           {/* Type de recherche */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Type de recherche
//             </label>
//             <div className="flex flex-wrap gap-3">
//               {searchTypes.map((type) => {
//                 const Icon = type.icon;
//                 return (
//                   <button
//                     key={type.value}
//                     type="button"
//                     onClick={() => setSearchType(type.value)}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
//                       searchType === type.value
//                         ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
//                         : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     {type.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Champ de recherche */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 {...register('searchTerm', { required: true })}
//                 className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
//                 placeholder={searchTypes.find(t => t.value === searchType)?.placeholder}
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 min-w-[120px]"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Recherche...
//                 </>
//               ) : (
//                 <>
//                   <Search className="w-5 h-5" />
//                   Rechercher
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Message d'erreur */}
//           {error && (
//             <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//               <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
//             </div>
//           )}
//         </form>
//       </div>

//       {/* Résultats - Cas de commandes multiples (recherche par email) */}
//       {order?.multiple && order.orders && (
//         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
//             <h3 className="font-semibold text-gray-900 dark:text-white">
//               {order.orders.length} commande(s) trouvée(s)
//             </h3>
//           </div>
//           <div className="divide-y divide-gray-200 dark:divide-gray-700">
//             {order.orders.map((ord) => (
//               <div key={ord._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
//                       {ord.orderCode || ord.transactionId || ord._id}
//                     </p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {ord.serviceDetails?.name} - {formatPrice(ord.amount)}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     {getStatusBadge(ord.status)}
//                     <button
//                       onClick={() => setOrder(ord)}
//                       className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
//                     >
//                       <Eye className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Résultat unique */}
//       {order && !order.multiple && (
//         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//           {/* En-tête avec code */}
//           <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Commande</p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
//                   {order.orderCode || order.transactionId || order._id}
//                 </p>
//               </div>
//               {getStatusBadge(order.status)}
//             </div>
//           </div>

//           {/* Détails complets */}
//           <div className="p-6 space-y-6">
//             {/* Section 1: Infos générales */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Commande</p>
//                 <div className="flex items-center justify-between">
//                   <p className="font-mono text-sm font-medium text-gray-900 dark:text-white break-all">
//                     {order._id}
//                   </p>
//                   <button
//                     onClick={() => handleCopy(order._id, 'id')}
//                     className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
//                   >
//                     <Copy className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction</p>
//                 <div className="flex items-center justify-between">
//                   <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
//                     {order.transactionId || '—'}
//                   </p>
//                   {order.transactionId && (
//                     <button
//                       onClick={() => handleCopy(order.transactionId, 'transaction')}
//                       className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
//                     >
//                       <Copy className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
//                 <p className="font-medium text-gray-900 dark:text-white">
//                   {formatDate(order.createdAt)}
//                 </p>
//               </div>
//             </div>

//             {/* Section 2: Client */}
//             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//               <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                 <User className="w-5 h-5 text-blue-500" />
//                 Client
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nom</p>
//                   <p className="font-medium text-gray-900 dark:text-white">
//                     {order.user?.name || '—'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
//                   <div className="flex items-center justify-between">
//                     <p className="font-medium text-gray-900 dark:text-white">
//                       {order.user?.email || '—'}
//                     </p>
//                     {order.user?.email && (
//                       <button
//                         onClick={() => handleCopy(order.user.email, 'email')}
//                         className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
//                       >
//                         <Copy className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Section 3: Service */}
//             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//               <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                 {getCategoryIcon(order.serviceDetails?.category)}
//                 Service
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nom</p>
//                   <p className="font-medium text-gray-900 dark:text-white">
//                     {order.serviceDetails?.name || order.service?.name || '—'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Catégorie</p>
//                   <p className="font-medium text-gray-900 dark:text-white capitalize">
//                     {order.serviceDetails?.category || order.service?.category || '—'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prix</p>
//                   <p className="font-bold text-green-600 dark:text-green-400">
//                     {formatPrice(order.amount || order.serviceDetails?.price)}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Section 4: Données fournies */}
//             {(order.userSubmittedData || order.fields) && Object.keys(order.userSubmittedData || order.fields || {}).length > 0 && (
//               <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                   <Package className="w-5 h-5 text-purple-500" />
//                   Informations fournies
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {Object.entries(order.userSubmittedData || order.fields || {}).map(([key, value]) => {
//                     // Chercher le label dans les métadonnées
//                     let label = key;
//                     if (order.userSubmittedDataMetadata) {
//                       const meta = order.userSubmittedDataMetadata.find(m => m.name === key);
//                       if (meta) label = meta.label;
//                     }
                    
//                     return (
//                       <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
//                               {label.replace(/([A-Z])/g, ' $1').trim()}
//                             </p>
//                             <p className="font-medium text-gray-900 dark:text-white break-words font-mono text-sm">
//                               {value || '—'}
//                             </p>
//                           </div>
//                           <button
//                             onClick={() => handleCopy(value, key)}
//                             className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
//                           >
//                             <Copy className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Section 5: Données générées */}
//             {order.deliveryData && Object.keys(order.deliveryData).length > 0 && (
//               <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                   <CheckCircle className="w-5 h-5 text-green-500" />
//                   Données générées
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {Object.entries(order.deliveryData).map(([key, value]) => (
//                     <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-800">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
//                             {key.replace(/([A-Z])/g, ' $1').trim()}
//                           </p>
//                           <p className="font-medium text-gray-900 dark:text-white break-words font-mono text-sm">
//                             {value}
//                           </p>
//                         </div>
//                         <button
//                           onClick={() => handleCopy(value, key)}
//                           className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
//                         >
//                           <Copy className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Section 6: Notes admin */}
//             {order.adminNotes && (
//               <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
//                   <Package className="w-5 h-5 text-orange-500" />
//                   Notes
//                 </h3>
//                 <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
//                   {order.adminNotes}
//                 </p>
//               </div>
//             )}

//             {/* Boutons d'action */}
//             <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={() => {
//                   // Télécharger les détails
//                   const dataStr = JSON.stringify(order, null, 2);
//                   const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//                   const exportFileDefaultName = `order-${order._id}.json`;
//                   const linkElement = document.createElement('a');
//                   linkElement.setAttribute('href', dataUri);
//                   linkElement.setAttribute('download', exportFileDefaultName);
//                   linkElement.click();
//                 }}
//                 className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
//               >
//                 <Download className="w-4 h-4" />
//                 Exporter JSON
//               </button>
//               <button
//                 onClick={() => {
//                   // Réinitialiser la recherche
//                   setOrder(null);
//                   setError('');
//                 }}
//                 className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
//               >
//                 Nouvelle recherche
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminSearchOrderPage;
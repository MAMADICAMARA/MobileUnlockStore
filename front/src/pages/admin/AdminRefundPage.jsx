// // src/pages/admin/AdminRefundPage.jsx
// import { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { CheckCircle, AlertCircle, ArrowLeft, User, Package, CreditCard, FileText } from 'lucide-react';
// import adminService from '../../services/adminService';

// const AdminRefundPage = () => {
//   const { state } = useLocation();
//   const navigate  = useNavigate();
//   const [loading, setLoading]     = useState(false);
//   const [success, setSuccess]     = useState(false);
//   const [error, setError]         = useState('');
//   const [refundReason, setRefundReason] = useState('Service non rendu malgré statut terminé');

//   // Données pré-remplies depuis la page commandes
//   const order = state?.order;

//   useEffect(() => {
//     if (!order) navigate('/admin/orders');
//   }, [order, navigate]);

//   if (!order) return null;

//   const clientName   = order.userId?.name  || 'Client';
//   const clientEmail  = order.userId?.email || '—';
//   const serviceName  = order.serviceId?.name || order.serviceDetails?.name || 'Service';
//   const refundAmount = order.amount || order.serviceDetails?.price || 0;
//   const orderId      = order._id;

//   const handleConfirm = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       await adminService.processRefund({ orderId, refundReason });
//       setSuccess(true);
//       setTimeout(() => navigate('/admin/orders'), 2500);
//     } catch (err) {
//       setError(err?.message || err?.error || 'Erreur lors du remboursement');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (success) return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
//         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <CheckCircle className="w-10 h-10 text-green-500" />
//         </div>
//         <h2 className="text-xl font-bold text-gray-900 mb-2">Remboursement effectué !</h2>
//         <p className="text-gray-500 text-sm">
//           {clientName} a été recrédité de{' '}
//           <span className="font-bold text-green-600">
//             {new Intl.NumberFormat('fr-FR').format(refundAmount)} FG
//           </span>
//         </p>
//         <p className="text-gray-400 text-xs mt-2">Redirection en cours...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-2xl mx-auto p-4 sm:p-6">

//       {/* En-tête */}
//       <div className="flex items-center gap-3 mb-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <ArrowLeft className="w-5 h-5 text-gray-600" />
//         </button>
//         <div>
//           <h1 className="text-xl font-bold text-gray-900">Validation du Remboursement</h1>
//           <p className="text-sm text-gray-500">Niveau 2 — Litige technique</p>
//         </div>
//       </div>

//       {/* Récapitulatif */}
//       <div className="space-y-4 mb-6">

//         {/* Client */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4">
//           <div className="flex items-center gap-2 mb-3">
//             <User className="w-5 h-5 text-blue-500" />
//             <h3 className="font-semibold text-gray-900">Client</h3>
//           </div>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <div>
//               <p className="text-gray-400 text-xs mb-0.5">Nom</p>
//               <p className="font-medium text-gray-900">{clientName}</p>
//             </div>
//             <div>
//               <p className="text-gray-400 text-xs mb-0.5">Email</p>
//               <p className="font-medium text-gray-900">{clientEmail}</p>
//             </div>
//           </div>
//         </div>

//         {/* Commande */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4">
//           <div className="flex items-center gap-2 mb-3">
//             <Package className="w-5 h-5 text-purple-500" />
//             <h3 className="font-semibold text-gray-900">Commande concernée</h3>
//           </div>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <div className="col-span-2">
//               <p className="text-gray-400 text-xs mb-0.5">Service</p>
//               <p className="font-medium text-gray-900">{serviceName}</p>
//             </div>
//             <div>
//               <p className="text-gray-400 text-xs mb-0.5">ID Commande</p>
//               <p className="font-mono text-gray-700 text-xs">{orderId}</p>
//             </div>
//             <div>
//               <p className="text-gray-400 text-xs mb-0.5">Statut actuel</p>
//               <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                 {order.status}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Montant */}
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
//           <div className="flex items-center gap-2 mb-1">
//             <CreditCard className="w-5 h-5" />
//             <h3 className="font-semibold">Montant à rembourser</h3>
//           </div>
//           <p className="text-3xl font-black">
//             {new Intl.NumberFormat('fr-FR').format(refundAmount)} FG
//           </p>
//           <p className="text-blue-100 text-xs mt-1">Montant exact de la commande originale</p>
//         </div>

//         {/* Raison */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4">
//           <div className="flex items-center gap-2 mb-3">
//             <FileText className="w-5 h-5 text-amber-500" />
//             <h3 className="font-semibold text-gray-900">Raison du remboursement</h3>
//           </div>
//           <textarea
//             value={refundReason}
//             onChange={(e) => setRefundReason(e.target.value)}
//             rows={3}
//             className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//             placeholder="Expliquez la raison du remboursement..."
//           />
//         </div>
//       </div>

//       {/* Erreur */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
//           <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
//           <p className="text-sm text-red-600">{error}</p>
//         </div>
//       )}

//       {/* Bouton de validation */}
//       <button
//         onClick={handleConfirm}
//         disabled={loading}
//         className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
//       >
//         {loading ? (
//           <span className="flex items-center gap-2">
//             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//             Traitement...
//           </span>
//         ) : (
//           <>
//             <CheckCircle className="w-5 h-5" />
//             Valider le remboursement — {new Intl.NumberFormat('fr-FR').format(refundAmount)} FG
//           </>
//         )}
//       </button>

//       <p className="text-center text-xs text-gray-400 mt-3">
//         Cette action est irréversible. Le client sera immédiatement recrédité.
//       </p>
//     </div>
//   );
// };

// export default AdminRefundPage;


// src/pages/admin/AdminRefundPage.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, User, Package, CreditCard, FileText } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminRefundPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [refundReason, setRefundReason] = useState('Service non rendu malgré statut terminé');

  // Données pré-remplies depuis la page commandes
  const order = state?.order;

  useEffect(() => {
    if (!order) navigate('/admin/orders');
  }, [order, navigate]);

  if (!order) return null;

  const clientName   = order.userId?.name  || 'Client';
  const clientEmail  = order.userId?.email || '—';
  const serviceName  = order.serviceId?.name || order.serviceDetails?.name || 'Service';
  const refundAmount = order.amount || order.serviceDetails?.price || 0;
  const orderId      = order._id;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await adminService.processRefund({ orderId, refundReason });
      setSuccess(true);
      setTimeout(() => navigate('/admin/orders'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du remboursement');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Remboursement effectué !</h2>
        <p className="text-gray-500 text-sm">
          {clientName} a été recrédité de{' '}
          <span className="font-bold text-green-600">
            {new Intl.NumberFormat('fr-FR').format(refundAmount)} FG
          </span>
        </p>
        <p className="text-gray-400 text-xs mt-2">Redirection en cours...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Validation du Remboursement</h1>
          <p className="text-sm text-gray-500">Niveau 2 — Litige technique</p>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="space-y-4 mb-6">

        {/* Client */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Client</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Nom</p>
              <p className="font-medium text-gray-900">{clientName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Email</p>
              <p className="font-medium text-gray-900">{clientEmail}</p>
            </div>
          </div>
        </div>

        {/* Commande */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Commande concernée</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <p className="text-gray-400 text-xs mb-0.5">Service</p>
              <p className="font-medium text-gray-900">{serviceName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">ID Commande</p>
              <p className="font-mono text-gray-700 text-xs">{orderId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Statut actuel</p>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Montant */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-semibold">Montant à rembourser</h3>
          </div>
          <p className="text-3xl font-black">
            {new Intl.NumberFormat('fr-FR').format(refundAmount)} FG
          </p>
          <p className="text-blue-100 text-xs mt-1">Montant exact de la commande originale</p>
        </div>

        {/* Raison */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Raison du remboursement</h3>
          </div>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Expliquez la raison du remboursement..."
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Bouton de validation */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement...
          </span>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Valider le remboursement — {new Intl.NumberFormat('fr-FR').format(refundAmount)} FG
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Cette action est irréversible. Le client sera immédiatement recrédité.
      </p>
    </div>
  );
};

export default AdminRefundPage; 
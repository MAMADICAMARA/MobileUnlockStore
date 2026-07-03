// src/pages/admin/AdminRechargeUserPage.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Wallet, Mail, DollarSign, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminRechargeUserPage = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({ defaultValues: { email: '', amount: '' } });

  const amount = watch('amount');

  const onSubmit = async (data) => {
    setStatus('loading');
    setMessage('');
    try {
      // ✅ S'assurer que amount est bien un nombre
      const payload = {
        email: data.email.trim().toLowerCase(),
        amount: Number(data.amount),
      };

      console.log('📤 Payload recharge:', payload);

      await adminService.rechargeUserBalance(payload);

      setStatus('success');
      setMessage(`Solde rechargé de ${Number(data.amount).toLocaleString('fr-FR')} FG avec succès.`);
      toast.success('Solde rechargé avec succès !');
      reset();
    } catch (err) {
      console.error('❌ Erreur recharge:', err);
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || err.message
        || 'Une erreur est survenue';
      setStatus('error');
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* En-tête */}
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Administration</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recharger un client</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ajoutez des fonds au solde d'un utilisateur via son adresse email.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">

          {/* Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium">Montant à créditer</p>
                <p className="text-3xl font-black text-white tracking-tight">
                  {amount && !isNaN(amount)
                    ? `${Number(amount).toLocaleString('fr-FR')} FG`
                    : '— FG'}
                </p>
              </div>
            </div>
          </div>

          {/* Champs */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-5 space-y-4"
            // ✅ noValidate pour éviter la validation HTML native qui peut bloquer sur mobile
            noValidate
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email du client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  // ✅ inputMode pour le clavier email sur mobile
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  {...register('email', {
                    required: "L'email est requis",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email invalide'
                    }
                  })}
                  placeholder="client@exemple.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.email
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Montant (FG) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  // ✅ inputMode decimal pour le pavé numérique sur mobile
                  inputMode="decimal"
                  autoComplete="off"
                  {...register('amount', {
                    required: 'Le montant est requis',
                    min: { value: 1, message: 'Le montant doit être supérieur à 0' },
                    validate: v => !isNaN(Number(v)) || 'Montant invalide'
                  })}
                  placeholder="Ex: 50000"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.amount
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Message retour */}
            {status === 'success' && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{message}</p>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{message}</p>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <><Loader className="w-4 h-4 animate-spin" /> Traitement…</>
              ) : (
                <><Wallet className="w-4 h-4" /> Confirmer le rechargement</>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Le solde sera crédité immédiatement sur le compte du client. Cette action est irréversible — vérifiez bien l'email avant de confirmer.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminRechargeUserPage;

// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import adminService from '../../services/adminService';

// const AdminRechargeUserPage = () => {
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const { register, handleSubmit, reset, formState: { errors } } = useForm();

//     const onSubmit = async (data) => {
//         try {
//             setError('');
//             setSuccess('');
//             await adminService.rechargeUserBalance(data);
//             setSuccess('Balance rechargée avec succès');
//             toast.success('Balance rechargée avec succès');
//             reset();
//         } catch (err) {
//             const errorMessage = err.response?.data?.error || "Une erreur est survenue";
//             setError(errorMessage);
//             toast.error(errorMessage);
//         }
//     };

//     return (
//         <div className="p-6">
//             <h2 className="text-2xl font-bold mb-6">Recharger un client</h2>
            
//             <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
//                 <div className="mb-4">
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                         Email du client
//                     </label>
//                     <input
//                         type="email"
//                         {...register('email', { 
//                             required: "L'email est requis",
//                             pattern: {
//                                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                                 message: "Email invalide"
//                             }
//                         })}
//                         className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="email@exemple.com"
//                     />
//                     {errors.email && (
//                         <p className="mt-1 text-sm text-red-600">
//                             {errors.email.message}
//                         </p>
//                     )}
//                 </div>
                
//                 <div className="mb-4">
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                         Montant
//                     </label>
//                     <input
//                         type="number"
//                         {...register('amount', { 
//                             required: "Le montant est requis",
//                             min: {
//                                 value: 1,
//                                 message: "Le montant doit être supérieur à 0"
//                             }
//                         })}
//                         className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="0"
//                     />
//                     {errors.amount && (
//                         <p className="mt-1 text-sm text-red-600">
//                             {errors.amount.message}
//                         </p>
//                     )}
//                 </div>

//                 {error && (
//                     <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//                         {error}
//                     </div>
//                 )}

//                 {success && (
//                     <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
//                         {success}
//                     </div>
//                 )}
                
//                 <button
//                     type="submit"
//                     className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                 >
//                     Confirmer le rechargement
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default AdminRechargeUserPage;
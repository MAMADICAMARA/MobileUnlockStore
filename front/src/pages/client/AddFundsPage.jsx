// src/pages/client/AddFundsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, History, MessageCircle, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const MIN_AMOUNT = 100000;

const formatFG = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

const AddFundsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(MIN_AMOUNT);
  const [selectedMethod, setSelectedMethod] = useState('admin');
  const [submitted, setSubmitted] = useState(false);

  const predefinedAmounts = [100000, 200000, 500000, 1000000, 2000000];

  const paymentMethods = [
    { id: 'admin', name: 'Contact Admin',     description: 'Contactez admin via WhatsApp pour recharger votre compte', icon: MessageCircle },
    // { id: 'bank',  name: 'Virement Bancaire', description: 'Virement direct sur notre compte',                    icon: CreditCard },
    // { id: 'card',  name: 'Carte Bancaire',    description: 'Paiement sécurisé par carte',                         icon: Shield },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) < MIN_AMOUNT) {
      alert(`Le montant minimum autorisé est de ${formatFG(MIN_AMOUNT)} FG.`);
      return;
    }

    if (selectedMethod === 'admin') {
      const msg = encodeURIComponent(
        `Bonjour Admin, je souhaite ajouter ${formatFG(amount)} FG à mon compte (ID: ${user?._id?.slice(-8)}). Solde actuel: ${formatFG(user?.balance)} FG.`
      );
      window.open(`https://wa.me/224612563702?text=${msg}`, '_blank');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } else if (selectedMethod === 'bank') {
      alert("Virement bancaire : contactez l'admin pour les détails.");
    } else {
      alert('Paiement par carte : intégration en cours.');
    }
  };

  return (
    <div className="w-full">
      <main className="w-full max-w-6xl mx-auto px-2 py-2 sm:px-6 sm:py-8">

        {/* En-tête */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Ajouter des Fonds
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-500 dark:text-gray-400">
            Rechargez votre compte pour accéder à nos services
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">

          {/* ── Colonne gauche ── */}
          <div className="space-y-4">

            {/* Carte solde */}
            <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 p-5 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Solde actuel</h2>
                <CreditCard className="w-6 h-6 text-blue-100" />
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl sm:text-5xl font-black leading-none">
                  {formatFG(user?.balance)}
                </span>
                <span className="text-xl sm:text-2xl font-bold">FG</span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm mb-4">
                Compte : #{user?._id?.slice(-8) || 'N/A'}
              </p>
              <div className="pt-3 border-t border-white/20">
                <p className="text-xs text-blue-100">
                  Votre solde sera crédité immédiatement après confirmation
                </p>
              </div>
            </div>

            {/* Avantages */}
            <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-white dark:bg-slate-800 p-4 sm:p-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Avantages</h3>
              <div className="space-y-2">
                {[
                  'Accès immédiat à tous nos services',
                  'Paiement sécurisé et crypté',
                  'Support client 24/7',
                  'Aucun frais caché',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Historique */}
            <div className="hidden sm:block overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-white dark:bg-slate-800 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Historique</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accédez à votre historique dans votre profil</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-white dark:bg-slate-800 p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-5">
              Montant et méthode
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Montants rapides */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Montants rapides
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className={`py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
                        amount === value
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {formatFG(value)} FG
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant personnalisé */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Montant personnalisé
                </label>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5">
                  <input
                    type="number"
                    min={MIN_AMOUNT}
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="flex-1 bg-transparent focus:outline-none dark:text-white text-sm"
                    placeholder="Montant"
                  />
                  <span className="font-bold text-gray-700 dark:text-white text-sm">FG</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  Montant minimum : {formatFG(MIN_AMOUNT)} FG
                </p>
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Méthode de paiement
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm break-words">{method.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words">{method.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-baseline justify-between min-w-0 shadow-sm">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Montant à recharger</span>
                <span className="flex items-baseline gap-1 text-lg font-black text-blue-600 dark:text-blue-400 min-w-0 break-words">
                  {formatFG(amount)}
                  <span className="text-sm font-semibold">FG</span>
                </span>
              </div>

              {/* Succès */}
              {submitted && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">Demande envoyée ! L'admin vous contactera bientôt.</p>
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Banknote className="w-5 h-5" />
                Recharger {formatFG(amount)} FG
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
              En continuant, vous acceptez nos conditions d'utilisation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddFundsPage;

// // src/pages/client/AddFundsPage.jsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CreditCard, Banknote, History, MessageCircle, Shield, CheckCircle, ShieldAlert } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';

// // Montant minimum autorisé pour une recharge de compte (en FG)
// const MIN_AMOUNT = 100000;

// const formatFG = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

// const AddFundsPage = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [amount, setAmount] = useState(MIN_AMOUNT);
//   const [selectedMethod, setSelectedMethod] = useState('admin');
//   const [submitted, setSubmitted] = useState(false);
//   const [show2FAPrompt, setShow2FAPrompt] = useState(false);

//   const predefinedAmounts = [100000, 200000, 500000, 1000000, 2000000];

//   // Chemin vers l'onglet Sécurité du profil, selon l'espace (client ou employé)
//   const securityProfilePath = `/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/profile?tab=security`;

//   const paymentMethods = [
//     { id: 'admin', name: 'Contact Admin',     description: 'Contactez admin via WhatsApp pour recharger votre compte', icon: MessageCircle },
//     { id: 'bank',  name: 'Virement Bancaire', description: 'Virement direct sur notre compte',                    icon: CreditCard },
//     { id: 'card',  name: 'Carte Bancaire',    description: 'Paiement sécurisé par carte',                         icon: Shield },
//   ];

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // ✅ Le 2FA doit être activé avant toute recharge — sécurité du compte
//     if (!user?.twoFactorEnabled) {
//       setShow2FAPrompt(true);
//       return;
//     }

//     if (!amount || Number(amount) < MIN_AMOUNT) {
//       alert(`Le montant minimum autorisé est de ${formatFG(MIN_AMOUNT)} FG.`);
//       return;
//     }
//     if (selectedMethod === 'admin') {
//       const msg = encodeURIComponent(
//         `Bonjour Admin, je souhaite ajouter ${formatFG(amount)} FG à mon compte (ID: ${user?._id?.slice(-8)}). Solde actuel: ${formatFG(user?.balance)} FG.`
//       );
//       window.open(`https://wa.me/224612563702?text=${msg}`, '_blank');
//       setSubmitted(true);
//       setTimeout(() => setSubmitted(false), 3000);
//     } else if (selectedMethod === 'bank') {
//       alert("Virement bancaire : contactez l'admin pour les détails.");
//     } else {
//       alert('Paiement par carte : intégration en cours.');
//     }
//   };

//   return (
//     <div className="w-full">
//       <main className="w-full max-w-6xl mx-auto px-2 py-2 sm:px-6 sm:py-8">

//         {/* En-tête */}
//         <div className="text-center mb-6 sm:mb-10">
//           <h1 className="text-2xl sm:text-4xl font-bold mb-2">
//             <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
//               Ajouter des Fonds
//             </span>
//           </h1>
//           <p className="text-sm sm:text-lg text-gray-500 dark:text-gray-400">
//             Rechargez votre compte pour accéder à nos services
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">

//           {/* ── Colonne gauche ── */}
//           <div className="space-y-4">

//             {/* Carte solde — sans cadre blanc autour sur mobile */}
//             <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 p-5 sm:p-6 text-white">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-base sm:text-lg font-semibold">Solde actuel</h2>
//                 <CreditCard className="w-6 h-6 text-blue-100" />
//               </div>
//               <div className="flex items-baseline gap-1 mb-1">
//                 <span className="text-3xl sm:text-5xl font-black leading-none">
//                   {formatFG(user?.balance)}
//                 </span>
//                 <span className="text-xl sm:text-2xl font-bold">FG</span>
//               </div>
//               <p className="text-blue-100 text-xs sm:text-sm mb-4">
//                 Compte : #{user?._id?.slice(-8) || 'N/A'}
//               </p>
//               <div className="pt-3 border-t border-white/20">
//                 <p className="text-xs text-blue-100">
//                   Votre solde sera crédité immédiatement après confirmation
//                 </p>
//               </div>
//             </div>

//             {/* Avantages */}
//             <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-white dark:bg-slate-800 p-4 sm:p-5">
//               <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Avantages</h3>
//               <div className="space-y-2">
//                 {[
//                   'Accès immédiat à tous nos services',
//                   'Paiement sécurisé et crypté',
//                   'Support client 24/7',
//                   'Aucun frais caché',
//                 ].map((text) => (
//                   <div key={text} className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
//                     <p className="text-gray-700 dark:text-gray-300 text-sm">{text}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Historique */}
//             <div className="hidden sm:block overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-white dark:bg-slate-800 p-4 sm:p-5">
//               <div className="flex items-center gap-2">
//                 <History className="w-4 h-4 text-blue-500 flex-shrink-0" />
//                 <div>
//                   <h3 className="text-sm font-bold text-gray-900 dark:text-white">Historique</h3>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Accédez à votre historique dans votre profil</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── Colonne droite : formulaire ── */}
//           <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-white dark:bg-slate-800 p-4 sm:p-6">
//             <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-5">
//               Montant et méthode
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-5">

//               {/* Montants rapides */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
//                   Montants rapides
//                 </label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {predefinedAmounts.map((value) => (
//                     <button
//                       key={value}
//                       type="button"
//                       onClick={() => setAmount(value)}
//                       className={`py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
//                         amount === value
//                           ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
//                           : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
//                       }`}
//                     >
//                       {formatFG(value)} FG
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Montant personnalisé */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
//                   Montant personnalisé
//                 </label>
//                 <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5">
//                   <input
//                     type="number"
//                     min={MIN_AMOUNT}
//                     step="1000"
//                     value={amount}
//                     onChange={(e) => setAmount(Number(e.target.value))}
//                     className="flex-1 bg-transparent focus:outline-none dark:text-white text-sm"
//                     placeholder="Montant"
//                   />
//                   <span className="font-bold text-gray-700 dark:text-white text-sm">FG</span>
//                 </div>
//                 <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
//                   Montant minimum : {formatFG(MIN_AMOUNT)} FG
//                 </p>
//               </div>

//               {/* Méthode de paiement */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
//                   Méthode de paiement
//                 </label>
//                 <div className="space-y-2">
//                   {paymentMethods.map((method) => {
//                     const Icon = method.icon;
//                     const isSelected = selectedMethod === method.id;
//                     return (
//                       <label
//                         key={method.id}
//                         className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
//                           isSelected
//                             ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
//                             : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'
//                         }`}
//                       >
//                         <input
//                           type="radio"
//                           name="method"
//                           value={method.id}
//                           checked={isSelected}
//                           onChange={(e) => setSelectedMethod(e.target.value)}
//                           className="w-4 h-4 flex-shrink-0"
//                         />
//                         <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
//                         <div className="min-w-0">
//                           <p className="font-medium text-gray-900 dark:text-white text-sm break-words">{method.name}</p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words">{method.description}</p>
//                         </div>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Résumé */}
//               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-baseline justify-between min-w-0 shadow-sm">
//                 <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Montant à recharger</span>
//                 <span className="flex items-baseline gap-1 text-lg font-black text-blue-600 dark:text-blue-400 min-w-0 break-words">
//                   {formatFG(amount)}
//                   <span className="text-sm font-semibold">FG</span>
//                 </span>
//               </div>

//               {/* Alerte 2FA requis */}
//               {show2FAPrompt && (
//                 <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
//                   <div className="flex items-start gap-2">
//                     <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
//                     <p className="text-sm text-amber-700 dark:text-amber-400">
//                       Pour votre sécurité, activez d'abord l'authentification à deux facteurs (2FA) avant de recharger votre compte.
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => navigate(securityProfilePath)}
//                     className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
//                   >
//                     <Shield className="w-3.5 h-3.5" /> Activer le 2FA
//                   </button>
//                 </div>
//               )}

//               {/* Succès */}
//               {submitted && (
//                 <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl flex items-center gap-2">
//                   <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
//                   <p className="text-sm text-green-700 dark:text-green-400">Demande envoyée ! L'admin vous contactera bientôt.</p>
//                 </div>
//               )}

//               {/* Bouton */}
//               <button
//                 type="submit"
//                 className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
//               >
//                 <Banknote className="w-5 h-5" />
//                 Recharger {formatFG(amount)} FG
//               </button>
//             </form>

//             <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
//               En continuant, vous acceptez nos conditions d'utilisation.
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AddFundsPage;
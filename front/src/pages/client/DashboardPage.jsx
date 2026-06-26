// src/pages/client/AddFundsPage.jsx
import { useState } from 'react';
import { CreditCard, DollarSign, History, MessageCircle, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AddFundsPage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(100);
  const [selectedMethod, setSelectedMethod] = useState('admin');
  const [submitted, setSubmitted] = useState(false);

  const predefinedAmounts = [50, 100, 250, 500, 1000];

  const paymentMethods = [
    { id: 'admin', name: 'Contact Admin',     description: 'Contactez admin via WhatsApp pour recharge manuelle', icon: MessageCircle },
    { id: 'bank',  name: 'Virement Bancaire', description: 'Virement direct sur notre compte',                    icon: CreditCard },
    { id: 'card',  name: 'Carte Bancaire',    description: 'Paiement sécurisé par carte',                         icon: Shield },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount <= 0) { alert('Veuillez entrer un montant valide'); return; }

    if (selectedMethod === 'admin') {
      const msg = encodeURIComponent(
        `Bonjour Admin, je souhaite ajouter ${amount} FG à mon compte (ID: ${user?._id?.slice(-8)}). Solde actuel: ${user?.balance || 0} FG.`
      );
      window.open(`https://wa.me/224611066809?text=${msg}`, '_blank');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } else if (selectedMethod === 'bank') {
      alert('Virement bancaire : contactez l\'admin pour les détails.');
    } else {
      alert('Paiement par carte : intégration en cours.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* En-tête */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Ajouter des Fonds
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400">
            Rechargez votre compte pour accéder à nos services
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Colonne gauche ── */}
          <div className="space-y-5">

            {/* Carte solde */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Solde actuel</h2>
                <CreditCard className="w-7 h-7 text-blue-100" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold mb-1 leading-tight">
                {(user?.balance || 0).toFixed(2)}{' '}
                <span className="text-2xl sm:text-3xl font-semibold">FG</span>
              </div>
              <p className="text-blue-100 text-sm mb-5">
                Compte : #{user?._id?.slice(-8) || 'N/A'}
              </p>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-blue-100">
                  Votre solde sera crédité immédiatement après confirmation
                </p>
              </div>
            </div>

            {/* Avantages */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Avantages</h3>
              <div className="space-y-3">
                {[
                  'Accès immédiat à tous nos services',
                  'Paiement sécurisé et crypté',
                  'Support client 24/7',
                  'Aucun frais caché',
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Historique</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Accédez à votre historique dans votre profil
              </p>
            </div>
          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 sm:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Montant et méthode
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Montants rapides */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Montants rapides
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        amount === value
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {value} FG
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant personnalisé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant personnalisé
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                    placeholder="Entrez un montant"
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">FG</span>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Méthode de paiement
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="w-4 h-4 mt-1 flex-shrink-0"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{method.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.description}</p>
                        </div>
                        <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 mt-0.5" />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Montant à recharger : </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {Number(amount).toFixed(2)} FG
                  </span>
                </p>
              </div>

              {/* Succès */}
              {submitted && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Demande envoyée ! L'admin vous contactera bientôt.
                  </p>
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <DollarSign className="w-5 h-5 flex-shrink-0" />
                Recharger {Number(amount).toFixed(2)} FG
              </button>
            </form>

            {/* Conditions */}
            <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                En cliquant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFundsPage;

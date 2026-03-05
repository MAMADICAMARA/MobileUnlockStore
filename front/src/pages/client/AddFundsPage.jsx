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
    {
      id: 'admin',
      name: 'Contact Admin',
      description: 'Contactez admin via WhatsApp pour recharge manuelle',
      icon: MessageCircle
    },
    {
      id: 'bank',
      name: 'Virement Bancaire',
      description: 'Virement direct sur notre compte',
      icon: CreditCard
    },
    {
      id: 'card',
      name: 'Carte Bancaire',
      description: 'Paiement securise par carte',
      icon: Shield
    }
  ];

  const handleAmountChange = (value) => {
    setAmount(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (amount <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    if (selectedMethod === 'admin') {
      const adminPhone = '224611066809';
      const whatsappMessage = encodeURIComponent(
        `Bonjour Admin, je souhaite ajouter ${amount}EUR a mon compte (ID: ${user?._id?.slice(-8)}). Solde actuel: ${user?.balance || 0}EUR.`
      );
      window.open(`https://wa.me/${adminPhone}?text=${whatsappMessage}`, '_blank');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } else if (selectedMethod === 'bank') {
      alert('Virement bancaire: Contactez admin pour details');
    } else if (selectedMethod === 'card') {
      alert('Paiement par carte: Integration en cours');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tete */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Ajouter des Fonds
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Rechargez votre compte pour acceder a nos services
          </p>
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto lg:grid-cols-2">
          {/* Colonne gauche */}
          <div className="space-y-8">
            {/* Carte de solde */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">Solde actuel</h2>
                <CreditCard className="w-8 h-8 text-blue-100" />
              </div>
              <div className="text-5xl font-bold mb-2">
                {(user?.balance || 0).toFixed(2)} EUR
              </div>
              <p className="text-blue-100 mb-6">
                Compte: #{user?._id?.slice(-8) || 'N/A'}
              </p>
              <div className="pt-6 border-t border-white/20">
                <p className="text-sm text-blue-100">
                  Votre solde sera credite immediatement apres confirmation
                </p>
              </div>
            </div>

            {/* Avantages */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Avantages
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Acces immediat a tous nos services
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Paiement securise et crypyffe
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Support client 24/7
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Aucun frais cache
                  </p>
                </div>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Historique
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Accedez a votre historique dans votre profil
              </p>
            </div>
          </div>

          {/* Colonne droite: Formulaire */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Montant et methode
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Montants prédéfinis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Montants rapides
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAmountChange(value)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        amount === value
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {value}EUR
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant personnalise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant personnalise
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Entrez un montant"
                  />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">EUR</span>
                </div>
              </div>

              {/* Methode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Methode de paiement
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className="relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all"
                        style={{
                          borderColor: isSelected ? 'rgb(59, 130, 246)' : 'rgb(229, 231, 235)',
                          backgroundColor: isSelected ? 'rgb(239, 246, 255)' : 'rgb(249, 250, 251)'
                        }}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="w-4 h-4 mt-1"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {method.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {method.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Resume */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Montant a recharger: </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {amount.toFixed(2)}EUR
                  </span>
                </p>
              </div>

              {/* Message de succes */}
              {submitted && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Demande envoyee! Admin vous contactera bientot.
                  </p>
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Recharger {amount.toFixed(2)}EUR
                </div>
              </button>
            </form>

            {/* Conditions */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                En cliquant, vous acceptez nos conditions d'utilisation et politique de confidentialite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFundsPage;

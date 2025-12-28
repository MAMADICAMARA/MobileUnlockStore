import useAuth from '../../hooks/useAuth';

import React, { useState, useEffect } from 'react';

import paymentService from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

const paymentMethods = [
  { name: 'Orange Money', value: 'orange', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Logo_Orange_Money.png' },
  { name: 'MTN', value: 'mtn', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/MTN_Group_logo.png' },
  { name: 'PayPal', value: 'paypal', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
  { name: 'Visa', value: 'visa', img: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png' },
  { name: 'MasterCard', value: 'mastercard', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
  { name: 'Binance', value: 'binance', img: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.png' },
];

const AddFundsPage = () => {
  const { user, updateUserBalance } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [details, setDetails] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      alert("Un administrateur ne peut pas ajouter de fond.");
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // Gestion du formulaire principal
  const handleAddFunds = (e) => {
    e.preventDefault();
    setFeedback('');
    if (!amount || Number(amount) < 1) {
      setFeedback('Veuillez entrer un montant valide.');
      return;
    }
    setShowPaymentModal(true);
  };

  // Gestion de la sélection du mode de paiement
  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  // Gestion du bouton suivant
  const handleNext = () => {
    setShowPaymentModal(false);
    setShowDetailsModal(true);
  };

  // Gestion de la soumission finale
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      // Envoi des infos de paiement selon le mode choisi
      const response = await paymentService.addPayment({
        amount: Number(amount),
        type: selectedMethod.name,
        details,
      });
      updateUserBalance(response.data.newBalance);
      setFeedback('Fonds ajoutés avec succès !');
      setAmount('');
      setShowDetailsModal(false);
      setSelectedMethod(null);
      setDetails({});
    } catch (error) {
      setFeedback("Erreur lors de l'ajout des fonds.");
    }
    setLoading(false);
  };

  // Champs dynamiques selon le mode de paiement
  const renderDetailsFields = () => {
    switch (selectedMethod?.value) {
      case 'orange':
      case 'mtn':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
            <input type="tel" required value={details.phone || ''} onChange={e => setDetails({ ...details, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        );
      case 'paypal':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email PayPal</label>
            <input type="email" required value={details.email || ''} onChange={e => setDetails({ ...details, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        );
      case 'visa':
      case 'mastercard':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de carte</label>
              <input type="text" required value={details.card || ''} onChange={e => setDetails({ ...details, card: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
              <input type="text" required placeholder="MM/AA" value={details.expiry || ''} onChange={e => setDetails({ ...details, expiry: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
              <input type="text" required value={details.cvc || ''} onChange={e => setDetails({ ...details, cvc: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </>
        );
      case 'binance':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse crypto Binance</label>
            <input type="text" required value={details.wallet || ''} onChange={e => setDetails({ ...details, wallet: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-3xl text-blue-700 font-bold mb-6">Ajouter des fonds</h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Recharger votre solde</h2>
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-700 mb-2">Votre solde actuel</span>
          <span className="text-2xl font-bold text-green-600">{user?.balance !== undefined ? user.balance.toFixed(2) : '0.00'} €</span>
        </div>
        <form onSubmit={handleAddFunds} className="space-y-6">
          <div className="mb-6">
            <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-2">Montant à ajouter</label>
            <input
              type="number"
              id="custom-amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700" disabled={loading} type="submit">
            {loading ? 'Traitement...' : 'Procéder au paiement'}
          </button>
          {feedback && <div className="mt-4 text-center text-green-600">{feedback}</div>}
        </form>
        <div className="mt-8 text-sm text-gray-500">
            <p>🔒 Transactions sécurisées par Stripe.</p>
            <p>Nous acceptons Visa, MasterCard, PayPal, Orange Money, MTN et Binance.</p>
        </div>
      </div>
     {/* Modal choix du mode de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 relative">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Choisissez votre mode de paiement</h2>
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {paymentMethods.map(method => (
                <button key={method.value} type="button" onClick={() => handleSelectMethod(method)} className={`flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition ${selectedMethod?.value === method.value ? 'border-blue-600 bg-blue-100' : 'border-gray-200'}`}>
                  <img src={method.img} alt={method.name} className="h-12 mb-2" />
                  <span className="font-bold text-blue-700">{method.name}</span>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!selectedMethod} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300">Suivant</button>
          </div>
        </div>
      )}
      {/* Modal coordonnées selon mode de paiement */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 relative">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Coordonnées pour {selectedMethod?.name}</h2>
            <button onClick={() => setShowDetailsModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              {renderDetailsFields()}
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700" disabled={loading} type="submit">
                {loading ? 'Traitement...' : 'Valider le paiement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFundsPage;

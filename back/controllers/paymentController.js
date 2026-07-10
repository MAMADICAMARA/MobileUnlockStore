// back/controllers/paymentController.js
const Payment = require('../models/Payment');
const User = require('../models/User');

// Montant minimum autorisé pour une recharge de compte (en FG) — doit rester
// synchronisé avec MIN_AMOUNT dans front/src/pages/client/AddFundsPage.jsx
const MIN_PAYMENT_AMOUNT = 100000;

/**
 * @desc    Ajouter un paiement (simulation)
 * @route   POST /api/payments
 * @access  Private
 */
exports.addPayment = async (req, res) => {
  const { amount, type } = req.body;

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < MIN_PAYMENT_AMOUNT) {
    return res.status(400).json({
      message: `Le montant minimum autorisé est de ${new Intl.NumberFormat('fr-FR').format(MIN_PAYMENT_AMOUNT)} FG.`,
    });
  }

  try {
    // Créer le paiement (statut simulé à "Réussi")
    const payment = await Payment.create({
      user: req.user._id,
      amount: parsedAmount,
      type: type || 'Carte',
      status: 'Réussi',
    });
    // $inc garantit l'atomicité : pas de race condition si deux paiements arrivent simultanément
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: parsedAmount } },
      { new: true }
    );
    res.status(201).json({ payment, newBalance: updatedUser.balance });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du paiement.' });
  }
};

/**
 * @desc    Récupérer l'historique des paiements de l'utilisateur
 * @route   GET /api/payments/my-payments
 * @access  Private
 */
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements.' });
  }
};

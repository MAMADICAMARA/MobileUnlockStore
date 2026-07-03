// back/controllers/paymentController.js
const Payment = require('../models/Payment');
const User = require('../models/User');

/**
 * @desc    Ajouter un paiement (simulation)
 * @route   POST /api/payments
 * @access  Private
 */
exports.addPayment = async (req, res) => {
  const { amount, type } = req.body;
  try {
    // Créer le paiement (statut simulé à "Réussi")
    const payment = await Payment.create({
      user: req.user._id,
      amount,
      type: type || 'Carte',
      status: 'Réussi',
    });
    // $inc garantit l'atomicité : pas de race condition si deux paiements arrivent simultanément
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: amount } },
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

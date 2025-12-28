// back/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { admin, protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { changeUserRole, getAllEmployees } = require('../controllers/roleController');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const License = require('../models/License');

// --- Utilisateurs ---
router.get('/users', protect, admin, async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// --- Recharge de balance ---
router.post('/recharge-balance', protect, admin, async (req, res) => {
  try {
    const { email, amount } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Cet email n'existe pas" });
    }

    // Mettre à jour la balance
    user.balance += Number(amount);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Balance rechargée avec succès",
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la recharge de la balance" });
  }
});

// --- Gestion des rôles et employés ---
router.post('/change-role', protect, admin, changeUserRole);
router.get('/employees', protect, admin, getAllEmployees);

// --- Services ---
router.get('/services', protect, admin, async (req, res) => {
  const services = await Service.find({});
  // Ajout d'un filtre ou d'une propriété pour afficher le type "Remote" si présent
  // Si tu veux juste afficher tous les services, rien à changer ici
  res.json(services);
});
router.post('/services', protect, admin, async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json(service);
});
router.put('/services/:id', protect, admin, async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(service);
});
router.delete('/services/:id', protect, admin, async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: 'Service supprimé' });
});

// --- Commandes ---
router.get('/orders', protect, admin, async (req, res) => {
  const orders = await Order.find({}).populate('user').populate('service');
  res.json(orders);
});
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(order);
});

// --- Tickets ---
router.get('/tickets', protect, admin, async (req, res) => {
  const tickets = await Ticket.find({}).populate('user');
  res.json(tickets);
});

// --- Paiements ---
router.get('/payments', protect, admin, async (req, res) => {
  const payments = await Payment.find({}).populate('user');
  res.json(payments);
});

// --- Licences ---
router.get('/licenses', protect, admin, async (req, res) => {
  const licenses = await License.find({}).populate('user');
  res.json(licenses);
});

// --- Statistiques du dashboard ---
router.get('/dashboard-stats', protect, admin, async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const pendingOrders = await Order.countDocuments({ status: 'En attente' });
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersThisMonth,
      newUsers,
      pendingOrders
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
  }
});

module.exports = router;

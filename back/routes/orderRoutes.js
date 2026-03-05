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

// --- COMMANDES ---
// ⚠️ SECTION CORRIGÉE ⚠️
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')  // ✅ CORRIGÉ: 'userId' au lieu de 'user'
      .populate('serviceId', 'name category price');  // ✅ CORRIGÉ: 'serviceId' au lieu de 'service'
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du chargement des commandes' 
    });
  }
});

router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('serviceId', 'name category price');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Commande non trouvée' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du statut' 
    });
  }
});

// --- Tickets ---
router.get('/tickets', protect, admin, async (req, res) => {
  try {
    const tickets = await Ticket.find({}).populate('userId', 'name email');
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Erreur tickets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du chargement des tickets' 
    });
  }
});

// --- Paiements ---
router.get('/payments', protect, admin, async (req, res) => {
  try {
    const payments = await Payment.find({}).populate('userId', 'name email');
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Erreur paiements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du chargement des paiements' 
    });
  }
});

// --- Licences ---
router.get('/licenses', protect, admin, async (req, res) => {
  try {
    const licenses = await License.find({}).populate('userId', 'name email');
    res.json({
      success: true,
      data: licenses
    });
  } catch (error) {
    console.error('Erreur licences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du chargement des licences' 
    });
  }
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
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersThisMonth,
        newUsers,
        pendingOrders
      }
    });
  } catch (err) {
    console.error('Erreur stats dashboard:', err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors du calcul des statistiques" 
    });
  }
});

module.exports = router;
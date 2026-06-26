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
const Notification = require('../models/Notification');

// ─── Utilitaire : créer une notification (non bloquante) ─────────────────────
const createNotification = async ({ userId, title, message, type = 'info' }) => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (err) {
    console.warn('⚠️ Notification non envoyée:', err.message);
  }
};

// ─── Utilisateurs ─────────────────────────────────────────────────────────────
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs' });
  }
});

// ─── Recharge de balance ──────────────────────────────────────────────────────
router.post('/recharge-balance', protect, admin, async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: 'Email et montant sont requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Cet email n'existe pas" });
    }

    user.balance += Number(amount);
    await user.save();

    // Notification au client (non bloquante)
    await createNotification({
      userId: user._id,
      title: '💰 Solde rechargé',
      message: `Votre solde a été rechargé de ${Number(amount).toFixed(2)} FG. Nouveau solde : ${user.balance.toFixed(2)} FG.`,
      type: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Balance rechargée avec succès',
      newBalance: user.balance,
    });
  } catch (error) {
    console.error('❌ Erreur recharge-balance:', error.message);
    res.status(500).json({ error: 'Erreur lors de la recharge de la balance' });
  }
});

// ─── Gestion des rôles et employés ───────────────────────────────────────────
router.post('/change-role', protect, admin, changeUserRole);
router.get('/employees', protect, admin, getAllEmployees);

// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services', protect, admin, async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des services' });
  }
});

router.post('/services', protect, admin, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du service' });
  }
});

router.put('/services/:id', protect, admin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ error: 'Service non trouvé' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du service' });
  }
});

router.delete('/services/:id', protect, admin, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du service' });
  }
});

// ─── Commandes ────────────────────────────────────────────────────────────────
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email role balance isActive employeeCode createdAt')
      .populate('serviceId', 'name category price')
      .lean();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Erreur chargement commandes:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des commandes' });
  }
});

router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate('userId', 'name email role balance isActive employeeCode createdAt')
      .populate('serviceId', 'name category price')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    // Notification au client selon le statut
    if (order.userId?._id) {
      const statusMessages = {
        'En attente': { title: '🕐 Commande en attente',  message: `Votre commande "${order.serviceId?.name || 'Service'}" est en attente de traitement.`, type: 'info' },
        'En cours':   { title: '⚙️ Commande en cours',    message: `Votre commande "${order.serviceId?.name || 'Service'}" est en cours de traitement.`, type: 'info' },
        'Terminé':    { title: '✅ Commande terminée',     message: `Votre commande "${order.serviceId?.name || 'Service'}" a été complétée avec succès !`, type: 'success' },
        'Annulé':     { title: '❌ Commande annulée',      message: `Votre commande "${order.serviceId?.name || 'Service'}" a été annulée.`, type: 'error' },
      };
      const notif = statusMessages[req.body.status];
      if (notif) await createNotification({ userId: order.userId._id, ...notif });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du statut' });
  }
});

// ─── Tickets ──────────────────────────────────────────────────────────────────
router.get('/tickets', protect, admin, async (req, res) => {
  try {
    const tickets = await Ticket.find({}).populate('userId', 'name email');
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des tickets' });
  }
});

// ─── Paiements ────────────────────────────────────────────────────────────────
router.get('/payments', protect, admin, async (req, res) => {
  try {
    const payments = await Payment.find({}).populate('userId', 'name email');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des paiements' });
  }
});

// ─── Licences ─────────────────────────────────────────────────────────────────
router.get('/licenses', protect, admin, async (req, res) => {
  try {
    const licenses = await License.find({}).populate('userId', 'name email');
    res.json({ success: true, data: licenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des licences' });
  }
});

// ─── Statistiques du dashboard ────────────────────────────────────────────────
router.get('/dashboard-stats', protect, admin, async (req, res) => {
  try {
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last30Days   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const allOrders = await Order.find({});

    const total      = allOrders.length;
    const completed  = allOrders.filter(o => o.status === 'Terminé').length;
    const inProgress = allOrders.filter(o => o.status === 'En cours' || o.status === 'En attente').length;
    const revenue    = allOrders
      .filter(o => o.status === 'Terminé')
      .reduce((sum, o) => sum + (o.serviceDetails?.price || o.amount || 0), 0);

    const ordersThisMonth = allOrders.filter(o => new Date(o.createdAt) >= startOfMonth).length;
    const newUsers        = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    const salesMap = {};
    allOrders
      .filter(o => o.status === 'Terminé' && new Date(o.createdAt) >= last30Days)
      .forEach(o => {
        const dateKey = new Date(o.createdAt).toISOString().slice(0, 10);
        if (!salesMap[dateKey]) salesMap[dateKey] = { date: dateKey, sales: 0 };
        salesMap[dateKey].sales += (o.serviceDetails?.price || o.amount || 0);
      });
    const salesLast30Days = Object.values(salesMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: { total, completed, inProgress, revenue, ordersThisMonth, newUsers, salesLast30Days },
    });
  } catch (err) {
    console.error('Erreur stats dashboard:', err);
    res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques' });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { admin, protect } = require('../middleware/authMiddleware');
// const User = require('../models/User');
// const { changeUserRole, getAllEmployees } = require('../controllers/roleController');
// const Service = require('../models/Service');
// const Order = require('../models/Order');
// const Ticket = require('../models/Ticket');
// const Payment = require('../models/Payment');
// const License = require('../models/License');

// // --- Utilisateurs ---
// router.get('/users', protect, admin, async (req, res) => {
//   const users = await User.find({});
//   res.json(users);
// });

// // --- Recharge de balance ---
// router.post('/recharge-balance', protect, admin, async (req, res) => {
//   try {
//     const { email, amount } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: "Cet email n'existe pas" });
//     }
//     user.balance += Number(amount);
//     await user.save();
//     res.status(200).json({
//       success: true,
//       message: "Balance rechargée avec succès",
//       newBalance: user.balance
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Erreur lors de la recharge de la balance" });
//   }
// });

// // --- Gestion des rôles et employés ---
// router.post('/change-role', protect, admin, changeUserRole);
// router.get('/employees', protect, admin, getAllEmployees);

// // --- Services ---
// router.get('/services', protect, admin, async (req, res) => {
//   const services = await Service.find({});
//   res.json(services);
// });
// router.post('/services', protect, admin, async (req, res) => {
//   const service = await Service.create(req.body);
//   res.status(201).json(service);
// });
// router.put('/services/:id', protect, admin, async (req, res) => {
//   const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.json(service);
// });
// router.delete('/services/:id', protect, admin, async (req, res) => {
//   await Service.findByIdAndDelete(req.params.id);
//   res.json({ message: 'Service supprimé' });
// });

// // --- Commandes ---
// router.get('/orders', protect, admin, async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate('userId', 'name email')
//       .populate('serviceId', 'name category price');
//     res.json({
//       success: true,
//       count: orders.length,
//       data: orders
//     });
//   } catch (error) {
//     console.error('Erreur lors du chargement des commandes:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors du chargement des commandes'
//     });
//   }
// });

// router.put('/orders/:id/status', protect, admin, async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status: req.body.status },
//       { new: true }
//     )
//       .populate('userId', 'name email')
//       .populate('serviceId', 'name category price');
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Commande non trouvée'
//       });
//     }
//     res.json({ success: true, data: order });
//   } catch (error) {
//     console.error('Erreur lors de la mise à jour du statut:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la mise à jour du statut'
//     });
//   }
// });

// // --- Tickets ---
// router.get('/tickets', protect, admin, async (req, res) => {
//   try {
//     const tickets = await Ticket.find({}).populate('userId', 'name email');
//     res.json({ success: true, data: tickets });
//   } catch (error) {
//     console.error('Erreur tickets:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors du chargement des tickets'
//     });
//   }
// });

// // --- Paiements ---
// router.get('/payments', protect, admin, async (req, res) => {
//   try {
//     const payments = await Payment.find({}).populate('userId', 'name email');
//     res.json({ success: true, data: payments });
//   } catch (error) {
//     console.error('Erreur paiements:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors du chargement des paiements'
//     });
//   }
// });

// // --- Licences ---
// router.get('/licenses', protect, admin, async (req, res) => {
//   try {
//     const licenses = await License.find({}).populate('userId', 'name email');
//     res.json({ success: true, data: licenses });
//   } catch (error) {
//     console.error('Erreur licences:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors du chargement des licences'
//     });
//   }
// });

// // --- Statistiques du dashboard ---
// router.get('/dashboard-stats', protect, admin, async (req, res) => {
//   try {
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

//     // Statuts considérés comme terminés et en attente (ancien + nouveau modèle)
//     const completedStatuses = ['completed', 'Terminé'];
//     const pendingStatuses = ['pending', 'En attente'];

//     // Revenu total depuis les commandes terminées
//     const totalRevenueFromOrders = await Order.aggregate([
//       { $match: { status: { $in: completedStatuses } } },
//       { $group: { _id: null, total: { $sum: '$amount' } } }
//     ]);

//     // Revenu total depuis les paiements réussis
//     const totalRevenueFromPayments = await Payment.aggregate([
//       { $match: { status: 'Réussi' } },
//       { $group: { _id: null, total: { $sum: '$amount' } } }
//     ]);

//     // Priorité aux paiements, sinon fallback sur les commandes
//     const totalRevenue =
//       totalRevenueFromPayments[0]?.total ||
//       totalRevenueFromOrders[0]?.total ||
//       0;

//     const ordersThisMonth = await Order.countDocuments({
//       createdAt: { $gte: startOfMonth }
//     });

//     const newUsers = await User.countDocuments({
//       createdAt: { $gte: startOfMonth }
//     });

//     const pendingOrders = await Order.countDocuments({
//       status: { $in: pendingStatuses }
//     });

//     // Ventes des 30 derniers jours
//     const salesLast30Days = await Order.aggregate([
//       {
//         $match: {
//           status: { $in: completedStatuses },
//           updatedAt: { $gte: last30Days }
//         }
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
//           sales: { $sum: { $ifNull: ['$amount', '$serviceDetails.price'] } }
//         }
//       },
//       { $sort: { _id: 1 } },
//       { $project: { date: '$_id', sales: 1, _id: 0 } }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         totalRevenue,
//         ordersThisMonth,
//         newUsers,
//         pendingOrders,
//         salesLast30Days
//       }
//     });
//   } catch (err) {
//     console.error('Erreur stats dashboard:', err);
//     res.status(500).json({
//       success: false,
//       message: "Erreur lors du calcul des statistiques"
//     });
//   }
// });

// module.exports = router;
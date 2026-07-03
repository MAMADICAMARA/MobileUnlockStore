// back/routes/adminRoutes.js
const express      = require('express');
const router       = express.Router();
const { admin, protect } = require('../middleware/authMiddleware');
const User         = require('../models/User');
const { changeUserRole, getAllEmployees } = require('../controllers/roleController');
const Service      = require('../models/Service');
const Order        = require('../models/Order');
const Ticket       = require('../models/Ticket');
const Payment      = require('../models/Payment');
const License      = require('../models/License');
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
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments({}),
    ]);

    res.json({
      success: true,
      data:    users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs' });
  }
});

// ─── Bloquer / Débloquer un utilisateur ──────────────────────────────────────
router.put('/users/:id/toggle-block', protect, admin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas bloquer votre propre compte.' });
    }
    if ((targetUser.role || '').toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Impossible de bloquer un compte administrateur.' });
    }
    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();
    console.log(`🔒 Compte ${targetUser.email} ${targetUser.isActive ? 'DÉBLOQUÉ' : 'BLOQUÉ'} par ${req.user.email}`);
    res.json({
      success:  true,
      isActive: targetUser.isActive,
      message:  targetUser.isActive ? 'Compte débloqué avec succès.' : 'Compte bloqué avec succès.',
    });
  } catch (error) {
    console.error('Erreur toggle-block:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du changement de statut du compte.' });
  }
});

// ─── Autoriser / Retirer l'accès maintenance ─────────────────────────────────
router.put('/users/:id/maintenance-access', protect, admin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    targetUser.isMaintenanceAllowed = !targetUser.isMaintenanceAllowed;
    await targetUser.save();
    console.log(`🛠️ Accès maintenance pour ${targetUser.email} : ${targetUser.isMaintenanceAllowed ? 'AUTORISÉ' : 'RETIRÉ'}`);
    res.json({
      success:              true,
      isMaintenanceAllowed: targetUser.isMaintenanceAllowed,
      message: targetUser.isMaintenanceAllowed
        ? 'Client autorisé à accéder au site pendant la maintenance.'
        : "Accès maintenance retiré pour ce client.",
    });
  } catch (error) {
    console.error('Erreur maintenance-access:', error);
    res.status(500).json({ success: false, message: "Erreur lors du changement d'accès maintenance." });
  }
});

// ─── Recharge de balance ──────────────────────────────────────────────────────
router.post('/recharge-balance', protect, admin, async (req, res) => {
  try {
    const { email, amount } = req.body;
    if (!email || !amount) {
      return res.status(400).json({ error: 'Email et montant sont requis' });
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Le montant doit être un nombre positif' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Cet email n'existe pas" });
    }

    // Corriger le rôle invalide si nécessaire
    const validRoles = ['client', 'admin', 'utilisateur-employer'];
    const updateOp = { $inc: { balance: parsedAmount } };
    if (!validRoles.includes(user.role)) {
      console.warn(`[AUDIT] Rôle invalide "${user.role}" corrigé → "client" pour ${user.email}`);
      updateOp.$set = { role: 'client' };
    }

    // $inc atomique — pas de race condition
    const updatedUser = await User.findByIdAndUpdate(user._id, updateOp, { new: true });

    await createNotification({
      userId:  updatedUser._id,
      title:   '💰 Solde rechargé',
      message: `Votre solde a été rechargé de ${new Intl.NumberFormat('fr-FR').format(parsedAmount)} FG. Nouveau solde : ${new Intl.NumberFormat('fr-FR').format(updatedUser.balance)} FG.`,
      type:    'success',
    });

    console.log(`✅ Recharge réussie: ${email} +${parsedAmount} FG → nouveau solde: ${updatedUser.balance} FG`);
    res.status(200).json({ success: true, message: 'Balance rechargée avec succès', newBalance: updatedUser.balance });
  } catch (error) {
    console.error('❌ Erreur recharge-balance:', error.message);
    res.status(500).json({ error: 'Erreur lors de la recharge de la balance' });
  }
});

// ─── Gestion des rôles et employés ───────────────────────────────────────────
router.post('/change-role', protect, admin, changeUserRole);
router.get('/employees',    protect, admin, getAllEmployees);

// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services', protect, admin, async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des services' });
  }
});

router.get('/services/:id', protect, admin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service non trouvé' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement du service' });
  }
});

router.post('/services', protect, admin, async (req, res) => {
  try {
    const {
      name, description, price, category, deliveryTime,
      imageUrl, instructions, active, fieldsRequired, metadata,
    } = req.body;
    const service = await Service.create({
      name, description, price, category, deliveryTime,
      imageUrl, instructions, active, fieldsRequired, metadata,
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du service' });
  }
});

router.put('/services/:id', protect, admin, async (req, res) => {
  try {
    const {
      name, description, price, category, deliveryTime,
      imageUrl, instructions, active, fieldsRequired, metadata,
    } = req.body;

    const updateData = {};
    if (name !== undefined)           updateData.name = name;
    if (description !== undefined)    updateData.description = description;
    if (price !== undefined)          updateData.price = price;
    if (category !== undefined)       updateData.category = category;
    if (deliveryTime !== undefined)   updateData.deliveryTime = deliveryTime;
    if (imageUrl !== undefined)       updateData.imageUrl = imageUrl;
    if (instructions !== undefined)   updateData.instructions = instructions;
    if (active !== undefined)         updateData.active = active;
    if (fieldsRequired !== undefined) updateData.fieldsRequired = fieldsRequired;
    if (metadata !== undefined)       updateData.metadata = metadata;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
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
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({})
        .populate('userId',    'name email role balance isActive employeeCode createdAt')
        .populate('serviceId', 'name category price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({}),
    ]);

    res.json({
      success: true,
      count:   orders.length,
      data:    orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erreur chargement commandes:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des commandes' });
  }
});

router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Statut requis' });
    }

    // ✅ Cas annulation : verrou optimiste — un seul admin peut réussir
    if (status === 'Annulé') {
      const cancelled = await Order.findOneAndUpdate(
        { _id: req.params.id, status: { $nin: ['Annulé', 'Remboursé'] } },
        { $set: { status: 'Annulé' } },
        { new: true }
      )
        .populate('userId',    'name email role balance isActive')
        .populate('serviceId', 'name category price');

      if (!cancelled) {
        const exists = await Order.exists({ _id: req.params.id });
        if (!exists) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
        return res.status(409).json({ success: false, message: 'Commande déjà annulée ou remboursée' });
      }

      // ✅ Remboursement atomique avec $inc
      const refundAmount = cancelled.amount || cancelled.serviceDetails?.price || 0;
      if (refundAmount > 0 && cancelled.userId) {
        await User.findByIdAndUpdate(
          cancelled.userId._id || cancelled.userId,
          { $inc: { balance: refundAmount } }
        );
        await createNotification({
          userId:  cancelled.userId._id || cancelled.userId,
          title:   '💰 Remboursement effectué',
          message: `Votre commande "${cancelled.serviceId?.name || 'Service'}" a été annulée. ${new Intl.NumberFormat('fr-FR').format(refundAmount)} FG recrédités sur votre solde. Veuillez vérifier vos informations avant de recommander.`,
          type:    'info',
        });
      }

      return res.json({ success: true, data: cancelled });
    }

    // ✅ Cas non-annulation : mise à jour simple
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    )
      .populate('userId',    'name email role balance isActive employeeCode createdAt')
      .populate('serviceId', 'name category price')
      .lean();

    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });

    if (order.userId?._id) {
      const statusMessages = {
        'En attente': { title: '🕐 Commande en attente', message: `Votre commande "${order.serviceId?.name || 'Service'}" est en attente de traitement.`, type: 'info' },
        'En cours':   { title: '⚙️ Commande en cours',   message: `Votre commande "${order.serviceId?.name || 'Service'}" est en cours de traitement.`,  type: 'info' },
        'Terminé':    { title: '✅ Commande terminée',    message: `Votre commande "${order.serviceId?.name || 'Service'}" a été complétée avec succès !`, type: 'success' },
      };
      const notif = statusMessages[status];
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

    // ✅ amount en priorité (montant réel débité, inclut les licences avec quantité)
    const revenue = allOrders
      .filter(o => o.status === 'Terminé')
      .reduce((sum, o) => sum + (o.amount || o.serviceDetails?.price || 0), 0);

    const ordersThisMonth = allOrders.filter(o => new Date(o.createdAt) >= startOfMonth).length;
    const newUsers        = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    const salesMap = {};
    allOrders
      .filter(o => o.status === 'Terminé' && new Date(o.createdAt) >= last30Days)
      .forEach(o => {
        const dateKey = new Date(o.createdAt).toISOString().slice(0, 10);
        if (!salesMap[dateKey]) salesMap[dateKey] = { date: dateKey, sales: 0 };
        salesMap[dateKey].sales += (o.amount || o.serviceDetails?.price || 0);
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

// ─── Remboursement Niveau 2 (litige technique) ────────────────────────────────
router.post('/refund', protect, admin, async (req, res) => {
  try {
    const { orderId, refundReason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'ID de commande requis' });
    }

    // ✅ Verrou optimiste : change le statut vers 'Remboursé' UNIQUEMENT si 'Terminé'
    const refunded = await Order.findOneAndUpdate(
      { _id: orderId, status: 'Terminé' },
      {
        $set: {
          status:       'Remboursé',   // ✅ 'Remboursé' et non 'Annulé'
          refundReason: refundReason || 'Litige technique — service non rendu',
          refundedAt:   new Date(),
          refundedBy:   req.user.id || req.user._id,
        },
      },
      { new: false } // ancien document pour lire le montant avant modification
    );

    if (!refunded) {
      const exists = await Order.findById(orderId).select('status').lean();
      if (!exists) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      if (exists.status === 'Remboursé') {
        return res.status(409).json({ success: false, message: 'Cette commande a déjà été remboursée' });
      }
      return res.status(400).json({
        success: false,
        message: "Seules les commandes terminées peuvent faire l'objet d'un remboursement de litige",
      });
    }

    // ✅ Crédit atomique avec $inc
    const refundAmount = refunded.amount || refunded.serviceDetails?.price || 0;
    if (refundAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Montant de remboursement invalide' });
    }

    const updatedClient = await User.findByIdAndUpdate(
      refunded.userId,
      { $inc: { balance: refundAmount } },
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Client non trouvé' });
    }

    await createNotification({
      userId:  updatedClient._id,
      title:   '💰 Remboursement de litige effectué',
      message: `Suite à votre litige, votre commande "${refunded.serviceDetails?.name || 'Service'}" a été remboursée. ${new Intl.NumberFormat('fr-FR').format(refundAmount)} FG recrédités sur votre solde.`,
      type:    'success',
    });

    res.status(200).json({
      success:    true,
      message:    'Remboursement effectué avec succès',
      newBalance: updatedClient.balance,
    });
  } catch (error) {
    console.error('❌ Erreur remboursement N2:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors du remboursement' });
  }
});


// ─── Recherche commandes ──────────────────────────────────────────────────────

// Recherche par ID MongoDB (déjà géré par getOrderById via orderRoutes)
// GET /api/orders/admin/:id — déjà existant dans orderRoutes.js

// Recherche par email client
router.get('/orders/by-email/:email', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ email: new RegExp(req.params.email, 'i') }).select('_id');
    if (!users.length) return res.json({ success: true, data: [] });
    const userIds = users.map(u => u._id);
    const orders = await Order.find({ userId: { $in: userIds } })
      .populate('userId',    'name email role balance')
      .populate('serviceId', 'name category price')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Erreur recherche par email:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
  }
});

// Recherche par transactionId
router.get('/orders/transaction/:txId', protect, admin, async (req, res) => {
  try {
    const order = await Order.findOne({ transactionId: req.params.txId })
      .populate('userId',    'name email role balance')
      .populate('serviceId', 'name category price')
      .lean();
    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
  }
});

// Recherche par IMEI (dans userSubmittedData)
router.get('/orders/imei/:imei', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({ 'userSubmittedData.imei': req.params.imei })
      .populate('userId',    'name email role balance')
      .populate('serviceId', 'name category price')
      .sort({ createdAt: -1 })
      .lean();
    if (!orders.length) return res.status(404).json({ success: false, message: 'Aucune commande trouvée pour cet IMEI' });
    res.json({ success: true, data: orders.length === 1 ? orders[0] : orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
  }
});

// Recherche par code commande (orderCode ou _id partiel)
router.get('/orders/code/:code', protect, admin, async (req, res) => {
  try {
    // Chercher par _id si c'est un ObjectId valide (24 hex)
    let order = null;
    if (/^[0-9a-fA-F]{24}$/.test(req.params.code)) {
      order = await Order.findById(req.params.code)
        .populate('userId',    'name email role balance')
        .populate('serviceId', 'name category price')
        .lean();
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
  }
});

module.exports = router;

// // back/routes/adminRoutes.js
// const express      = require('express');
// const router       = express.Router();
// const { admin, protect } = require('../middleware/authMiddleware');
// const User         = require('../models/User');
// const { changeUserRole, getAllEmployees } = require('../controllers/roleController');
// const Service      = require('../models/Service');
// const Order        = require('../models/Order');
// const Ticket       = require('../models/Ticket');
// const Payment      = require('../models/Payment');
// const License      = require('../models/License');
// const Notification = require('../models/Notification');

// // ─── Utilitaire : créer une notification (non bloquante) ─────────────────────
// const createNotification = async ({ userId, title, message, type = 'info' }) => {
//   try {
//     await Notification.create({ userId, title, message, type });
//   } catch (err) {
//     console.warn('⚠️ Notification non envoyée:', err.message);
//   }
// };

// // ─── Utilisateurs ─────────────────────────────────────────────────────────────
// router.get('/users', protect, admin, async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs' });
//   }
// });

// // ─── Bloquer / Débloquer un utilisateur ──────────────────────────────────────
// router.put('/users/:id/toggle-block', protect, admin, async (req, res) => {
//   try {
//     const targetUser = await User.findById(req.params.id);
//     if (!targetUser) {
//       return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
//     }
//     if (targetUser._id.toString() === req.user.id) {
//       return res.status(400).json({ success: false, message: 'Vous ne pouvez pas bloquer votre propre compte.' });
//     }
//     if ((targetUser.role || '').toLowerCase() === 'admin') {
//       return res.status(400).json({ success: false, message: 'Impossible de bloquer un compte administrateur.' });
//     }
//     targetUser.isActive = !targetUser.isActive;
//     await targetUser.save();
//     console.log(`🔒 Compte ${targetUser.email} ${targetUser.isActive ? 'DÉBLOQUÉ' : 'BLOQUÉ'} par ${req.user.email}`);
//     res.json({
//       success:  true,
//       isActive: targetUser.isActive,
//       message:  targetUser.isActive ? 'Compte débloqué avec succès.' : 'Compte bloqué avec succès.',
//     });
//   } catch (error) {
//     console.error('Erreur toggle-block:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors du changement de statut du compte.' });
//   }
// });

// // ─── Autoriser / Retirer l'accès maintenance ─────────────────────────────────
// router.put('/users/:id/maintenance-access', protect, admin, async (req, res) => {
//   try {
//     const targetUser = await User.findById(req.params.id);
//     if (!targetUser) {
//       return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
//     }
//     targetUser.isMaintenanceAllowed = !targetUser.isMaintenanceAllowed;
//     await targetUser.save();
//     console.log(`🛠️ Accès maintenance pour ${targetUser.email} : ${targetUser.isMaintenanceAllowed ? 'AUTORISÉ' : 'RETIRÉ'}`);
//     res.json({
//       success:              true,
//       isMaintenanceAllowed: targetUser.isMaintenanceAllowed,
//       message: targetUser.isMaintenanceAllowed
//         ? 'Client autorisé à accéder au site pendant la maintenance.'
//         : "Accès maintenance retiré pour ce client.",
//     });
//   } catch (error) {
//     console.error('Erreur maintenance-access:', error);
//     res.status(500).json({ success: false, message: "Erreur lors du changement d'accès maintenance." });
//   }
// });

// // ─── Recharge de balance ──────────────────────────────────────────────────────
// router.post('/recharge-balance', protect, admin, async (req, res) => {
//   try {
//     const { email, amount } = req.body;
//     if (!email || !amount) {
//       return res.status(400).json({ error: 'Email et montant sont requis' });
//     }
//     const parsedAmount = Number(amount);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       return res.status(400).json({ error: 'Le montant doit être un nombre positif' });
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: "Cet email n'existe pas" });
//     }

//     // Corriger le rôle invalide si nécessaire
//     const validRoles = ['client', 'admin', 'utilisateur-employer'];
//     const updateOp = { $inc: { balance: parsedAmount } };
//     if (!validRoles.includes(user.role)) {
//       console.warn(`[AUDIT] Rôle invalide "${user.role}" corrigé → "client" pour ${user.email}`);
//       updateOp.$set = { role: 'client' };
//     }

//     // $inc atomique — pas de race condition
//     const updatedUser = await User.findByIdAndUpdate(user._id, updateOp, { new: true });

//     await createNotification({
//       userId:  updatedUser._id,
//       title:   '💰 Solde rechargé',
//       message: `Votre solde a été rechargé de ${new Intl.NumberFormat('fr-FR').format(parsedAmount)} FG. Nouveau solde : ${new Intl.NumberFormat('fr-FR').format(updatedUser.balance)} FG.`,
//       type:    'success',
//     });

//     console.log(`✅ Recharge réussie: ${email} +${parsedAmount} FG → nouveau solde: ${updatedUser.balance} FG`);
//     res.status(200).json({ success: true, message: 'Balance rechargée avec succès', newBalance: updatedUser.balance });
//   } catch (error) {
//     console.error('❌ Erreur recharge-balance:', error.message);
//     res.status(500).json({ error: 'Erreur lors de la recharge de la balance' });
//   }
// });

// // ─── Gestion des rôles et employés ───────────────────────────────────────────
// router.post('/change-role', protect, admin, changeUserRole);
// router.get('/employees',    protect, admin, getAllEmployees);

// // ─── Services ─────────────────────────────────────────────────────────────────
// router.get('/services', protect, admin, async (req, res) => {
//   try {
//     const services = await Service.find({});
//     res.json(services);
//   } catch (error) {
//     res.status(500).json({ error: 'Erreur lors du chargement des services' });
//   }
// });

// router.get('/services/:id', protect, admin, async (req, res) => {
//   try {
//     const service = await Service.findById(req.params.id);
//     if (!service) return res.status(404).json({ error: 'Service non trouvé' });
//     res.json(service);
//   } catch (error) {
//     res.status(500).json({ error: 'Erreur lors du chargement du service' });
//   }
// });

// router.post('/services', protect, admin, async (req, res) => {
//   try {
//     const {
//       name, description, price, category, deliveryTime,
//       imageUrl, instructions, active, fieldsRequired, metadata,
//     } = req.body;
//     const service = await Service.create({
//       name, description, price, category, deliveryTime,
//       imageUrl, instructions, active, fieldsRequired, metadata,
//     });
//     res.status(201).json(service);
//   } catch (error) {
//     res.status(500).json({ error: 'Erreur lors de la création du service' });
//   }
// });

// router.put('/services/:id', protect, admin, async (req, res) => {
//   try {
//     const {
//       name, description, price, category, deliveryTime,
//       imageUrl, instructions, active, fieldsRequired, metadata,
//     } = req.body;

//     const updateData = {};
//     if (name !== undefined)           updateData.name = name;
//     if (description !== undefined)    updateData.description = description;
//     if (price !== undefined)          updateData.price = price;
//     if (category !== undefined)       updateData.category = category;
//     if (deliveryTime !== undefined)   updateData.deliveryTime = deliveryTime;
//     if (imageUrl !== undefined)       updateData.imageUrl = imageUrl;
//     if (instructions !== undefined)   updateData.instructions = instructions;
//     if (active !== undefined)         updateData.active = active;
//     if (fieldsRequired !== undefined) updateData.fieldsRequired = fieldsRequired;
//     if (metadata !== undefined)       updateData.metadata = metadata;

//     const service = await Service.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );
//     if (!service) return res.status(404).json({ error: 'Service non trouvé' });
//     res.json(service);
//   } catch (error) {
//     res.status(500).json({ error: 'Erreur lors de la mise à jour du service' });
//   }
// });

// router.delete('/services/:id', protect, admin, async (req, res) => {
//   try {
//     await Service.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Service supprimé' });
//   } catch (error) {
//     res.status(500).json({ error: 'Erreur lors de la suppression du service' });
//   }
// });

// // ─── Commandes ────────────────────────────────────────────────────────────────
// router.get('/orders', protect, admin, async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate('userId',    'name email role balance isActive employeeCode createdAt')
//       .populate('serviceId', 'name category price')
//       .lean();
//     res.json({ success: true, count: orders.length, data: orders });
//   } catch (error) {
//     console.error('Erreur chargement commandes:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors du chargement des commandes' });
//   }
// });

// router.put('/orders/:id/status', protect, admin, async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!status) {
//       return res.status(400).json({ success: false, message: 'Statut requis' });
//     }

//     // ✅ Cas annulation : verrou optimiste — un seul admin peut réussir
//     if (status === 'Annulé') {
//       const cancelled = await Order.findOneAndUpdate(
//         { _id: req.params.id, status: { $nin: ['Annulé', 'Remboursé'] } },
//         { $set: { status: 'Annulé' } },
//         { new: true }
//       )
//         .populate('userId',    'name email role balance isActive')
//         .populate('serviceId', 'name category price');

//       if (!cancelled) {
//         const exists = await Order.exists({ _id: req.params.id });
//         if (!exists) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
//         return res.status(409).json({ success: false, message: 'Commande déjà annulée ou remboursée' });
//       }

//       // ✅ Remboursement atomique avec $inc
//       const refundAmount = cancelled.amount || cancelled.serviceDetails?.price || 0;
//       if (refundAmount > 0 && cancelled.userId) {
//         await User.findByIdAndUpdate(
//           cancelled.userId._id || cancelled.userId,
//           { $inc: { balance: refundAmount } }
//         );
//         await createNotification({
//           userId:  cancelled.userId._id || cancelled.userId,
//           title:   '💰 Remboursement effectué',
//           message: `Votre commande "${cancelled.serviceId?.name || 'Service'}" a été annulée. ${new Intl.NumberFormat('fr-FR').format(refundAmount)} FG recrédités sur votre solde. Veuillez vérifier vos informations avant de recommander.`,
//           type:    'info',
//         });
//       }

//       return res.json({ success: true, data: cancelled });
//     }

//     // ✅ Cas non-annulation : mise à jour simple
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status } },
//       { new: true }
//     )
//       .populate('userId',    'name email role balance isActive employeeCode createdAt')
//       .populate('serviceId', 'name category price')
//       .lean();

//     if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });

//     if (order.userId?._id) {
//       const statusMessages = {
//         'En attente': { title: '🕐 Commande en attente', message: `Votre commande "${order.serviceId?.name || 'Service'}" est en attente de traitement.`, type: 'info' },
//         'En cours':   { title: '⚙️ Commande en cours',   message: `Votre commande "${order.serviceId?.name || 'Service'}" est en cours de traitement.`,  type: 'info' },
//         'Terminé':    { title: '✅ Commande terminée',    message: `Votre commande "${order.serviceId?.name || 'Service'}" a été complétée avec succès !`, type: 'success' },
//       };
//       const notif = statusMessages[status];
//       if (notif) await createNotification({ userId: order.userId._id, ...notif });
//     }

//     res.json({ success: true, data: order });
//   } catch (error) {
//     console.error('Erreur mise à jour statut:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du statut' });
//   }
// });

// // ─── Tickets ──────────────────────────────────────────────────────────────────
// router.get('/tickets', protect, admin, async (req, res) => {
//   try {
//     const tickets = await Ticket.find({}).populate('userId', 'name email');
//     res.json({ success: true, data: tickets });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Erreur lors du chargement des tickets' });
//   }
// });

// // ─── Paiements ────────────────────────────────────────────────────────────────
// router.get('/payments', protect, admin, async (req, res) => {
//   try {
//     const payments = await Payment.find({}).populate('userId', 'name email');
//     res.json({ success: true, data: payments });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Erreur lors du chargement des paiements' });
//   }
// });

// // ─── Licences ─────────────────────────────────────────────────────────────────
// router.get('/licenses', protect, admin, async (req, res) => {
//   try {
//     const licenses = await License.find({}).populate('userId', 'name email');
//     res.json({ success: true, data: licenses });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Erreur lors du chargement des licences' });
//   }
// });

// // ─── Statistiques du dashboard ────────────────────────────────────────────────
// router.get('/dashboard-stats', protect, admin, async (req, res) => {
//   try {
//     const now          = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const last30Days   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

//     const allOrders = await Order.find({});

//     const total      = allOrders.length;
//     const completed  = allOrders.filter(o => o.status === 'Terminé').length;
//     const inProgress = allOrders.filter(o => o.status === 'En cours' || o.status === 'En attente').length;

//     // ✅ amount en priorité (montant réel débité, inclut les licences avec quantité)
//     const revenue = allOrders
//       .filter(o => o.status === 'Terminé')
//       .reduce((sum, o) => sum + (o.amount || o.serviceDetails?.price || 0), 0);

//     const ordersThisMonth = allOrders.filter(o => new Date(o.createdAt) >= startOfMonth).length;
//     const newUsers        = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

//     const salesMap = {};
//     allOrders
//       .filter(o => o.status === 'Terminé' && new Date(o.createdAt) >= last30Days)
//       .forEach(o => {
//         const dateKey = new Date(o.createdAt).toISOString().slice(0, 10);
//         if (!salesMap[dateKey]) salesMap[dateKey] = { date: dateKey, sales: 0 };
//         salesMap[dateKey].sales += (o.amount || o.serviceDetails?.price || 0);
//       });
//     const salesLast30Days = Object.values(salesMap).sort((a, b) => a.date.localeCompare(b.date));

//     res.json({
//       success: true,
//       data: { total, completed, inProgress, revenue, ordersThisMonth, newUsers, salesLast30Days },
//     });
//   } catch (err) {
//     console.error('Erreur stats dashboard:', err);
//     res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques' });
//   }
// });

// // ─── Remboursement Niveau 2 (litige technique) ────────────────────────────────
// router.post('/refund', protect, admin, async (req, res) => {
//   try {
//     const { orderId, refundReason } = req.body;
//     if (!orderId) {
//       return res.status(400).json({ success: false, message: 'ID de commande requis' });
//     }

//     // ✅ Verrou optimiste : change le statut vers 'Remboursé' UNIQUEMENT si 'Terminé'
//     const refunded = await Order.findOneAndUpdate(
//       { _id: orderId, status: 'Terminé' },
//       {
//         $set: {
//           status:       'Remboursé',   // ✅ 'Remboursé' et non 'Annulé'
//           refundReason: refundReason || 'Litige technique — service non rendu',
//           refundedAt:   new Date(),
//           refundedBy:   req.user.id || req.user._id,
//         },
//       },
//       { new: false } // ancien document pour lire le montant avant modification
//     );

//     if (!refunded) {
//       const exists = await Order.findById(orderId).select('status').lean();
//       if (!exists) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
//       if (exists.status === 'Remboursé') {
//         return res.status(409).json({ success: false, message: 'Cette commande a déjà été remboursée' });
//       }
//       return res.status(400).json({
//         success: false,
//         message: "Seules les commandes terminées peuvent faire l'objet d'un remboursement de litige",
//       });
//     }

//     // ✅ Crédit atomique avec $inc
//     const refundAmount = refunded.amount || refunded.serviceDetails?.price || 0;
//     if (refundAmount <= 0) {
//       return res.status(400).json({ success: false, message: 'Montant de remboursement invalide' });
//     }

//     const updatedClient = await User.findByIdAndUpdate(
//       refunded.userId,
//       { $inc: { balance: refundAmount } },
//       { new: true }
//     );
//     if (!updatedClient) {
//       return res.status(404).json({ success: false, message: 'Client non trouvé' });
//     }

//     await createNotification({
//       userId:  updatedClient._id,
//       title:   '💰 Remboursement de litige effectué',
//       message: `Suite à votre litige, votre commande "${refunded.serviceDetails?.name || 'Service'}" a été remboursée. ${new Intl.NumberFormat('fr-FR').format(refundAmount)} FG recrédités sur votre solde.`,
//       type:    'success',
//     });

//     res.status(200).json({
//       success:    true,
//       message:    'Remboursement effectué avec succès',
//       newBalance: updatedClient.balance,
//     });
//   } catch (error) {
//     console.error('❌ Erreur remboursement N2:', error.message);
//     res.status(500).json({ success: false, message: 'Erreur lors du remboursement' });
//   }
// });


// // ─── Recherche commandes ──────────────────────────────────────────────────────

// // Recherche par ID MongoDB (déjà géré par getOrderById via orderRoutes)
// // GET /api/orders/admin/:id — déjà existant dans orderRoutes.js

// // Recherche par email client
// router.get('/orders/by-email/:email', protect, admin, async (req, res) => {
//   try {
//     const users = await User.find({ email: new RegExp(req.params.email, 'i') }).select('_id');
//     if (!users.length) return res.json({ success: true, data: [] });
//     const userIds = users.map(u => u._id);
//     const orders = await Order.find({ userId: { $in: userIds } })
//       .populate('userId',    'name email role balance')
//       .populate('serviceId', 'name category price')
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json({ success: true, data: orders });
//   } catch (error) {
//     console.error('Erreur recherche par email:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
//   }
// });

// // Recherche par transactionId
// router.get('/orders/transaction/:txId', protect, admin, async (req, res) => {
//   try {
//     const order = await Order.findOne({ transactionId: req.params.txId })
//       .populate('userId',    'name email role balance')
//       .populate('serviceId', 'name category price')
//       .lean();
//     if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
//     res.json({ success: true, data: order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
//   }
// });

// // Recherche par IMEI (dans userSubmittedData)
// router.get('/orders/imei/:imei', protect, admin, async (req, res) => {
//   try {
//     const orders = await Order.find({ 'userSubmittedData.imei': req.params.imei })
//       .populate('userId',    'name email role balance')
//       .populate('serviceId', 'name category price')
//       .sort({ createdAt: -1 })
//       .lean();
//     if (!orders.length) return res.status(404).json({ success: false, message: 'Aucune commande trouvée pour cet IMEI' });
//     res.json({ success: true, data: orders.length === 1 ? orders[0] : orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
//   }
// });

// // Recherche par code commande (orderCode ou _id partiel)
// router.get('/orders/code/:code', protect, admin, async (req, res) => {
//   try {
//     // Chercher par _id si c'est un ObjectId valide (24 hex)
//     let order = null;
//     if (/^[0-9a-fA-F]{24}$/.test(req.params.code)) {
//       order = await Order.findById(req.params.code)
//         .populate('userId',    'name email role balance')
//         .populate('serviceId', 'name category price')
//         .lean();
//     }
//     if (!order) {
//       return res.status(404).json({ success: false, message: 'Commande non trouvée' });
//     }
//     res.json({ success: true, data: order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
//   }
// });

// module.exports = router;

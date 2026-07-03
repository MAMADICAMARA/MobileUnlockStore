// back/routes/orderRoutes.js
const express  = require('express');
const router   = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Order    = require('../models/Order');
const Service  = require('../models/Service');
const User     = require('../models/User');
const Notification = require('../models/Notification');

// ─── Utilitaire notification ──────────────────────────────────────────────────
const createNotification = async ({ userId, title, message, type = 'info' }) => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (err) {
    console.warn('⚠️ Notification non envoyée:', err.message);
  }
};

// ─── Utilitaire : corriger le rôle avant save ─────────────────────────────────
const fixUserRole = (user) => {
  const validRoles = ['client', 'admin', 'utilisateur-employer'];
  if (!validRoles.includes(user.role)) {
    console.warn(`[AUDIT] Rôle invalide "${user.role}" corrigé → "client" pour ${user.email}`);
    user.role = 'client';
  }
};

// ✅ GET /api/orders/my — Commandes de l'utilisateur connecté
router.get('/my', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ userId })
      .populate('userId',    'name email balance role')
      .populate('serviceId', 'name category price deliveryTime fieldsRequired')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Erreur commandes utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de vos commandes' });
  }
});

// ✅ GET /api/orders/admin/:id — Détail complet (admin) — DOIT être avant /:id
router.get('/admin/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId',    'name email balance role createdAt isActive employeeCode')
      .populate('serviceId', 'name category price deliveryTime fieldsRequired description');

    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur détail commande admin:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de la commande' });
  }
});

// ✅ PUT /api/orders/admin/:id — Mettre à jour statut + livraison (admin)
router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const { status, deliveryData, adminNotes } = req.body;

    const updateFields = {};
    if (status)                   updateFields.status = status;
    if (deliveryData)             updateFields.deliveryData = deliveryData;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true })
      .populate('userId',    'name email balance role createdAt isActive')
      .populate('serviceId', 'name category price deliveryTime fieldsRequired');

    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur mise à jour commande:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
  }
});

// ✅ GET /api/orders/:id — Détail d'une commande (propriétaire ou admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('serviceId', 'name category price fieldsRequired');

    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });

    const userId = req.user.id || req.user._id;
    if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur détail commande:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de la commande' });
  }
});

// ✅ POST /api/orders — Créer une commande + déduire le solde
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { serviceId, userSubmittedData, quantity } = req.body;

    // Récupérer le service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // ✅ Calcul du montant final — recalculé côté serveur (sécurité)
    let finalAmount = service.price;
    let finalQty    = 1;
    if (quantity && Number(quantity) > 1) {
      finalQty    = Number(quantity);
      finalAmount = service.price * finalQty;
    }

    // Vérifier le solde
    const currentBalance = typeof user.balance === 'number' && !isNaN(user.balance)
      ? user.balance : 0;
    if (currentBalance < finalAmount) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant' });
    }

    // ✅ Corriger le rôle avant save
    fixUserRole(user);

    // Déduire le solde
    user.balance = currentBalance - finalAmount;
    await user.save();

    console.log(`💳 Commande: ${user.email} -${finalAmount} FG (qty:${finalQty}) → solde: ${user.balance} FG`);

    // ✅ Construire userSubmittedDataMetadata comme tableau d'objets (schéma Mongoose)
    const metadata = Array.isArray(service.fieldsRequired)
      ? service.fieldsRequired
          .filter(f => f && f.name && f.label)
          .map(f => ({
            name:  String(f.name),
            label: String(f.label),
            type:  String(f.type || 'text'),
          }))
      : [];

    const order = await Order.create({
      userId,
      serviceId,
      serviceDetails: {
        name:     service.name,
        price:    service.price,
        category: service.category,
      },
      userSubmittedData:         userSubmittedData || {},
      userSubmittedDataMetadata: metadata,
      amount:   finalAmount,
      quantity: finalQty,
      status:   'En attente',
    });

    // Notification de confirmation
    await createNotification({
      userId:  user._id,
      title:   '🛒 Commande confirmée',
      message: finalQty > 1
        ? `Votre commande "${service.name}" (${finalQty} crédits) a été passée. Montant débité : ${new Intl.NumberFormat('fr-FR').format(finalAmount)} FG.`
        : `Votre commande "${service.name}" a été passée. Montant débité : ${new Intl.NumberFormat('fr-FR').format(finalAmount)} FG.`,
      type: 'success',
    });

    res.status(201).json({
      success:    true,
      data:       order,
      newBalance: user.balance,
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande' });
  }
});

module.exports = router;

// // back/routes/orderRoutes.js
// const express  = require('express');
// const router   = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const Order    = require('../models/Order');
// const Service  = require('../models/Service');
// const User     = require('../models/User');
// const Notification = require('../models/Notification');

// // ─── Utilitaire notification ──────────────────────────────────────────────────
// const createNotification = async ({ userId, title, message, type = 'info' }) => {
//   try {
//     await Notification.create({ userId, title, message, type });
//   } catch (err) {
//     console.warn('⚠️ Notification non envoyée:', err.message);
//   }
// };

// // ─── Utilitaire : corriger le rôle avant save ─────────────────────────────────
// const fixUserRole = (user) => {
//   const validRoles = ['client', 'admin', 'utilisateur-employer'];
//   if (!validRoles.includes(user.role)) {
//     console.warn(`[AUDIT] Rôle invalide "${user.role}" corrigé → "client" pour ${user.email}`);
//     user.role = 'client';
//   }
// };

// // ✅ GET /api/orders/my — Commandes de l'utilisateur connecté
// router.get('/my', protect, async (req, res) => {
//   try {
//     const userId = req.user.id || req.user._id;
//     const orders = await Order.find({ userId })
//       .populate('userId',    'name email balance role')
//       .populate('serviceId', 'name category price deliveryTime fieldsRequired')
//       .sort({ createdAt: -1 });

//     res.json({ success: true, count: orders.length, data: orders });
//   } catch (error) {
//     console.error('Erreur commandes utilisateur:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors du chargement de vos commandes' });
//   }
// });

// // ✅ GET /api/orders/admin/:id — Détail complet (admin) — DOIT être avant /:id
// router.get('/admin/:id', protect, admin, async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('userId',    'name email balance role createdAt isActive employeeCode')
//       .populate('serviceId', 'name category price deliveryTime fieldsRequired description');

//     if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
//     res.json({ success: true, data: order });
//   } catch (error) {
//     console.error('Erreur détail commande admin:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors du chargement de la commande' });
//   }
// });

// // ✅ PUT /api/orders/admin/:id — Mettre à jour statut + livraison (admin)
// router.put('/admin/:id', protect, admin, async (req, res) => {
//   try {
//     const { status, deliveryData, adminNotes } = req.body;

//     const updateFields = {};
//     if (status)                   updateFields.status = status;
//     if (deliveryData)             updateFields.deliveryData = deliveryData;
//     if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

//     const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true })
//       .populate('userId',    'name email balance role createdAt isActive')
//       .populate('serviceId', 'name category price deliveryTime fieldsRequired');

//     if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
//     res.json({ success: true, data: order });
//   } catch (error) {
//     console.error('Erreur mise à jour commande:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
//   }
// });

// // ✅ GET /api/orders/:id — Détail d'une commande (propriétaire ou admin)
// router.get('/:id', protect, async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('serviceId', 'name category price fieldsRequired');

//     if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });

//     const userId = req.user.id || req.user._id;
//     if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Accès non autorisé' });
//     }

//     res.json({ success: true, data: order });
//   } catch (error) {
//     console.error('Erreur détail commande:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors du chargement de la commande' });
//   }
// });

// // ✅ POST /api/orders — Créer une commande + déduire le solde
// router.post('/', protect, async (req, res) => {
//   try {
//     const userId = req.user.id || req.user._id;
//     const { serviceId, userSubmittedData, quantity } = req.body;

//     // Récupérer le service
//     const service = await Service.findById(serviceId);
//     if (!service) {
//       return res.status(404).json({ success: false, message: 'Service non trouvé' });
//     }

//     // Récupérer l'utilisateur
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
//     }

//     // ✅ Calcul du montant final — recalculé côté serveur (sécurité)
//     let finalAmount = service.price;
//     let finalQty    = 1;
//     if (quantity && Number(quantity) > 1) {
//       finalQty    = Number(quantity);
//       finalAmount = service.price * finalQty;
//     }

//     // Vérifier le solde
//     const currentBalance = typeof user.balance === 'number' && !isNaN(user.balance)
//       ? user.balance : 0;
//     if (currentBalance < finalAmount) {
//       return res.status(400).json({ success: false, message: 'Solde insuffisant' });
//     }

//     // ✅ Corriger le rôle avant save
//     fixUserRole(user);

//     // Déduire le solde
//     user.balance = currentBalance - finalAmount;
//     await user.save();

//     console.log(`💳 Commande: ${user.email} -${finalAmount} FG (qty:${finalQty}) → solde: ${user.balance} FG`);

//     // ✅ Créer la commande SANS userSubmittedDataMetadata
//     // (ce champ cause un CastError selon le format stocké en base pour fieldsRequired)
//     const order = await Order.create({
//       userId,
//       serviceId,
//       serviceDetails: {
//         name:     service.name,
//         price:    service.price,
//         category: service.category,
//       },
//       userSubmittedData: userSubmittedData || {},
//       amount:   finalAmount,
//       quantity: finalQty,
//       status:   'en cours',
//     });

//     // Notification de confirmation
//     await createNotification({
//       userId:  user._id,
//       title:   '🛒 Commande confirmée',
//       message: finalQty > 1
//         ? `Votre commande "${service.name}" (${finalQty} crédits) a été passée. Montant débité : ${new Intl.NumberFormat('fr-FR').format(finalAmount)} FG.`
//         : `Votre commande "${service.name}" a été passée. Montant débité : ${new Intl.NumberFormat('fr-FR').format(finalAmount)} FG.`,
//       type: 'success',
//     });

//     res.status(201).json({
//       success:    true,
//       data:       order,
//       newBalance: user.balance,
//     });

//   } catch (error) {
//     console.error('Erreur création commande:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande' });
//   }
// });

// module.exports = router;
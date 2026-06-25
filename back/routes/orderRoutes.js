// back/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// ✅ GET /api/orders/my — Commandes de l'utilisateur connecté
router.get('/my', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ userId })
      .populate('userId', 'name email balance role')
      .populate('serviceId', 'name category price deliveryTime fieldsRequired')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Erreur commandes utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de vos commandes' });
  }
});

// ✅ GET /api/orders/admin/:id — Détail complet (admin) avec infos client
// ⚠️ DOIT être avant /:id
router.get('/admin/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email balance role createdAt isActive employeeCode')
      .populate('serviceId', 'name category price deliveryTime fieldsRequired description');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

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

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    )
      .populate('userId', 'name email balance role createdAt isActive')
      .populate('serviceId', 'name category price deliveryTime fieldsRequired');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

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

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

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


// ✅ POST /api/orders — Créer une commande
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { serviceId, userSubmittedData } = req.body;

    // Récupérer le service
    const service = await require('../models/Service').findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }

    // Récupérer l'utilisateur
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Vérifier le solde
    if (user.balance < service.price) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant' });
    }

    // Déduire le solde
    user.balance -= service.price;
    await user.save();

    // Créer la commande
    const order = await Order.create({
      userId,
      serviceId,
      serviceDetails: {
        name:     service.name,
        price:    service.price,
        category: service.category,
      },
      userSubmittedData: userSubmittedData || {},
      amount:  service.price,
      status: 'pending',
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

// router.post('/', protect, async (req, res) => {
//   try {
//     const userId = req.user.id || req.user._id;
//     const { serviceId, userSubmittedData, ...rest } = req.body;

//     const order = await Order.create({
//       userId,
//       serviceId,
//       userSubmittedData: userSubmittedData || {},
//       status: 'pending',
//       ...rest
//     });

//     res.status(201).json({ success: true, data: order });
//   } catch (error) {
//     console.error('Erreur création commande:', error);
//     res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande' });
//   }
// });

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
    
//     // Vérifier si l'utilisateur existe
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: "Cet email n'existe pas" });
//     }

//     // Mettre à jour la balance
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

// // --- COMMANDES ---
// // ⚠️ SECTION CORRIGÉE ⚠️
// router.get('/orders', protect, admin, async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate('userId', 'name email')  // ✅ CORRIGÉ: 'userId' au lieu de 'user'
//       .populate('serviceId', 'name category price');  // ✅ CORRIGÉ: 'serviceId' au lieu de 'service'
    
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
    
//     res.json({
//       success: true,
//       data: order
//     });
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
//     res.json({
//       success: true,
//       data: tickets
//     });
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
//     res.json({
//       success: true,
//       data: payments
//     });
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
//     res.json({
//       success: true,
//       data: licenses
//     });
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
//     const totalRevenue = await Payment.aggregate([
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);
//     const ordersThisMonth = await Order.countDocuments({
//       createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
//     });
//     const newUsers = await User.countDocuments({
//       createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
//     });
//     const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
//     res.json({
//       success: true,
//       data: {
//         totalRevenue: totalRevenue[0]?.total || 0,
//         ordersThisMonth,
//         newUsers,
//         pendingOrders
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
// back/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const Order = require('../models/Order');

// Config Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/orders'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route pour créer une commande et lister les commandes de l'utilisateur
router.route('/')
  .post(protect, placeOrder); // POST /api/orders

router.route('/my-orders')
  .get(protect, getMyOrders); // GET /api/orders/my-orders

router.route('/history').get(protect, async (req, res) => {
  try {
    // Récupère toutes les commandes du client connecté, triées par date
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('service', 'name price type')
      .lean();
    
    if (!orders) {
      return res.status(404).json({ message: "Aucune commande trouvée" });
    }
    
    res.json(orders);
  } catch (err) {
    console.error('Erreur dans /orders/history:', err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération de l'historique des commandes",
      error: err.message 
    });
  }
});

router.route('/:id/upload-document').post(protect, upload.single('document'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    order.documents.push(`/uploads/orders/${req.file.filename}`);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'upload du document" });
  }
});

module.exports = router;


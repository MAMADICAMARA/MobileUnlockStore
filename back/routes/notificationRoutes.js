const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// Créer une notification (admin ou globale)
router.post('/', protect, async (req, res) => {
  const { title, message, type, user } = req.body;
  const notification = await Notification.create({ title, message, type, user: user || null });
  res.status(201).json(notification);
});

// Récupérer toutes les notifications (admin)
router.get('/all', protect, admin, async (req, res) => {
  const notifications = await Notification.find({}).sort({ createdAt: -1 }).populate('user');
  res.json(notifications);
});

// Récupérer les notifications du client connecté
router.get('/me', protect, async (req, res) => {
  const notifications = await Notification.find({ $or: [ { user: req.user._id }, { user: null } ] }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Marquer une notification comme lue
router.put('/:id/read', protect, async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  res.json(notification);
});

// Supprimer une notification
router.delete('/:id', protect, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ message: 'Notification supprimée' });
});

module.exports = router;

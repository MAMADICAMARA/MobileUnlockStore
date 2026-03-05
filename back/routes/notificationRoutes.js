// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
// Importer les middlewares depuis authMiddleware.js et garder les noms attendus
const { protect: authenticate, admin: authorizeAdmin } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// GET /api/notifications/me - Notifications de l'utilisateur connecté
router.get('/me', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
});

// GET /api/notifications/all - Toutes les notifications (admin)
router.get('/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
});

// PUT /api/notifications/:id/read - Marquer comme lu
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    // Vérifier que la notification appartient à l'utilisateur
    if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la notification'
    });
  }
});

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    // Vérifier que la notification appartient à l'utilisateur
    if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    await notification.deleteOne();
    
    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification'
    });
  }
});

module.exports = router;
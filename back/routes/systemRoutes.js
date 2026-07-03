// back/routes/systemRoutes.js
// Routes liées à l'état global du système (maintenance).
// À monter dans app.js : app.use('/api/system', systemRoutes);

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const logger  = require('../utils/logger');
const { protect, admin } = require('../middleware/authMiddleware');
const SystemSettings = require('../models/SystemSettings');
const User = require('../models/User');

// ✅ GET /api/system/status — PUBLIC, pas de protect()
// Permet au frontend de vérifier l'état du système en polling, même
// pour un visiteur non connecté (sinon il ne saurait jamais que le site
// est en maintenance avant de tenter de se connecter).
router.get('/status', async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();

    // Lire isMaintenanceAllowed depuis la DB si un token est présent
    let isMaintenanceAllowed = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.id) {
          const user = await User.findById(decoded.id).select('isMaintenanceAllowed role');
          if (user) isMaintenanceAllowed = user.role === 'admin' || !!user.isMaintenanceAllowed;
        }
      } catch {
        // token invalide ou expiré — on ignore silencieusement
      }
    }

    res.json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      isMaintenanceAllowed,
    });
  } catch (error) {
    console.error('Erreur lecture system status:', error);
    res.json({ success: true, maintenanceMode: false, maintenanceMessage: '', isMaintenanceAllowed: false });
  }
});

// ✅ PUT /api/system/maintenance — ADMIN uniquement
router.put('/maintenance', protect, admin, async (req, res) => {
  try {
    const { enabled, message } = req.body;

    const settings = await SystemSettings.getSettings();
    settings.maintenanceMode = !!enabled;
    if (message !== undefined) settings.maintenanceMessage = message;
    settings.maintenanceActivatedAt = enabled ? new Date() : null;
    settings.maintenanceActivatedBy = enabled ? req.user.id : null;
    await settings.save();

    logger.log(`🔧 Mode maintenance ${enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'} par ${req.user.email}`);

    res.json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      message: enabled ? 'Mode maintenance activé.' : 'Mode maintenance désactivé.',
    });
  } catch (error) {
    console.error('Erreur toggle maintenance:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du changement de mode maintenance.' });
  }
});

module.exports = router;
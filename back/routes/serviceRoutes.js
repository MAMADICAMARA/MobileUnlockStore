// back/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getUserFieldsForCategory
} = require('../controllers/serviceController');

const { protect, admin } = require('../middleware/authMiddleware');

/**
 * Routes PUBLIQUES - Consultation des services
 */

// GET /api/services - Tous les services (avec filtre par category)
router.get('/', getServices);

// GET /api/services/:id - Détail d'un service
router.get('/:id', getServiceById);

// GET /api/services/category/:category/user-fields - Champs utilisateur pour une catégorie
router.get('/category/:category/user-fields', getUserFieldsForCategory);

/**
 * Routes ADMIN - Gestion des services
 */

// POST /api/admin/services - Créer un service
router.post('/', protect, admin, createService);

// PUT /api/admin/services/:id - Modifier un service
router.put('/:id', protect, admin, updateService);

// DELETE /api/admin/services/:id - Désactiver un service
router.delete('/:id', protect, admin, deleteService);

module.exports = router;
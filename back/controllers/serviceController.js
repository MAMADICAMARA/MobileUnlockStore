// back/controllers/serviceController.js
const Service = require('../models/Service');

/**
 * @desc    Récupérer tous les services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res) => {
  try {
    // Récupère tous les documents de la collection 'services'
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: `Erreur du serveur: ${error.message}` });
  }
};

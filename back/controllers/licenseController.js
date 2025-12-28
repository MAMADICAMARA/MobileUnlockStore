// back/controllers/licenseController.js
const License = require('../models/License');

/**
 * @desc    Récupérer les licences de l'utilisateur connecté
 * @route   GET /api/licenses/my-licenses
 * @access  Private
 */
exports.getMyLicenses = async (req, res) => {
  try {
    const licenses = await License.find({ user: req.user._id }).sort({ expiryDate: 1 });
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des licences.' });
  }
};

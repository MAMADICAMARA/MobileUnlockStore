// back/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Mettre à jour le nom de l'utilisateur
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  return res.status(403).json({ message: 'Modification du nom d utilisateur et de l email non autorisée.' });
};

/**
 * @desc    Changer le mot de passe de l'utilisateur
 * @route   PUT /api/users/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Veuillez fournir l ancien et le nouveau mot de passe.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Mot de passe changé avec succès.' });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe.' });
  }
};

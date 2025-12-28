const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Log utile pour vérifier le chargement du contrôleur admin (aide au debug en prod)
if (process && process.env && process.env.NODE_ENV) {
  console.info(`adminController loaded (NODE_ENV=${process.env.NODE_ENV})`);
}

// @desc    Recharger la balance d'un utilisateur
// @route   POST /api/admin/recharge-balance
// @access  Private/Admin
const rechargeUserBalance = asyncHandler(async (req, res) => {
    const { email, amount } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("Cet email n'existe pas");
    }

    // Mettre à jour la balance
    user.balance += Number(amount);
    await user.save();

    res.status(200).json({
        success: true,
        message: "Balance rechargée avec succès",
        newBalance: user.balance
    });
});

module.exports = {
    rechargeUserBalance,
};
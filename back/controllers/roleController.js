// back/controllers/roleController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Changer le rôle d'un utilisateur
 * @route   POST /api/admin/change-role
 * @access  Private/Admin
 */
const changeUserRole = asyncHandler(async (req, res) => {
    const { email, role } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("Cet email n'existe pas");
    }

    // Vérifier si le rôle est valide
    if (!['client', 'admin', 'utilisateur-employer'].includes(role)) {
        res.status(400);
        throw new Error("Rôle invalide");
    }

    // Si le nouveau rôle est utilisateur-employer, générer un code employé
    if (role === 'utilisateur-employer' && !user.employeeCode) {
        user.employeeCode = await User.generateEmployeeCode(user.name, user.email);
    }

    // Mettre à jour le rôle
    user.role = role;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Rôle mis à jour avec succès",
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            employeeCode: user.employeeCode
        }
    });
});

/**
 * @desc    Récupérer la liste des employés
 * @route   GET /api/admin/employees
 * @access  Private/Admin
 */
const getAllEmployees = asyncHandler(async (req, res) => {
    const employees = await User.find({ role: 'utilisateur-employer' })
        .select('name email employeeCode createdAt');
    
    res.status(200).json({
        success: true,
        count: employees.length,
        employees
    });
});

module.exports = {
    changeUserRole,
    getAllEmployees
};
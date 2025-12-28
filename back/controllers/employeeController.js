// back/controllers/employeeController.js
const User = require('../models/User');

/**
 * Récupérer les données de l'employé
 * @route GET /api/employee/data
 * @access Private (employés uniquement)
 */
const getEmployeeData = async (req, res) => {
  try {
    // Récupérer l'utilisateur avec son code employé
    const employee = await User.findById(req.user._id).select('employeeCode name email role');
    
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    res.json({
      employeeCode: employee.employeeCode,
      name: employee.name,
      email: employee.email,
      role: employee.role
    });
  } catch (error) {
    console.error('Erreur dans getEmployeeData:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des données de l'employé" });
  }
};

module.exports = {
  getEmployeeData
};
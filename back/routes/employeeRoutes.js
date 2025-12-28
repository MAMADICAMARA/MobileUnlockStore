// back/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Service = require('../models/Service');
const User = require('../models/User');

// Middleware pour vérifier si l'utilisateur est un employé
const checkEmployeeRole = (req, res, next) => {
    if (req.user.role !== 'utilisateur-employer') {
        res.status(403);
        throw new Error('Accès non autorisé. Réservé aux employés.');
    }
    next();
};

// Route pour récupérer les données de l'employé
router.get('/data', protect, checkEmployeeRole, async (req, res) => {
    try {
        const employeeData = await User.findById(req.user._id)
            .select('name email employeeCode role');
            
        if (!employeeData) {
            console.log('Employé non trouvé');
            return res.status(404).json({
                success: false,
                error: 'Employé non trouvé'
            });
        }
        
        // Une seule réponse envoyée
        return res.json({
            success: true,
            data: {
                name: employeeData.name,
                email: employeeData.email,
                employeeCode: employeeData.employeeCode,
                role: employeeData.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des données employé:', error);
        return res.status(500).json({ 
            success: false, 
            error: "Erreur lors de la récupération des données employé" 
        });
    }
});

// Route pour récupérer les travaux (services de type "official unlock iphone")
router.get('/works', protect, checkEmployeeRole, async (req, res) => {
    try {
        const works = await Service.find({ 
            category: 'official unlock iphone',
            // Ajoutez d'autres critères de filtrage si nécessaire
        });

        res.json({ success: true, works });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Erreur lors de la récupération des travaux" 
        });
    }
});

module.exports = router;
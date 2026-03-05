// back/controllers/serviceController.js
const Service = require('../models/Service');

/**
 * @desc    Créer un nouveau service
 * @route   POST /api/admin/services
 * @body    { name, description, price, category }
 * @access  Private (Admin only)
 */
exports.createService = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Validation
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name, description, price et category sont requis'
      });
    }

    // Validation category
    const validCategories = ['IMEI', 'Server', 'Rental', 'License'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `La catégorie doit être l'une des suivantes: ${validCategories.join(', ')}`
      });
    }

    // Vérifier l'unicité du nom
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Un service avec ce nom existe déjà'
      });
    }

    const service = await Service.create({
      name,
      description,
      price: parseFloat(price),
      category,
      active: true
    });

    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      data: service
    });
  } catch (error) {
    console.error('❌ Erreur createService:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mettre à jour un service
 * @route   PUT /api/admin/services/:id
 * @body    { name, description, price, category, active }
 * @access  Private (Admin only)
 */
exports.updateService = async (req, res) => {
  try {
    const { name, description, price, category, active } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Mettre à jour les champs
    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = parseFloat(price);
    if (category !== undefined) {
      const validCategories = ['IMEI', 'Server', 'Rental', 'License'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `La catégorie doit être l'une des suivantes: ${validCategories.join(', ')}`
        });
      }
      service.category = category;
    }
    if (active !== undefined) service.active = active;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service mis à jour avec succès',
      data: service
    });
  } catch (error) {
    console.error('❌ Erreur updateService:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour'
    });
  }
};

/**
 * @desc    Désactiver/supprimer un service
 * @route   DELETE /api/admin/services/:id
 * @access  Private (Admin only)
 */
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Soft delete : on désactive plutôt que supprimer
    service.active = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service désactivé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteService:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
};

/**
 * @desc    Récupérer tous les services (avec filtre par catégorie)
 * @route   GET /api/services
 * @query   category (optionnel): IMEI, Server, Rental, License
 *          active (optionnel): true/false
 *          page, limit
 * @access  Public
 */
exports.getServices = async (req, res) => {
  try {
    const { category, active = true, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};

    // Filtrer par catégorie si fourni
    if (category) {
      const validCategories = ['IMEI', 'Server', 'Rental', 'License'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `La catégorie doit être l'une des suivantes: ${validCategories.join(', ')}`
        });
      }
      filter.category = category;
    }

    // Par défaut, ne montrer que les services actifs
    if (active === 'false') {
      filter.active = false;
    } else {
      filter.active = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: services
    });
  } catch (error) {
    console.error('❌ Erreur getServices:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des services'
    });
  }
};

/**
 * @desc    Récupérer un service par ID
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Récupérer les champs utilisateur pour cette catégorie
    const userFields = Service.getUserFieldsForCategory(service.category);
    const deliveryFields = Service.getDeliveryFieldsForCategory(service.category);

    res.status(200).json({
      success: true,
      data: {
        ...service.toObject(),
        userFields, // Champs que l'utilisateur doit remplir
        deliveryFields // Champs que l'admin doit remplir pour livrer
      }
    });
  } catch (error) {
    console.error('❌ Erreur getServiceById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer les champs utilisateur pour une catégorie
 * @route   GET /api/services/category/:category/user-fields
 * @access  Public
 */
exports.getUserFieldsForCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const validCategories = ['IMEI', 'Server', 'Rental', 'License'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `La catégorie doit être l'une des suivantes: ${validCategories.join(', ')}`
      });
    }

    const userFields = Service.getUserFieldsForCategory(category);
    const deliveryFields = Service.getDeliveryFieldsForCategory(category);

    res.json({
      success: true,
      category,
      userFields,
      deliveryFields
    });
  } catch (error) {
    console.error('❌ Erreur getUserFieldsForCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
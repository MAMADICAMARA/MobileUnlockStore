// back/controllers/orderController.js
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { randomBytes } = require('crypto');

/**
 * @desc    Créer une nouvelle commande
 * @route   POST /api/orders
 * @access  Private (Client)
 * 
 * Workflow:
 * 1. Vérifier le service
 * 2. Récupérer l'utilisateur + vérifier balance
 * 3. Valider les données utilisateur (si applicables)
 * 4. Débiter le solde
 * 5. Créer la commande
 * 6. Envoyer confirmation email
 */
exports.placeOrder = async (req, res) => {
  const { serviceId } = req.body;
  // Défaut sûr pour éviter les erreurs si le client n'envoie pas de userSubmittedData
  const userSubmittedData = req.body.userSubmittedData || {};
  const userId = req.user._id;

  try {
    // 1. Récupérer le service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service non trouvé' 
      });
    }

    if (!service.active) {
      return res.status(400).json({ 
        success: false,
        message: 'Ce service est temporairement indisponible' 
      });
    }

    // 2. Récupérer et vérifier l'utilisateur
    const user = await User.findById(userId).select('+balance');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    // 3. Vérifier le solde
    if (user.balance < service.price) {
      return res.status(400).json({ 
        success: false,
        message: 'Solde insuffisant',
        required: service.price,
        available: user.balance,
        deficit: service.price - user.balance
      });
    }

    // ===== 🔥 SECTION CORRIGÉE =====
    // 4. Valider les données utilisateur selon les fieldsRequired du service
    const requiredFields = service.fieldsRequired || []; // ← CORRECTION ICI
    const userDataToStore = {};
    const validationErrors = [];

    for (const field of requiredFields) {
      const value = userSubmittedData ? userSubmittedData[field.name] : null;

      // Vérifier les champs requis
      if (field.required && (!value || value.toString().trim() === '')) {
        validationErrors.push(`Le champ ${field.label} est requis`);
        continue;
      }

      if (value) {
        // Validation regex si applicable
        if (field.validation) {
          try {
            const regex = new RegExp(field.validation);
            if (!regex.test(value.toString())) {
              validationErrors.push(`Le format du champ ${field.label} est invalide`);
              continue;
            }
          } catch (regexError) {
            console.error(`❌ Regex invalide pour ${field.name}:`, field.validation);
          }
        }

        // Validation spécifique IMEI (15 chiffres)
        if (field.name === 'imei') {
          const imeiRegex = /^[0-9]{15}$/;
          if (!imeiRegex.test(value.toString())) {
            validationErrors.push('L\'IMEI doit contenir exactement 15 chiffres');
            continue;
          }
        }

        // Validation email
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.toString())) {
            validationErrors.push(`Format d'email invalide pour ${field.label}`);
            continue;
          }
        }

        // Validation nombre
        if (field.type === 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            validationErrors.push(`Le champ ${field.label} doit être un nombre valide`);
            continue;
          }
          
          if (field.min !== undefined && numValue < field.min) {
            validationErrors.push(`Le champ ${field.label} doit être supérieur ou égal à ${field.min}`);
            continue;
          }
          
          if (field.max !== undefined && numValue > field.max) {
            validationErrors.push(`Le champ ${field.label} doit être inférieur ou égal à ${field.max}`);
            continue;
          }
        }

        // Validation URL
        if (field.type === 'url') {
          try {
            new URL(value.toString());
          } catch {
            validationErrors.push(`Le champ ${field.label} doit être une URL valide`);
            continue;
          }
        }

        userDataToStore[field.name] = value;
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationErrors
      });
    }
    // ===== FIN SECTION CORRIGÉE =====

    // 5. Débiter le solde immédiatement
    user.balance -= service.price;
    await user.save();

    // 6. Générer transactionId unique
    const transactionId = `TXN-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    // 7. Préparer les métadonnées des champs soumis
    const userSubmittedDataMetadata = requiredFields.map(field => ({
      name: field.name,
      label: field.label,
      type: field.type
    }));

    // 8. Créer la commande
    const order = await Order.create({
      userId,
      serviceId,
      serviceDetails: {
        name: service.name,
        price: service.price,
        category: service.category
      },
      userSubmittedData: userDataToStore,
      userSubmittedDataMetadata,
      deliveryData: {}, // Sera rempli par l'admin
      amount: service.price,
      transactionId,
      status: 'pending' // Nouvelle commande = toujours pending au départ
    });

    // 9. Envoyer l'email de confirmation
    try {
      const fieldsDisplay = userSubmittedDataMetadata
        .map(meta => {
          const value = userDataToStore[meta.name];
          // Masquer les données sensibles
          let displayValue = value;
          if (meta.name === 'imageUrl') {
            displayValue = '<em>[Lien image fourni]</em>';
          }
          if (meta.name === 'password') {
            displayValue = '••••••••';
          }
          return `<li><strong>${meta.label}:</strong> ${displayValue}</li>`;
        })
        .join('');

      await sendEmail({
        email: user.email,
        subject: `Confirmation de votre commande - ${service.name}`,
        html: `
          <h1 style="color: #333;">Bonjour ${user.name},</h1>
          <p style="font-size: 16px;">Votre commande a été passée avec succès et le montant a été débité de votre solde.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #2563eb; margin-top: 0;">Récapitulatif</h2>
            <p><strong>Service:</strong> ${service.name}</p>
            <p><strong>Prix débité:</strong> ${service.price}€</p>
            <p><strong>Nouveau solde:</strong> ${user.balance}€</p>
            <p><strong>Numéro de transaction:</strong> ${transactionId}</p>
            
            ${fieldsDisplay ? `
              <h3 style="margin-top: 20px;">Informations fournies :</h3>
              <ul style="list-style: none; padding-left: 0;">
                ${fieldsDisplay}
              </ul>
            ` : '<p><em>Aucune donnée supplémentaire fournie</em></p>'}
          </div>
          
          <p>Votre commande est en cours de traitement. Vous serez notifié par email dès qu'elle sera complétée.</p>
          <p><strong>Statut actuel:</strong> En attente de traitement</p>
          <p>Merci pour votre confiance.</p>
        `,
      });
    } catch (emailError) {
      console.error("❌ Erreur envoi email confirmation:", emailError);
    }

    console.log(`✅ Commande créée: ${transactionId} - ${service.name} (${service.category})`);

    res.status(201).json({
      success: true,
      message: 'Commande passée avec succès et solde débité',
      order: {
        _id: order._id,
        transactionId: order.transactionId,
        serviceCategory: order.serviceDetails.category,
        serviceName: order.serviceDetails.name,
        servicePrice: order.serviceDetails.price,
        status: order.status,
        createdAt: order.createdAt
      },
      newBalance: user.balance
    });

  } catch (error) {
    console.error('❌ Erreur placeOrder:', error);
    
    // Si une erreur survient après débit, on doit la signaler
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la commande',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Récupérer les commandes de l'utilisateur (avec filtre par catégorie)
 * @route   GET /api/orders/my
 * @query   category (optionnel): IMEI, Server, Rental, License
 * @access  Private (Client)
 */
exports.getMyOrders = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id };

    if (category) {
      filter['serviceDetails.category'] = category;
    }
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('serviceId', 'name description'),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    console.error('❌ Erreur getMyOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer le détail d'une commande
 * @route   GET /api/orders/:id
 * @access  Private (Client - voir seulement sa commande)
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    .populate('serviceId', 'name category description price')
    .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée ou accès refusé'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Erreur getOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Annuler une commande (remboursement)
 * @route   DELETE /api/orders/:id
 * @access  Private (Client)
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Seules les commandes en attente peuvent être annulées
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Seules les commandes en attente (pending) peuvent être annulées'
      });
    }

    // Rembourser l'utilisateur
    const user = await User.findById(req.user._id);
    user.balance += order.amount;
    await user.save();

    // Marquer comme annulée
    order.status = 'cancelled';
    order.adminNotes = 'Annulée par l\'utilisateur';
    await order.save();

    res.json({
      success: true,
      message: 'Commande annulée et solde remboursé',
      newBalance: user.balance
    });
  } catch (error) {
    console.error('❌ Erreur cancelOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @desc    Récupérer toutes les commandes (avec filtres par catégorie, statut, etc.)
 * @route   GET /api/admin/orders
 * @query   category, status, page, limit, search
 * @access  Private (Admin only)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const {
      category,
      status,
      page = 1,
      limit = 20,
      search,
      dateFrom,
      dateTo
    } = req.query;

    const filter = {};

    // Filtre par catégorie
    if (category) {
      filter['serviceDetails.category'] = category;
    }

    // Filtre par statut
    if (status) {
      filter.status = status;
    }

    // Recherche par transactionId ou IMEI
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { 'userSubmittedData.imei': { $regex: search, $options: 'i' } }
      ];
    }

    // Filtre par date
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .populate('serviceId', 'name category price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    console.error('❌ Erreur getAllOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Récupérer le détail d'une commande (admin)
 * @route   GET /api/admin/orders/:id
 * @access  Private (Admin only)
 */
exports.getAdminOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email balance')
      .populate('serviceId', 'name category description price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Erreur getAdminOrderDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Mettre à jour le statut et les données de livraison d'une commande
 * @route   PUT /api/admin/orders/:id
 * @body    { status, deliveryData, adminNotes }
 * @access  Private (Admin only)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryData, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Validation: status doit être valide
    if (status && !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Mettre à jour le statut
    if (status) {
      order.status = status;
    }

    // Mettre à jour les données de livraison si fournies
    if (deliveryData) {
      order.deliveryData = deliveryData;
    }

    // Mettre à jour les notes admin
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    // Envoyer notification email si complétée
    if (order.status === 'completed') {
      try {
        const user = await User.findById(order.userId);
        const service = await Service.findById(order.serviceId);

        let deliveryInfo = '';
        if (order.deliveryData && Object.keys(order.deliveryData).length > 0) {
          deliveryInfo = '<h3 style="color: #2563eb;">Informations de livraison :</h3><ul style="list-style: none; padding-left: 0;">';
          
          for (const [key, value] of Object.entries(order.deliveryData)) {
            // Masquer les données sensibles (partiellement)
            let displayValue = value;
            if (key === 'password' && value.length > 4) {
              displayValue = value.substring(0, 2) + '*'.repeat(Math.max(0, value.length - 4)) + value.substring(value.length - 2);
            }
            if (key === 'activationKey' && value.length > 8) {
              displayValue = value.substring(0, 4) + '*'.repeat(Math.max(0, value.length - 8)) + value.substring(value.length - 4);
            }
            
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            deliveryInfo += `<li style="margin: 10px 0;"><strong>${label}:</strong> ${displayValue}</li>`;
          }
          deliveryInfo += '</ul>';
        }

        await sendEmail({
          email: user.email,
          subject: `Votre commande "${service.name}" est complétée!`,
          html: `
            <h1 style="color: #22c55e;">Commande Complétée ✓</h1>
            <p style="font-size: 16px;">Bonjour ${user.name},</p>
            <p>Votre commande a été traitée avec succès et est maintenant prête!</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #22c55e; margin: 20px 0;">
              <p><strong>Service:</strong> ${service.name}</p>
              <p><strong>Catégorie:</strong> ${service.category}</p>
              ${deliveryInfo}
            </div>
            
            <p>Vous pouvez consulter votre commande dans votre espace client.</p>
            <p style="color: #666; font-size: 14px;">Numéro de transaction: ${order.transactionId}</p>
          `
        });
      } catch (emailError) {
        console.error('❌ Erreur envoi email completion:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Commande mise à jour',
      data: order
    });
  } catch (error) {
    console.error('❌ Erreur updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Obtenir les statistiques des commandes
 * @route   GET /api/admin/orders/stats
 * @access  Private (Admin only)
 */
exports.getOrderStats = async (req, res) => {
  try {
    // Stats globales par statut
    const statsByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    // Stats par catégorie
    const statsByCategory = await Order.aggregate([
      {
        $group: {
          _id: '$serviceDetails.category',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    // Commandes du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Order.aggregate([
      {
        $match: { createdAt: { $gte: today } }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: statsByStatus,
        byCategory: statsByCategory,
        today: todayStats[0] || { count: 0, revenue: 0 },
        pending: await Order.countDocuments({ status: 'pending' }),
        processing: await Order.countDocuments({ status: 'processing' }),
        completed: await Order.countDocuments({ status: 'completed' }),
        cancelled: await Order.countDocuments({ status: 'cancelled' })
      }
    });
  } catch (error) {
    console.error('❌ Erreur getOrderStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
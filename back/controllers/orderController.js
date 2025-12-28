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
 */
exports.placeOrder = async (req, res) => {
  const { serviceId, fields, employeeCode } = req.body;
  const userId = req.user._id; // Vient du middleware `protect`

  try {
    // 1. Récupérer le service et l'utilisateur
    const service = await Service.findById(serviceId);
    const user = await User.findById(userId).select('name email balance');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    let assignedEmployee = null;
    
    // Vérifier le code employé si fourni
    if (employeeCode) {
      // Vérifier si le service est de type "official unlock iphone"
      if (service.category !== 'official unlock iphone') {
        return res.status(400).json({ 
          message: 'Le code employé ne peut être utilisé que pour les services de déverrouillage officiel.' 
        });
      }

      const employee = await User.findOne({ 
        employeeCode, 
        role: 'utilisateur-employer' 
      });

      if (!employee) {
        return res.status(400).json({ message: 'Code employé invalide.' });
      }

      if (service.category !== 'official unlock iphone') {
        return res.status(400).json({ 
          message: 'Le code employé ne peut être utilisé que pour les services de déblocage officiel iPhone'
        });
      }

      assignedEmployee = employee._id;
    }

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé.' });
    }

    // 2. Vérifier si le solde est suffisant
    if (user.balance < service.price) {
      return res.status(400).json({ message: 'Solde insuffisant. Veuillez recharger votre compte.' });
    }

    // 3. Débiter le solde de l'utilisateur
    user.balance -= service.price;
    await user.save();

    // 4. Générer un code de commande unique
    const orderCode = `CMD-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;

    // 4. Créer la nouvelle commande
    const order = await Order.create({
      orderCode,
      user: userId,
      service: serviceId,
      serviceDetails: {
        name: service.name,
        price: service.price,
      },
      fields,
      employeeCode,
      assignedEmployee,
      status: assignedEmployee ? 'Assigné' : 'En cours', // Nouveau statut si un employé est assigné
    });

    // 5. Envoyer l'e-mail de confirmation au client
    try {
      await sendEmail({
        email: user.email,
        subject: `Confirmation de votre commande #${orderCode}`,
        html: `
          <h1>Bonjour ${user.name},</h1>
          <p>Votre commande a été passée avec succès.</p>
          <p>Votre code de commande est : <strong>${orderCode}</strong></p>
          <p>Vous pouvez utiliser ce code pour suivre votre commande.</p>
          <p>Merci pour votre confiance.</p>
        `,
      });
    } catch (emailError) {
      console.error("L'e-mail de confirmation n'a pas pu être envoyé:", emailError);
      // Ne pas bloquer la réponse au client même si l'e-mail échoue
    }

    // Nettoyer l'objet order pour le client
    const orderResponse = {
      _id: order._id,
      orderCode: order.orderCode,
      createdAt: order.createdAt
    };

    res.status(201).json({
      message: 'Commande passée avec succès !',
      order: orderResponse,
      newBalance: user.balance,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur lors de la création de la commande.' });
  }
};

/**
 * @desc    Récupérer les commandes de l'utilisateur connecté
 * @route   GET /api/orders/my-orders
 * @access  Private (Client)
 */
exports.getMyOrders = async (req, res) => {
  try {
    // Récupérer les commandes de l'utilisateur et trier par date de création (plus récent d'abord)
    const userOrders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('orderCode serviceDetails status fields createdAt')
      .lean();
    
    res.json(userOrders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur du serveur lors de la récupération des commandes.' });
  }
};

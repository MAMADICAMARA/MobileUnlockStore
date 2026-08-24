// back/controllers/providerController.js
const axios = require('axios');
const Provider        = require('../models/Provider');
const ProviderService = require('../models/ProviderService');
const Order           = require('../models/Order');
const { encrypt, decrypt } = require('../utils/encryption');
const { sendOrderToProvider, notifyUser } = require('../services/providerService');

// Ne jamais renvoyer la clé API chiffrée au frontend
const sanitizeProvider = (provider) => {
  const obj = provider.toObject ? provider.toObject() : provider;
  if (obj.apiConfig) obj.apiConfig = { ...obj.apiConfig, apiKey: undefined, hasApiKey: true };
  return obj;
};

// ════════════════════════════════════════════════════════════════════════
// FOURNISSEURS
// ════════════════════════════════════════════════════════════════════════

exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({}).sort({ createdAt: -1 });
    const withCounts = await Promise.all(providers.map(async (p) => {
      const linkedServices = await ProviderService.countDocuments({ providerId: p._id });
      return { ...sanitizeProvider(p), linkedServices };
    }));
    res.json({ success: true, data: withCounts });
  } catch (error) {
    console.error('Erreur getAllProviders:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des fournisseurs' });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });
    res.json({ success: true, data: sanitizeProvider(provider) });
  } catch (error) {
    console.error('Erreur getProviderById:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du fournisseur' });
  }
};

exports.createProvider = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.apiConfig?.apiKey) {
      return res.status(400).json({ success: false, message: 'La clé API est requise.' });
    }
    payload.apiConfig = { ...payload.apiConfig, apiKey: encrypt(payload.apiConfig.apiKey) };

    const provider = await Provider.create(payload);
    res.status(201).json({ success: true, data: sanitizeProvider(provider) });
  } catch (error) {
    console.error('Erreur createProvider:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ce slug est déjà utilisé par un autre fournisseur.' });
    }
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de la création du fournisseur' });
  }
};

exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });

    const payload = { ...req.body };

    // Ne re-chiffrer/écraser la clé API que si une nouvelle valeur en clair est fournie
    if (payload.apiConfig) {
      const newApiKey = payload.apiConfig.apiKey;
      const mergedApiConfig = { ...provider.apiConfig.toObject(), ...payload.apiConfig };
      mergedApiConfig.apiKey = newApiKey
        ? encrypt(newApiKey)
        : provider.apiConfig.apiKey;
      payload.apiConfig = mergedApiConfig;
    }

    Object.assign(provider, payload);
    await provider.save();
    res.json({ success: true, data: sanitizeProvider(provider) });
  } catch (error) {
    console.error('Erreur updateProvider:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du fournisseur' });
  }
};

exports.deleteProvider = async (req, res) => {
  try {
    const linked = await ProviderService.countDocuments({ providerId: req.params.id });
    if (linked > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer : ${linked} service(s) sont encore associés à ce fournisseur.`,
      });
    }
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });
    res.json({ success: true, message: 'Fournisseur supprimé' });
  } catch (error) {
    console.error('Erreur deleteProvider:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du fournisseur' });
  }
};

exports.testProviderConnection = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });

    const apiKey = decrypt(provider.apiConfig.apiKey);
    const { authType, authHeader } = provider.apiConfig;
    const headers = authType === 'bearer'
      ? { Authorization: `Bearer ${apiKey}` }
      : authType === 'basic'
        ? { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` }
        : { [authHeader || 'X-API-Key']: apiKey };

    const response = await axios.get(provider.apiConfig.baseUrl, { headers, timeout: 10000, validateStatus: () => true });

    if (response.status >= 200 && response.status < 500) {
      return res.json({ success: true, message: `✅ Connexion réussie (HTTP ${response.status})` });
    }
    res.json({ success: false, message: `❌ Erreur : HTTP ${response.status}` });
  } catch (error) {
    res.json({ success: false, message: `❌ Erreur : ${error.message}` });
  }
};

// ════════════════════════════════════════════════════════════════════════
// ASSOCIATIONS SERVICE ↔ FOURNISSEUR
// ════════════════════════════════════════════════════════════════════════

exports.getAllProviderServices = async (req, res) => {
  try {
    const links = await ProviderService.find({})
      .populate('serviceId', 'name category')
      .populate('providerId', 'name isActive')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (error) {
    console.error('Erreur getAllProviderServices:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des associations' });
  }
};

exports.createProviderService = async (req, res) => {
  try {
    const link = await ProviderService.create(req.body);
    const populated = await link.populate([
      { path: 'serviceId', select: 'name category' },
      { path: 'providerId', select: 'name isActive' },
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Erreur createProviderService:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ce service est déjà associé à ce fournisseur.' });
    }
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de la création de l\'association' });
  }
};

exports.updateProviderService = async (req, res) => {
  try {
    const link = await ProviderService.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('serviceId', 'name category')
      .populate('providerId', 'name isActive');
    if (!link) return res.status(404).json({ success: false, message: 'Association non trouvée' });
    res.json({ success: true, data: link });
  } catch (error) {
    console.error('Erreur updateProviderService:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'association' });
  }
};

exports.deleteProviderService = async (req, res) => {
  try {
    const link = await ProviderService.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Association non trouvée' });
    res.json({ success: true, message: 'Association supprimée' });
  } catch (error) {
    console.error('Erreur deleteProviderService:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'association' });
  }
};

// ════════════════════════════════════════════════════════════════════════
// TABLEAU DE BORD — commandes automatiques
// ════════════════════════════════════════════════════════════════════════

exports.getProviderOrders = async (req, res) => {
  try {
    const { providerId, status, page = 1, limit = 20 } = req.query;
    const filter = { providerId: { $exists: true, $ne: null } };
    if (providerId) filter.providerId = providerId;
    if (status)     filter.status   = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .populate('providerId', 'name retryConfig')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Erreur getProviderOrders:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des commandes' });
  }
};

exports.retryProviderOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });

    const link = await ProviderService.findOne({ serviceId: order.serviceId, isActive: true }).populate('providerId');
    if (!link) return res.status(400).json({ success: false, message: 'Aucun fournisseur associé à ce service.' });

    await sendOrderToProvider(order, link);
    res.json({ success: true, message: 'Commande renvoyée au fournisseur.' });
  } catch (error) {
    console.error('Erreur retryProviderOrder:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du renvoi de la commande' });
  }
};

exports.refundProviderOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('providerId');
    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    if (order.status === 'Remboursé') {
      return res.status(400).json({ success: false, message: 'Cette commande est déjà remboursée.' });
    }

    const User = require('../models/User');
    const user = await User.findById(order.userId);
    if (user) {
      user.balance += order.amount;
      await user.save();
    }
    order.status = 'Remboursé';
    await order.save();

    await notifyUser({
      userId: order.userId,
      title: '💸 Commande remboursée',
      message: `Votre commande "${order.serviceDetails?.name || 'Service'}" a été remboursée par l'administrateur.`,
      type: 'warning',
    });

    res.json({ success: true, message: 'Commande remboursée.', newBalance: user?.balance });
  } catch (error) {
    console.error('Erreur refundProviderOrder:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du remboursement' });
  }
};

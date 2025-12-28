// back/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware pour protéger les routes.
 * Vérifie la présence et la validité d'un token JWT dans l'en-tête Authorization.
 * 
 * Format attendu de l'en-tête :
 * Authorization: Bearer <token_jwt>
 * 
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Vérifier si l'en-tête Authorization existe et commence par "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extraire le token de l'en-tête (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];
    }

    // Si aucun token n'est trouvé
    if (!token) {
      console.warn('❌ Tentative d\'accès sans token');
      return res.status(401).json({ 
        status: 'error',
        message: 'Non autorisé, pas de token fourni. Veuillez vous connecter.' 
      });
    }

    try {
      // Décoder et vérifier le token en utilisant la clé secrète du .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Vérifier que le token contient un ID utilisateur
      if (!decoded.id) {
        console.error('❌ Token décodé sans ID utilisateur');
        return res.status(401).json({ 
          status: 'error',
          message: 'Token invalide.' 
        });
      }

      // Rechercher l'utilisateur dans la base de données
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.warn(`❌ Utilisateur non trouvé pour ID: ${decoded.id}`);
        return res.status(401).json({ 
          status: 'error',
          message: 'Utilisateur non trouvé.' 
        });
      }

      // Attacher l'utilisateur à l'objet de la requête (sans le mot de passe)
      // Cela rend les informations de l'utilisateur disponibles dans tous les contrôleurs
      req.user = user;

      // ✅ Passer au contrôleur de la route suivante
      next();

    } catch (jwtError) {
      // Le token est invalide ou expiré
      console.error('❌ Erreur JWT:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          status: 'error',
          message: 'Token expiré. Veuillez vous reconnecter.' 
        });
      }

      return res.status(401).json({ 
        status: 'error',
        message: 'Token invalide. Veuillez vous reconnecter.' 
      });
    }

  } catch (error) {
    console.error('❌ Erreur du middleware de protection:', error.message);
    return res.status(500).json({ 
      status: 'error',
      message: 'Erreur serveur lors de la vérification du token.' 
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur.
 * DOIT être utilisé APRÈS le middleware `protect`.
 * 
 * @param {Object} req - Objet de requête Express (doit contenir req.user)
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
const admin = (req, res, next) => {
  try {
    // Vérifier que l'utilisateur existe et a le rôle 'admin'
    if (req.user && req.user.role === 'admin') {
      console.log(`✅ Accès admin accordé pour: ${req.user.email}`);
      next();
    } else {
      console.warn(`❌ Accès admin refusé pour: ${req.user?.email || 'utilisateur inconnu'}`);
      return res.status(403).json({ 
        status: 'error',
        message: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.' 
      });
    }
  } catch (error) {
    console.error('❌ Erreur du middleware admin:', error.message);
    return res.status(500).json({ 
      status: 'error',
      message: 'Erreur serveur lors de la vérification des permissions.' 
    });
  }
};

module.exports = { protect, admin };

// back/middleware/authMiddleware.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status:  'error',
        message: 'Non autorisé, pas de token fourni. Veuillez vous connecter.',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.id) {
        return res.status(401).json({ status: 'error', message: 'Token invalide.' });
      }

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Utilisateur non trouvé.' });
      }

      const userObj = user.toObject();
      const normalizedRole = (userObj.role || '').toLowerCase();

      // ✅ BLOCAGE CIBLÉ — compte suspendu par un admin
      // isActive existe déjà dans le modèle User, on le réutilise tel quel.
      if (userObj.isActive === false) {
        return res.status(403).json({
          status: 'error',
          code: 'ACCOUNT_BLOCKED',
          message: 'Votre compte a été suspendu par l\'administrateur. Veuillez contacter le support pour plus d\'informations.',
        });
      }

      // ✅ BLOCAGE GLOBAL — mode maintenance, sauf admins et clients épargnes
      if (normalizedRole !== 'admin' && !userObj.isMaintenanceAllowed) {
        try {
          const settings = await SystemSettings.getSettings();
          if (settings.maintenanceMode) {
            return res.status(503).json({
              status: 'error',
              code: 'MAINTENANCE_MODE',
              message: settings.maintenanceMessage,
            });
          }
        } catch (settingsErr) {
          console.error('Erreur vérification maintenance:', settingsErr.message);
        }
      }

      req.user = {
        ...userObj,
        _id:  user._id,
        id:   user._id.toString(),
        role: normalizedRole,
      };

      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'error', message: 'Token expiré. Veuillez vous reconnecter.' });
      }
      return res.status(401).json({ status: 'error', message: 'Token invalide. Veuillez vous reconnecter.' });
    }

  } catch (error) {
    console.error('❌ Erreur middleware protect:', error.message);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la vérification du token.' });
  }
};

const admin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      console.warn(`❌ Accès admin refusé: ${req.user?.email} (rôle: ${req.user?.role})`);
      return res.status(403).json({
        status:  'error',
        message: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.',
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la vérification des permissions.' });
  }
};

module.exports = { protect, admin };


// // back/middleware/authMiddleware.js
// const jwt  = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   try {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       return res.status(401).json({
//         status:  'error',
//         message: 'Non autorisé, pas de token fourni. Veuillez vous connecter.',
//       });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       if (!decoded.id) {
//         return res.status(401).json({ status: 'error', message: 'Token invalide.' });
//       }

//       const user = await User.findById(decoded.id).select('-password');

//       if (!user) {
//         return res.status(401).json({ status: 'error', message: 'Utilisateur non trouvé.' });
//       }

//       const userObj = user.toObject();

//       // ✅ Normaliser le rôle en minuscule pour comparaisons cohérentes
//       req.user = {
//         ...userObj,
//         _id:  user._id,
//         id:   user._id.toString(),
//         role: (userObj.role || '').toLowerCase(),
//       };

//       next();

//     } catch (jwtError) {
//       if (jwtError.name === 'TokenExpiredError') {
//         return res.status(401).json({ status: 'error', message: 'Token expiré. Veuillez vous reconnecter.' });
//       }
//       return res.status(401).json({ status: 'error', message: 'Token invalide. Veuillez vous reconnecter.' });
//     }

//   } catch (error) {
//     console.error('❌ Erreur middleware protect:', error.message);
//     return res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la vérification du token.' });
//   }
// };

// const admin = (req, res, next) => {
//   try {
//     if (req.user && req.user.role === 'admin') {
//       next();
//     } else {
//       console.warn(`❌ Accès admin refusé: ${req.user?.email} (rôle: ${req.user?.role})`);
//       return res.status(403).json({
//         status:  'error',
//         message: 'Accès refusé. Seuls les administrateurs peuvent accéder à cette ressource.',
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la vérification des permissions.' });
//   }
// };

// module.exports = { protect, admin };
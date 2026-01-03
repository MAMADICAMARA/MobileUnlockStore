require('dotenv').config(); // Charger les variables d'environnement en premier
const express = require('express');
const morgan = require('morgan'); // Pour le logging des requêtes HTTP

const app = express();

// Importation des fichiers de routes
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const supportRoutes = require('./routes/supportRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

/**
 * ✅ CORS SUPPRIMÉ - géré UNIQUEMENT dans server.js
 * Middlewares essentiels seulement
 */
app.use(morgan('dev')); // Logging des requêtes HTTP
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de santé et de test
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Page racine informative pour debug
app.get('/', (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>API - GSM Guinea Unlock Store</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2rem; background:#f7fafc; color:#2d3748 }
          a { color:#2b6cb0 }
          .box { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); max-width:800px }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>GSM Guinea Unlock Store - Backend</h1>
          <p>Server environment: <strong>${process.env.NODE_ENV || 'development'}</strong></p>
          <ul>
            <li><a href="/api">/api (API root)</a></li>
            <li><a href="/health">/health (healthcheck)</a></li>
            <li>Frontend dev: <a href="http://localhost:5173" target="_blank">localhost:5173</a> | <a href="http://localhost:5174" target="_blank">localhost:5174</a></li>
          </ul>
          <p>CORS géré globalement dans server.js</p>
        </div>
      </body>
    </html>
  `);
});

// Route de test et healthcheck de l'API
app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/auth', '/api/services', '/api/users', '/api/orders',
      '/api/licenses', '/api/payments', '/api/support'
    ]
  });
});

// Route publique de résumé du tableau de bord
// Essaie de récupérer des métriques réelles depuis la BDD via les modèles disponibles.
// Tolérante : si un modèle est absent ou une erreur survient, on renvoie 0 pour la métrique.
app.get('api/dashboard', async (req, res, next) => {
  try {
    const summary = {
      usersCount: 0,
      servicesCount: 0,
      ordersCount: 0,
      totalAmount: 0
    };

    // User count
    try {
      const User = require('./models/User');
      summary.usersCount = await User.countDocuments({});
    } catch (err) {
      console.warn('Dashboard: unable to read User model or count:', err.message);
    }

    // Service count
    try {
      // tenter plusieurs chemins possibles si le projet utilise un autre nom de fichier
      let Service;
      try { Service = require('./models/Service'); } catch(e1) { Service = require('./models/Services'); }
      if (Service) summary.servicesCount = await Service.countDocuments({});
    } catch (err) {
      console.warn('Dashboard: unable to read Service model or count:', err.message);
    }

    // Order count and total amount (si champ amount présent)
    try {
      let Order;
      try { Order = require('./models/Order'); } catch(e2) { Order = require('./models/Orders'); }
      if (Order) {
        summary.ordersCount = await Order.countDocuments({});
        try {
          const agg = await Order.aggregate([{ $group: { _id: null, totalAmount: { $sum: '$amount' } } }]);
          summary.totalAmount = (agg && agg[0] && agg[0].totalAmount) ? agg[0].totalAmount : 0;
        } catch (inner) {
          // si aggregate échoue, laisser totalAmount à 0
          console.warn('Dashboard: Order aggregate failed:', inner.message);
          summary.totalAmount = 0;
        }
      }
    } catch (err) {
      console.warn('Dashboard: unable to read Order model or count:', err.message);
    }

    // Toujours renvoyer un 200 avec les valeurs disponibles (zéro par défaut)
    console.log('/api/dashboard hit — summary:', summary);
    return res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('Unexpected error while building dashboard summary:', error);
    return next(error);
  }
});

// ✅ Routes API - CORS déjà appliqué dans server.js
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  const errorResponse = {
    status: 'error',
    message: isProduction ? 'Une erreur est survenue sur le serveur' : err.message,
    ...(!isProduction && { 
      stack: err.stack,
      details: err.details
    })
  };

  res.status(statusCode).json(errorResponse);
});

// Export de l'application
module.exports = app;

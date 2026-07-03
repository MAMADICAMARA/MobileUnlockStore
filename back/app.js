// back/app.js
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const authRoutes    = require('./routes/authRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const systemRoutes  = require('./routes/systemRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const supportRoutes = require('./routes/supportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://mobile-unlock-store.vercel.app',
      'https://mobileunlockstore-frontend.onrender.com',
      'http://localhost:5173',
      'http://localhost:5174',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué pour: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Preflight OPTIONS ───────────────────────────────────────────────────────
app.options('*', cors());

// ─── Parsers ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
// Auth — strict : 10 tentatives / 15 minutes par IP (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
  // ✅ Toujours ajouter les headers CORS même sur les réponses 429
  handler: (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    });
  },
  skip: (req) => req.method === 'OPTIONS', // ne pas limiter les preflight
});

// API général — 200 requêtes / minute par IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { success: false, message: 'Trop de requêtes. Réessayez dans un instant.' },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.method === 'OPTIONS',
});

// ⚠️ Appliquer authLimiter AVANT les routes auth
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api',               apiLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'MobileUnlockStore API', version: '1.0.0' });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/services',      serviceRoutes);
app.use('/api/system',        systemRoutes);
app.use('/api/licenses',      licenseRoutes);
app.use('/api/support',       supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments',      paymentRoutes);

// ─── Fichiers statiques (uploads) ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status:  'error',
    message: 'Route non trouvée',
    path:    req.originalUrl,
    method:  req.method,
  });
});

// ─── Gestionnaire d'erreurs global ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err.message);
  res.status(err.status || 500).json({
    status:  'error',
    message: err.message || 'Erreur interne du serveur',
  });
});

module.exports = app;
// require('dotenv').config();
// const express = require('express');
// const morgan  = require('morgan');

// const app = express();

// // Importation des fichiers de routes
// const authRoutes         = require('./routes/authRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const adminRoutes        = require('./routes/adminRoutes');
// const serviceRoutes      = require('./routes/serviceRoutes');
// const employeeRoutes     = require('./routes/employeeRoutes');
// const orderRoutes        = require('./routes/orderRoutes');
// const userRoutes         = require('./routes/userRoutes');
// const supportRoutes      = require('./routes/supportRoutes');
// const licenseRoutes      = require('./routes/licenseRoutes');
// const paymentRoutes      = require('./routes/paymentRoutes');
// const systemRoutes       = require('./routes/systemRoutes');

// // ─── Middlewares essentiels ───────────────────────────────────────────────────
// // Note : helmet et rate-limit sont appliqués dans server.js (couche extérieure)
// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use('/api/system', systemRoutes);

// // Middleware de santé et de test
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Server is healthy',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // Page racine informative pour debug
// app.get('/', (req, res) => {
//   res.send(`
//     <!doctype html>
//     <html>
//       <head>
//         <meta charset="utf-8" />
//         <title>API - GSM Guinea Unlock Store</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 2rem; background:#f7fafc; color:#2d3748 }
//           a { color:#2b6cb0 }
//           .box { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); max-width:800px }
//         </style>
//       </head>
//       <body>
//         <div class="box">
//           <h1>GSM Guinea Unlock Store - Backend</h1>
//           <p>Server environment: <strong>${process.env.NODE_ENV || 'development'}</strong></p>
//           <ul>
//             <li><a href="/api">/api (API root)</a></li>
//             <li><a href="/health">/health (healthcheck)</a></li>
//             <li>Frontend dev: <a href="http://localhost:5173" target="_blank">localhost:5173</a> | <a href="http://localhost:5174" target="_blank">localhost:5174</a></li>
//           </ul>
//           <p>CORS géré globalement dans server.js</p>
//         </div>
//       </body>
//     </html>
//   `);
// });

// // Les statistiques du dashboard sont disponibles via GET /api/admin/dashboard-stats (protégé admin).

// // ✅ Routes API - CORS déjà appliqué dans server.js
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/licenses', licenseRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/support', supportRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/employee', employeeRoutes);
// app.use('/api/admin', adminRoutes);

// // Gestion des erreurs 404
// app.use('*', (req, res) => {
//   res.status(404).json({
//     status: 'error',
//     message: 'Route non trouvée',
//     path: req.originalUrl,
//     method: req.method
//   });
// });

// // Gestion des erreurs globales
// app.use((err, req, res, next) => {
//   console.error('Global Error Handler:', err.stack);
  
//   const statusCode = err.statusCode || 500;
//   const isProduction = process.env.NODE_ENV === 'production';
  
//   const errorResponse = {
//     status: 'error',
//     message: isProduction ? 'Une erreur est survenue sur le serveur' : err.message,
//     ...(!isProduction && { 
//       stack: err.stack,
//       details: err.details
//     })
//   };

//   res.status(statusCode).json(errorResponse);
// });

// // Export de l'application
// module.exports = app;

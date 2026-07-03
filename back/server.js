const dotenv = require('dotenv');
dotenv.config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Création de l'app
const app = express();

// Connexion DB
connectDB().catch(err => {
  console.error('❌ MongoDB:', err);
  process.exit(1);
});

// ─── Sécurité HTTP headers ────────────────────────────────────────────────────
app.use(helmet());

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Brute-force : 10 tentatives max / 15 min sur login et register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// Protection générale : 200 req / min sur toute l'API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { success: false, message: 'Trop de requêtes. Réessayez dans un instant.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api',               apiLimiter);

// ─── CORS global ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://mobile-unlock-store.vercel.app',
    'https://mobileunlockstore-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes (montage de app.js) ───────────────────────────────────────────────
const appRoutes = require('./app');
app.use(appRoutes);

// ─── Gestionnaire d'erreurs global (couche server.js) ────────────────────────
// Attrape les erreurs non gérées par app.js, notamment :
//   - body-parser : JSON malformé ou Content-Type: application/json avec body vide
//   - toute erreur qui remonte jusqu'à la couche extérieure
// Sans ce handler, Express affiche une page HTML par défaut au lieu de JSON.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Corps de requête JSON invalide.' });
  }
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Erreur serveur.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

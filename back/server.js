const dotenv = require('dotenv');
dotenv.config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
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
// ✅ Géré uniquement dans app.js (évite la double limitation avec des compteurs
// distincts qui épuisait le quota en partageant login+register sur un seul seau).

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

  // ─── Services automatiques fournisseurs (polling + retry) ──────────────────
  const { startPolling }      = require('./services/pollingService');
  const { startRetryService } = require('./services/retryService');
  startPolling();
  startRetryService();

  // ─── Providers de paiement connus (pré-créés, inactifs par défaut) ─────────
  const { seedPaymentProviders } = require('./controllers/paymentProviderController');
  seedPaymentProviders()
    .then(() => console.log('✅ Providers de paiement initialisés (PayDunya, CinetPay, Binance Pay, Stripe)'))
    .catch(err => console.error('❌ Erreur seed providers de paiement:', err.message));
});

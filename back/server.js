const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Création de l'app
const app = express();

// Connexion DB
connectDB().catch(err => {
  console.error('❌ MongoDB:', err);
  process.exit(1);
});

// CORS global
app.use(cors({
  origin: ['https://mobile-unlock-store.vercel.app', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

console.log('✅ CORS OK: https://mobile-unlock-store.vercel.app');

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 👉 IMPORT ET MONTAGE DE app.js
const appRoutes = require('./app');
app.use(appRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

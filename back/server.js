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
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

console.log('✅ CORS OK: localhost:5173,5174');

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 👉 IMPORT ET MONTAGE DE app.js
const appRoutes = require('./app');
app.use(appRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});

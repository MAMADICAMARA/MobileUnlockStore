// back/config/db.js
const mongoose = require('mongoose');

/**
 * Établit la connexion à la base de données MongoDB en utilisant l'URI
 * définie dans les variables d'environnement.
 */
const connectDB = async () => {
  try {
    // Tente de se connecter à la base de données
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Affiche un message de succès si la connexion est établie
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Affiche une erreur et quitte le processus en cas d'échec
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

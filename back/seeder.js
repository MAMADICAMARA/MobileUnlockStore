// back/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Charger les modèles
const User = require('./models/User');
const Service = require('./models/Service');

// Charger les données de test
const users = require('./data/users'); // Vous pouvez créer ce fichier si besoin
const services = require('./data/services');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

/**
 * Importe les données de test dans la base de données.
 */
const importData = async () => {
  try {
    // Vider les collections existantes
    await User.deleteMany();
    await Service.deleteMany();

    // Insérer les données
    // await User.insertMany(users); // Décommentez si vous avez un fichier users.js
    await Service.insertMany(services);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Supprime toutes les données des collections.
 */
const destroyData = async () => {
  try {
    // Vider les collections
    await User.deleteMany();
    await Service.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Logique pour exécuter la bonne fonction en fonction de l'argument de la ligne de commande
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

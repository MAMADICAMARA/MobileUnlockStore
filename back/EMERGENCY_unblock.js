// ⚠️ FICHIER TEMPORAIRE D'URGENCE — à supprimer après usage
// back/EMERGENCY_unblock.js
//
// Utilisation :
// 1. Placez ce fichier dans le dossier back/
// 2. Dans le terminal, exécutez : node EMERGENCY_unblock.js
// 3. Une fois le message de succès affiché, SUPPRIMEZ ce fichier

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const SystemSettings = require('./models/SystemSettings');

const EMAIL_ADMIN = "mamadicamara566@gmail.com"; // ← modifiez cette ligne

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    const user = await User.findOneAndUpdate(
      { email: EMAIL_ADMIN },
      { $set: { isActive: true } },
      { new: true }
    );

    if (user) {
      console.log(`✅ Compte débloqué : ${user.email} — isActive: ${user.isActive}`);
    } else {
      console.log(`❌ Aucun utilisateur trouvé avec l'email : ${EMAIL_ADMIN}`);
    }

    const settings = await SystemSettings.getSettings();
    settings.maintenanceMode = false;
    await settings.save();
    console.log('✅ Mode maintenance désactivé');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
}

fix();
// back/scripts/migrateStatuses.js
// À exécuter UNE SEULE FOIS : node back/scripts/migrateStatuses.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connecté à MongoDB');

  const Order = require('../models/Order');

  const map = {
    'pending':    'en cours',
    'processing': 'En cours',
    'completed':  'Terminé',
    'cancelled':  'Annulé',
  };

  for (const [oldStatus, newStatus] of Object.entries(map)) {
    const result = await Order.updateMany(
      { status: oldStatus },
      { $set: { status: newStatus } }
    );
    console.log(`${oldStatus} → ${newStatus} : ${result.modifiedCount} commande(s) migrée(s)`);
  }

  console.log('✅ Migration terminée');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Erreur migration:', err);
  process.exit(1);
});
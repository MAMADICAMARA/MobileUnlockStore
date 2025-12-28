// back/data/services.js

// Ces données seront utilisées par le seeder pour peupler la base de données.
const services = [
  {
    name: 'Samsung FRP Remove by IMEI',
    description: 'Suppression du compte Google (FRP) pour tous les modèles Samsung via IMEI. Service rapide et fiable.',
    price: 25.50,
    deliveryTime: '5-15 min',
    type: 'IMEI',
    requiredFields: ['imei'],
  },
  {
    name: 'iPhone Carrier Unlock - AT&T USA',
    description: 'Déblocage officiel de l\'opérateur AT&T pour les iPhones (tous modèles). Permet d\'utiliser n\'importe quelle carte SIM.',
    price: 80.00,
    deliveryTime: '24-48h',
    type: 'IMEI',
    requiredFields: ['imei'],
  },
  {
    name: 'Licence Logiciel Pro (1 an)',
    description: 'Activation d\'une licence d\'un an pour notre logiciel de diagnostic avancé. Mises à jour incluses.',
    price: 50.00,
    deliveryTime: 'Instantané',
    type: 'Licence',
    requiredFields: [],
  },
  {
    name: 'Assistance Remote - 30 minutes',
    description: 'Session d\'assistance à distance de 30 minutes avec un technicien pour résoudre vos problèmes logiciels.',
    price: 40.00,
    deliveryTime: 'Sur RDV',
    type: 'Remote',
    requiredFields: ['computer_os', 'problem_description'],
  },
  {
    name: 'Xiaomi Mi Account Remove',
    description: 'Suppression définitive du compte Mi pour les appareils Xiaomi bloqués. Service via code de déverrouillage.',
    price: 35.00,
    deliveryTime: '1-2h',
    type: 'IMEI',
    requiredFields: ['unlock_code'],
  },
];

module.exports = services;

// back/services/payment/index.js
// Router vers le module d'intégration du bon provider, par slug.
const paydunya   = require('./paydunya');
const cinetpay    = require('./cinetpay');
const binancepay  = require('./binancepay');
const stripe      = require('./stripe');

const modules = { paydunya, cinetpay, binancepay, stripe };

const getPaymentService = (slug) => {
  const service = modules[slug];
  if (!service) throw new Error(`Aucune intégration disponible pour le provider "${slug}".`);
  return service;
};

module.exports = { getPaymentService };

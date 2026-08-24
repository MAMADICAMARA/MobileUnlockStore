// back/services/payment/stripe.js
// Intégration Stripe Checkout. Source vérifiée : docs.stripe.com/checkout/quickstart
// (SDK Node officiel "stripe").
// ⚠️ Stripe ne supporte pas le GNF (franc guinéen) — le montant est converti
// dans la devise du provider (limits.currency, ex: "USD") via
// limits.exchangeRateToProviderCurrency, configuré par l'admin.
const Stripe = require('stripe');

// ─── Initier un paiement ────────────────────────────────────────────────────
const initiate = async ({ transaction, provider, apiKeys }) => {
  const stripe = Stripe(apiKeys.key2); // Secret Key
  const currency = (transaction.currency || 'USD').toLowerCase();
  const amountInCents = Math.round((transaction.amountInProviderCurrency || transaction.amountCharged) * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency,
        product_data: { name: 'Recharge solde MobileUnlockStore' },
        unit_amount: amountInCents,
      },
      quantity: 1,
    }],
    // provider.config.returnUrl contient déjà ?ref=... (voir withRef() dans
    // paymentController.js) — on ajoute session_id avec le bon séparateur.
    success_url: `${provider.config.returnUrl}${provider.config.returnUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  provider.config.cancelUrl,
    metadata: { internalRef: transaction.internalRef },
  });

  return {
    paymentUrl:      session.url,
    providerRef:      session.id,
    providerOrderId:  session.id,
    raw:              session,
  };
};

// ─── Vérifier le statut manuellement ────────────────────────────────────────
const checkStatus = async ({ transaction, apiKeys }) => {
  const stripe = Stripe(apiKeys.key2);
  const session = await stripe.checkout.sessions.retrieve(transaction.providerOrderId);
  const status = session.payment_status === 'paid' ? 'completed'
    : session.status === 'expired' ? 'failed' : 'pending';
  return { status, raw: session };
};

// ─── Vérifier un webhook entrant ────────────────────────────────────────────
// Nécessite le corps BRUT (non parsé en JSON) — voir req.rawBody, capturé
// globalement dans back/app.js via l'option `verify` de express.json().
const verifyWebhook = ({ rawBody, headers, apiKeys }) => {
  const stripe = Stripe(apiKeys.key2);
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, headers['stripe-signature'], apiKeys.webhookSecret);
  } catch (err) {
    return { valid: false, error: err.message };
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const status = session.payment_status === 'paid' ? 'completed' : 'failed';
    return { valid: true, internalRef: session.metadata?.internalRef, status, raw: event };
  }

  // Autre type d'événement Stripe — signature valide, mais rien à traiter.
  return { valid: true, internalRef: null, status: 'ignored', raw: event };
};

module.exports = { initiate, checkStatus, verifyWebhook };

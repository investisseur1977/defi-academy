const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { plan } = req.body;

const priceId = plan === 'monthly' 
  ? 'price_1Tomb6Bi6rAFPbiggA6VfiA0'
  : 'price_1TombQBi6rAFPbigySpnTrxY';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?premium=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
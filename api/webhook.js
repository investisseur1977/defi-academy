const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  // Use rawBody for Vercel
  const body = req.rawBody || JSON.stringify(req.body);

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const { error } = await supabase.from('payments').insert([{
      email: session.customer_email,
      session_id: session.id,
      plan: session.metadata?.plan || 'monthly',
      status: 'completed'
    }]);

    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('✅ Payment saved to Supabase:', session.id);
    }
  }

  res.status(200).json({ received: true });
};

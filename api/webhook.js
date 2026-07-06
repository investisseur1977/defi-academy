import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Save to Supabase
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

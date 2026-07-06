const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, plan } = req.body;

  try {
    await resend.emails.send({
      from: 'DeFi Academy <noreply@defiAcademy.com>',
      to: email,
      subject: '✅ Payment Confirmed - Welcome to DeFi Academy',
      html: `
        <h2>Welcome to DeFi Academy!</h2>
        <p>Your payment of $${plan === 'monthly' ? '9.99' : '99'} has been confirmed.</p>
        <p>You now have access to all 8 modules:</p>
        <ul>
          <li>Tokens & Swaps</li>
          <li>Liquidity Pools & LPs</li>
          <li>Yield Farming Mastery</li>
          <li>Risk Management</li>
          <li>Advanced Strategies</li>
          <li>DeFi Case Studies</li>
        </ul>
        <p><a href="https://defi-academy-28ft.vercel.app/">Start Learning →</a></p>
      `
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
};

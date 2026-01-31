import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const validPassword = process.env.AUTH_PASSWORD;

    if (!validPassword) {
      return res.status(500).json({ success: false, error: 'Auth not configured' });
    }

    if (password !== validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    // Generate a session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    // In a real app, you'd store this token in a database
    // For simplicity, we'll use a signed token that includes the expiry
    const tokenData = JSON.stringify({ token, expiry });
    const signature = crypto
      .createHmac('sha256', validPassword)
      .update(tokenData)
      .digest('hex');

    const sessionToken = Buffer.from(`${tokenData}:${signature}`).toString('base64');

    res.status(200).json({
      success: true,
      token: sessionToken,
      expiresAt: expiry
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

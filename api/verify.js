import crypto from 'crypto';

export function verifyToken(token) {
  try {
    if (!token) return false;

    const validPassword = process.env.AUTH_PASSWORD;
    if (!validPassword) return false;

    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [tokenData, signature] = decoded.split(':');

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', validPassword)
      .update(tokenData)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    // Check expiry
    const { expiry } = JSON.parse(tokenData);
    if (Date.now() > expiry) return false;

    return true;
  } catch (error) {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const isValid = verifyToken(token);

  res.status(200).json({ valid: isValid });
}

export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    model: 'gemini-3-flash-preview',
    timestamp: new Date().toISOString()
  });
}

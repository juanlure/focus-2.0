import rateLimit from 'express-rate-limit';

// Rate limiter for Gemini API endpoints (expensive operations)
export const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 requests per minute per IP
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.',
    retryAfter: 60
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if behind proxy, otherwise use IP
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

// Stricter limiter for file uploads (more resource intensive)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 file uploads per minute
  message: {
    success: false,
    error: 'Demasiados archivos subidos. Por favor, espera un momento.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API limiter (less strict)
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Límite de solicitudes excedido.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

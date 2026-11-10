/**
 * Simple in-memory rate limiter middleware.
 *
 * Tracks request counts per IP address within a sliding time window.
 * No external dependencies (Redis, etc.) required.
 *
 * @param {Object} options
 * @param {number} options.windowMs   - Time window in milliseconds (default 60 000 = 1 min)
 * @param {number} options.maxRequests - Max requests per IP in the window (default 100)
 */
const rateLimiter = ({ windowMs = 60_000, maxRequests = 100 } = {}) => {
  // Map<string, { count: number, resetTime: number }>
  const clients = new Map();

  // Periodically purge expired entries to avoid memory leaks
  const CLEANUP_INTERVAL_MS = windowMs * 2;
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of clients) {
      if (now > data.resetTime) {
        clients.delete(ip);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node process to exit even if the timer is still active
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    let clientData = clients.get(ip);

    // First request or window expired — reset
    if (!clientData || now > clientData.resetTime) {
      clientData = { count: 1, resetTime: now + windowMs };
      clients.set(ip, clientData);
    } else {
      clientData.count++;
    }

    // Attach rate-limit headers (informational)
    const remaining = Math.max(0, maxRequests - clientData.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

    if (clientData.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterMs: clientData.resetTime - now,
        },
      });
    }

    next();
  };
};

module.exports = rateLimiter;

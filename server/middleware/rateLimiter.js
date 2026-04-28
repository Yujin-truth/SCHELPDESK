// Simple in-memory rate limiter
const requests = {};

const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests[ip]) {
      requests[ip] = [];
    }

    // Remove old requests outside the window
    requests[ip] = requests[ip].filter(time => now - time < windowMs);

    if (requests[ip].length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requests[ip][0] + windowMs - now) / 1000),
      });
    }

    requests[ip].push(now);
    next();
  };
};

module.exports = rateLimit;

// src/middleware/cartRateLimiter.js
import rateLimit from 'express-rate-limit';

export const cartRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 10,                  // max 10 requests per windowMs
  message: 'Too many cart actions from this IP, please try again later',
  standardHeaders: true,     // Return rate limit info in headers
  legacyHeaders: false,      // Disable old headers
});

export default cartRateLimiter;
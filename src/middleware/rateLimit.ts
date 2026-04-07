import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// 10 requests / minute / IP
export const ipLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: 'Too many requests from this IP. Blocked.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5 requests / minute / Authenticated User
export const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  message: { error: 'Too many requests for this account. Blocked.' },
  keyGenerator: (req: Request) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

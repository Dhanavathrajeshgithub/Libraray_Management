// middleware/rateLimit.js
import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

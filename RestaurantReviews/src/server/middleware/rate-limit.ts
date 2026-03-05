import rateLimit from "express-rate-limit";

// General API: generous limit
export function createApiLimiter() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, slow down" },
  });
}

// Exercise endpoints spawn subprocesses — tighter limit
export function createExerciseLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many exercise requests, slow down" },
  });
}

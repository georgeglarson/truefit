import express from "express";
import cors from "cors";
import helmet from "helmet";
import type Database from "better-sqlite3";
import { migrate } from "./db/schema.js";
import { usersRouter } from "./routes/users.js";
import { restaurantsRouter } from "./routes/restaurants.js";
import { reviewsRouter } from "./routes/reviews.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createApiLimiter, createExerciseLimiter } from "./middleware/rate-limit.js";
import { cashRegisterRouter } from "./exercises/cash-register.js";
import { missingNumberRouter } from "./exercises/missing-number.js";
import { morseCodeRouter } from "./exercises/morse-code.js";
import { onScreenKeyboardRouter } from "./exercises/on-screen-keyboard.js";
import { gildedRoseRouter } from "./exercises/gilded-rose.js";

export function createApp(db: Database.Database): express.Express {
  migrate(db);

  const app = express();

  // Trust first proxy (nginx, load balancer) so rate limiting uses real client IP
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
    })
  );
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "64kb" }));
  app.use("/api", createApiLimiter());

  // RestaurantReviews CRUD
  app.use("/api/users", usersRouter(db));
  app.use("/api/restaurants", restaurantsRouter(db));
  app.use("/api/reviews", reviewsRouter(db));

  // Exercise proxies (tighter rate limit — these spawn subprocesses)
  app.use("/api/exercises", createExerciseLimiter());
  app.use("/api/exercises/cash-register", cashRegisterRouter());
  app.use("/api/exercises/missing-number", missingNumberRouter());
  app.use("/api/exercises/morse-code", morseCodeRouter());
  app.use("/api/exercises/on-screen-keyboard", onScreenKeyboardRouter());
  app.use("/api/exercises/gilded-rose", gildedRoseRouter());

  app.use(errorHandler);

  return app;
}

import { Router } from "express";
import type Database from "better-sqlite3";
import { ReviewModel } from "../models/review.js";
import { UserModel } from "../models/user.js";
import { RestaurantModel } from "../models/restaurant.js";
import { parseId } from "./validate.js";

export function reviewsRouter(db: Database.Database): Router {
  const router = Router();
  const reviews = new ReviewModel(db);
  const users = new UserModel(db);
  const restaurants = new RestaurantModel(db);

  router.post("/", (req, res, next) => {
    try {
      const { userId, restaurantId, rating, body } = req.body;

      if (userId == null || restaurantId == null || rating == null) {
        res.status(400).json({ error: "userId, restaurantId, and rating are required" });
        return;
      }

      const numUserId = Number(userId);
      const numRestaurantId = Number(restaurantId);
      const numRating = Number(rating);

      if (isNaN(numUserId) || isNaN(numRestaurantId) || isNaN(numRating)) {
        res.status(400).json({ error: "userId, restaurantId, and rating must be numbers" });
        return;
      }

      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({ error: "rating must be an integer from 1 to 5" });
        return;
      }

      const user = users.findById(numUserId);
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      if (user.blocked) {
        res.status(403).json({ error: "user is blocked" });
        return;
      }

      const restaurant = restaurants.findById(numRestaurantId);
      if (!restaurant) {
        res.status(404).json({ error: "restaurant not found" });
        return;
      }

      const review = reviews.create(
        numUserId,
        numRestaurantId,
        numRating,
        typeof body === "string" ? body : ""
      );
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  });

  router.get("/", (req, res, next) => {
    try {
      const { userId, restaurantId } = req.query;

      if (userId) {
        const id = Number(userId);
        if (isNaN(id)) {
          res.status(400).json({ error: "invalid userId" });
          return;
        }
        res.json(reviews.findByUserIdWithNames(id));
        return;
      }

      if (restaurantId) {
        const id = Number(restaurantId);
        if (isNaN(id)) {
          res.status(400).json({ error: "invalid restaurantId" });
          return;
        }
        res.json(reviews.findByRestaurantIdWithNames(id));
        return;
      }

      res.json(reviews.findAllWithNames());
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "review");
      if (id === null) return;

      const review = reviews.findById(id);
      if (!review) {
        res.status(404).json({ error: "review not found" });
        return;
      }

      res.json(review);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "review");
      if (id === null) return;

      const { rating, body } = req.body;

      if (rating == null) {
        res.status(400).json({ error: "rating is required" });
        return;
      }

      const numRating = Number(rating);

      if (isNaN(numRating)) {
        res.status(400).json({ error: "rating must be a number" });
        return;
      }

      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({ error: "rating must be an integer from 1 to 5" });
        return;
      }

      const existing = reviews.findById(id);
      if (!existing) {
        res.status(404).json({ error: "review not found" });
        return;
      }

      const review = reviews.update(id, numRating, typeof body === "string" ? body : existing.body);
      res.json(review);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "review");
      if (id === null) return;

      const deleted = reviews.deleteById(id);
      if (!deleted) {
        res.status(404).json({ error: "review not found" });
        return;
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

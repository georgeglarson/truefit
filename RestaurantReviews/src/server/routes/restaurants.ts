import { Router } from "express";
import type Database from "better-sqlite3";
import { RestaurantModel } from "../models/restaurant.js";

export function restaurantsRouter(db: Database.Database): Router {
  const router = Router();
  const restaurants = new RestaurantModel(db);

  router.get("/", (req, res, next) => {
    try {
      const { city } = req.query;

      if (city && typeof city === "string") {
        const results = restaurants.findByCity(city);
        res.json(results);
        return;
      }

      res.json(restaurants.findAll());
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid restaurant id" });
        return;
      }

      const restaurant = restaurants.findById(id);
      if (!restaurant) {
        res.status(404).json({ error: "restaurant not found" });
        return;
      }

      res.json(restaurant);
    } catch (err) {
      next(err);
    }
  });

  router.post("/", (req, res, next) => {
    try {
      const { name, city, cuisine } = req.body;

      if (!name || !city) {
        res.status(400).json({ error: "name and city are required" });
        return;
      }

      if (typeof name !== "string" || typeof city !== "string") {
        res.status(400).json({ error: "name and city must be strings" });
        return;
      }

      const trimmedName = name.trim();
      const trimmedCity = city.trim();

      if (!trimmedName || !trimmedCity) {
        res.status(400).json({ error: "name and city must not be blank" });
        return;
      }

      const restaurant = restaurants.create(
        trimmedName,
        trimmedCity,
        typeof cuisine === "string" ? cuisine.trim() : ""
      );
      res.status(201).json(restaurant);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid restaurant id" });
        return;
      }

      const { name, city, cuisine } = req.body;

      if (!name || !city) {
        res.status(400).json({ error: "name and city are required" });
        return;
      }

      if (typeof name !== "string" || typeof city !== "string") {
        res.status(400).json({ error: "name and city must be strings" });
        return;
      }

      const trimmedName = name.trim();
      const trimmedCity = city.trim();

      if (!trimmedName || !trimmedCity) {
        res.status(400).json({ error: "name and city must not be blank" });
        return;
      }

      const existing = restaurants.findById(id);
      if (!existing) {
        res.status(404).json({ error: "restaurant not found" });
        return;
      }

      const restaurant = restaurants.update(
        id,
        trimmedName,
        trimmedCity,
        typeof cuisine === "string" ? cuisine.trim() : ""
      );
      res.json(restaurant);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid restaurant id" });
        return;
      }

      const existing = restaurants.findById(id);
      if (!existing) {
        res.status(404).json({ error: "restaurant not found" });
        return;
      }

      try {
        const deleted = restaurants.deleteById(id);
        if (!deleted) {
          res.status(404).json({ error: "restaurant not found" });
          return;
        }
        res.status(204).send();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : String(err);
        if (msg.includes("FOREIGN KEY constraint failed")) {
          res.status(409).json({
            error: "cannot delete restaurant with existing reviews",
          });
          return;
        }
        throw err;
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
}

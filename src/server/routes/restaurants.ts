import { Router } from "express";
import type Database from "better-sqlite3";
import { RestaurantModel } from "../models/restaurant.js";
import { parseId, requireStrings, deleteWithFKCheck } from "./validate.js";

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
      const id = parseId(req, res, "restaurant");
      if (id === null) return;

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
      const fields = requireStrings(res, {
        name: req.body.name,
        city: req.body.city,
      });
      if (!fields) return;

      const cuisine = req.body.cuisine;
      const restaurant = restaurants.create(
        fields.name,
        fields.city,
        typeof cuisine === "string" ? cuisine.trim() : ""
      );
      res.status(201).json(restaurant);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "restaurant");
      if (id === null) return;

      const fields = requireStrings(res, {
        name: req.body.name,
        city: req.body.city,
      });
      if (!fields) return;

      const existing = restaurants.findById(id);
      if (!existing) {
        res.status(404).json({ error: "restaurant not found" });
        return;
      }

      const cuisine = req.body.cuisine;
      const restaurant = restaurants.update(
        id,
        fields.name,
        fields.city,
        typeof cuisine === "string" ? cuisine.trim() : ""
      );
      res.json(restaurant);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "restaurant");
      if (id === null) return;

      const existing = restaurants.findById(id);
      if (!existing) {
        res.status(404).json({ error: "restaurant not found" });
        return;
      }

      deleteWithFKCheck(
        res,
        () => restaurants.deleteById(id),
        "cannot delete restaurant with existing reviews"
      );
    } catch (err) {
      next(err);
    }
  });

  return router;
}

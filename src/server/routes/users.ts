import { Router } from "express";
import type Database from "better-sqlite3";
import { UserModel } from "../models/user.js";
import { parseId, requireStrings, deleteWithFKCheck } from "./validate.js";

export function usersRouter(db: Database.Database): Router {
  const router = Router();
  const users = new UserModel(db);

  router.get("/", (_req, res, next) => {
    try {
      res.json(users.findAll());
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "user");
      if (id === null) return;

      const user = users.findById(id);
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  router.post("/", (req, res, next) => {
    try {
      const fields = requireStrings(res, {
        name: req.body.name,
        email: req.body.email,
      });
      if (!fields) return;

      const existing = users.findByEmail(fields.email);
      if (existing) {
        res.status(409).json({ error: "email already exists" });
        return;
      }

      const user = users.create(fields.name, fields.email);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "user");
      if (id === null) return;

      const fields = requireStrings(res, {
        name: req.body.name,
        email: req.body.email,
      });
      if (!fields) return;

      const existing = users.findById(id);
      if (!existing) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      const emailOwner = users.findByEmail(fields.email);
      if (emailOwner && emailOwner.id !== id) {
        res.status(409).json({ error: "email already exists" });
        return;
      }

      const user = users.update(id, fields.name, fields.email);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id/block", (req, res, next) => {
    try {
      const id = parseId(req, res, "user");
      if (id === null) return;

      const user = users.block(id);
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id/unblock", (req, res, next) => {
    try {
      const id = parseId(req, res, "user");
      if (id === null) return;

      const user = users.unblock(id);
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", (req, res, next) => {
    try {
      const id = parseId(req, res, "user");
      if (id === null) return;

      const existing = users.findById(id);
      if (!existing) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      deleteWithFKCheck(
        res,
        () => users.deleteById(id),
        "cannot delete user with existing reviews"
      );
    } catch (err) {
      next(err);
    }
  });

  return router;
}

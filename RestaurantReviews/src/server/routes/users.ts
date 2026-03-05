import { Router } from "express";
import type Database from "better-sqlite3";
import { UserModel } from "../models/user.js";

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
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid user id" });
        return;
      }

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
      const { name, email } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: "name and email are required" });
        return;
      }

      if (typeof name !== "string" || typeof email !== "string") {
        res.status(400).json({ error: "name and email must be strings" });
        return;
      }

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();

      if (!trimmedName || !trimmedEmail) {
        res.status(400).json({ error: "name and email must not be blank" });
        return;
      }

      const existing = users.findByEmail(trimmedEmail);
      if (existing) {
        res.status(409).json({ error: "email already exists" });
        return;
      }

      const user = users.create(trimmedName, trimmedEmail);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid user id" });
        return;
      }

      const { name, email } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: "name and email are required" });
        return;
      }

      if (typeof name !== "string" || typeof email !== "string") {
        res.status(400).json({ error: "name and email must be strings" });
        return;
      }

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();

      if (!trimmedName || !trimmedEmail) {
        res.status(400).json({ error: "name and email must not be blank" });
        return;
      }

      const existing = users.findById(id);
      if (!existing) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      const emailOwner = users.findByEmail(trimmedEmail);
      if (emailOwner && emailOwner.id !== id) {
        res.status(409).json({ error: "email already exists" });
        return;
      }

      const user = users.update(id, trimmedName, trimmedEmail);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id/block", (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid user id" });
        return;
      }

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
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid user id" });
        return;
      }

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
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "invalid user id" });
        return;
      }

      const existing = users.findById(id);
      if (!existing) {
        res.status(404).json({ error: "user not found" });
        return;
      }

      try {
        const deleted = users.deleteById(id);
        if (!deleted) {
          res.status(404).json({ error: "user not found" });
          return;
        }
        res.status(204).send();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : String(err);
        if (msg.includes("FOREIGN KEY constraint failed")) {
          res
            .status(409)
            .json({ error: "cannot delete user with existing reviews" });
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

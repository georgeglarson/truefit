import { Router } from "express";
import { EXERCISE_PATHS } from "./config.js";
import { runWithFile } from "./runner.js";

export function cashRegisterRouter(): Router {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const { input, seed, divisor, currency } = req.body;

      if (!input || typeof input !== "string") {
        res.status(400).json({ error: "input is required (string)" });
        return;
      }

      const args: string[] = [];
      if (seed != null) {
        const n = Number(seed);
        if (!Number.isInteger(n)) {
          res.status(400).json({ error: "seed must be an integer" });
          return;
        }
        args.push("--seed", String(n));
      }
      if (divisor != null) {
        const n = Number(divisor);
        if (!Number.isInteger(n) || n <= 0) {
          res.status(400).json({ error: "divisor must be a positive integer" });
          return;
        }
        args.push("--divisor", String(n));
      }
      if (currency) {
        if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
          res.status(400).json({ error: "currency must be a 3-letter uppercase code (e.g. USD)" });
          return;
        }
        args.push("--currency", currency);
      }

      const result = await runWithFile(
        EXERCISE_PATHS.cashRegister,
        input,
        args
      );

      if (result.exitCode !== 0) {
        console.error("cash-register stderr:", result.stderr);
        res.status(422).json({
          error: "exercise failed",
          exitCode: result.exitCode,
        });
        return;
      }

      res.json({ output: result.stdout.trimEnd() });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

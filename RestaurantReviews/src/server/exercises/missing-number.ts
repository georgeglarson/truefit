import { Router } from "express";
import { EXERCISE_PATHS } from "./config.js";
import { runWithFile } from "./runner.js";

export function missingNumberRouter(): Router {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const { input } = req.body;

      if (!input || typeof input !== "string") {
        res.status(400).json({ error: "input is required (string)" });
        return;
      }

      const result = await runWithFile(EXERCISE_PATHS.missingNumber, input);

      if (result.exitCode !== 0) {
        console.error("missing-number stderr:", result.stderr);
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

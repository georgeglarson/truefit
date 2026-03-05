import type { Request, Response } from "express";

/**
 * Parse req.params.id as an integer. Returns the number on success,
 * or sends a 400 response and returns null.
 */
export function parseId(req: Request, res: Response, entity: string): number | null {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: `invalid ${entity} id` });
    return null;
  }
  return id;
}

/**
 * Validate that required string fields are present, are strings, and are
 * non-blank after trimming. Returns the trimmed values on success, or
 * sends a 400 response and returns null.
 */
export function requireStrings(
  res: Response,
  fields: Record<string, unknown>
): Record<string, string> | null {
  const names = Object.keys(fields);
  const list = names.join(" and ");

  for (const name of names) {
    if (fields[name] == null || fields[name] === "") {
      res.status(400).json({ error: `${list} are required` });
      return null;
    }
    if (typeof fields[name] !== "string") {
      res.status(400).json({ error: `${list} must be strings` });
      return null;
    }
  }

  const trimmed: Record<string, string> = {};
  for (const name of names) {
    trimmed[name] = (fields[name] as string).trim();
    if (!trimmed[name]) {
      res.status(400).json({ error: `${list} must not be blank` });
      return null;
    }
  }

  return trimmed;
}

/**
 * Attempt a delete and handle FK constraint failures with a 409 response.
 * Returns true if the delete succeeded, false if it was handled (409 or 404).
 * Rethrows non-FK errors.
 */
export function deleteWithFKCheck(
  res: Response,
  deleteFn: () => boolean,
  fkMessage: string
): boolean {
  try {
    const deleted = deleteFn();
    if (!deleted) {
      res.status(404).json({ error: "not found" });
      return false;
    }
    res.status(204).send();
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("FOREIGN KEY constraint failed")) {
      res.status(409).json({ error: fkMessage });
      return false;
    }
    throw err;
  }
}

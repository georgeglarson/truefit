import { Router } from "express";
import { spawn, type ChildProcess } from "child_process";
import { writeFile, rm, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { EXERCISE_PATHS } from "./config.js";
import crypto from "crypto";

interface Session {
  process: ChildProcess;
  pending: Array<{
    resolve: (output: string) => void;
    reject: (err: Error) => void;
  }>;
  buffer: string;
  day: number;
  tmpDir: string;
  lastActivity: number;
}

const sessions = new Map<string, Session>();
const SESSION_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_SESSIONS = 20;
const MAX_INVENTORY_BYTES = 16 * 1024; // 16 KB
const MAX_COMMAND_LENGTH = 256;
const PROMPT_TIMEOUT = 10_000; // 10 seconds

const PROMPT_RE = /\[Day (\d+)\] > $/;

function cleanupSession(id: string): void {
  const session = sessions.get(id);
  if (!session) return;
  session.process.kill();
  rm(session.tmpDir, { recursive: true, force: true }).catch(() => {});
  sessions.delete(id);
}

// Periodic cleanup of idle sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivity > SESSION_TTL) {
      cleanupSession(id);
    }
  }
}, 60_000).unref();

async function createSession(inventory: string): Promise<string> {
  const id = crypto.randomUUID();
  const dir = await mkdtemp(path.join(tmpdir(), "gilded-"));
  const tmpFile = path.join(dir, "inventory.csv");
  await writeFile(tmpFile, inventory, "utf-8");

  const child = spawn(EXERCISE_PATHS.gildedRose, [tmpFile]);

  const session: Session = {
    process: child,
    pending: [],
    buffer: "",
    day: 0,
    tmpDir: dir,
    lastActivity: Date.now(),
  };

  child.stdout.on("data", (chunk: Buffer) => {
    session.buffer += chunk.toString("utf-8");
    drainBuffer(session);
  });

  child.stderr.on("data", (chunk: Buffer) => {
    const err = chunk.toString("utf-8");
    if (session.pending.length > 0) {
      session.pending.shift()!.reject(new Error(err));
    }
  });

  child.on("close", () => {
    for (const p of session.pending) {
      p.reject(new Error("process exited"));
    }
    session.pending = [];
    sessions.delete(id);
    rm(dir, { recursive: true, force: true }).catch(() => {});
  });

  sessions.set(id, session);

  // Wait for initial prompt
  await waitForPrompt(session);
  return id;
}

function drainBuffer(session: Session): void {
  const match = session.buffer.match(PROMPT_RE);
  if (match && session.pending.length > 0) {
    const day = parseInt(match[1], 10);
    session.day = day;
    // Everything before the prompt is the output
    const output = session.buffer.slice(0, match.index).trimEnd();
    session.buffer = "";
    session.pending.shift()!.resolve(output);
  }
}

function waitForPrompt(session: Session): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const idx = session.pending.findIndex((p) => p.resolve === wrappedResolve);
      if (idx !== -1) session.pending.splice(idx, 1);
      reject(new Error("prompt timeout"));
    }, PROMPT_TIMEOUT);

    const wrappedResolve = (output: string) => {
      clearTimeout(timer);
      resolve(output);
    };
    const wrappedReject = (err: Error) => {
      clearTimeout(timer);
      reject(err);
    };

    session.pending.push({ resolve: wrappedResolve, reject: wrappedReject });
    // Check if prompt is already in buffer
    drainBuffer(session);
  });
}

function sendCommand(session: Session, command: string): Promise<string> {
  session.lastActivity = Date.now();
  // Strip newlines to prevent multi-command injection
  const sanitized = command.replace(/[\r\n]/g, "");
  const promise = waitForPrompt(session);
  session.process.stdin!.write(sanitized + "\n");
  return promise;
}

export function gildedRoseRouter(): Router {
  const router = Router();

  router.post("/start", async (req, res, next) => {
    try {
      const { inventory } = req.body;

      if (!inventory || typeof inventory !== "string") {
        res.status(400).json({ error: "inventory is required (CSV string)" });
        return;
      }

      if (Buffer.byteLength(inventory, "utf-8") > MAX_INVENTORY_BYTES) {
        res.status(400).json({ error: "inventory too large" });
        return;
      }

      if (sessions.size >= MAX_SESSIONS) {
        res.status(503).json({ error: "too many active sessions, try again later" });
        return;
      }

      const sessionId = await createSession(inventory);
      const session = sessions.get(sessionId)!;
      res.status(201).json({ sessionId, day: session.day });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:sessionId/command", async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const { command } = req.body;

      if (!command || typeof command !== "string") {
        res.status(400).json({ error: "command is required (string)" });
        return;
      }

      if (command.length > MAX_COMMAND_LENGTH) {
        res.status(400).json({ error: "command too long" });
        return;
      }

      const session = sessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: "session not found or expired" });
        return;
      }

      const output = await sendCommand(session, command);
      res.json({ output, day: session.day });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    if (!sessions.has(sessionId)) {
      res.status(404).json({ error: "session not found" });
      return;
    }
    cleanupSession(sessionId);
    res.status(204).send();
  });

  return router;
}

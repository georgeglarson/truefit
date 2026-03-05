import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import Database from "better-sqlite3";
import { createApp } from "../app.js";

// Mock the runner to avoid needing actual binaries
vi.mock("../exercises/runner.js", () => ({
  runWithFile: vi.fn(),
  spawnAndCapture: vi.fn(),
}));

import { runWithFile } from "../exercises/runner.js";
const mockRunWithFile = vi.mocked(runWithFile);

function freshApp() {
  const db = new Database(":memory:");
  return createApp(db);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Cash Register argument validation ───────────────────────────────

describe("Cash Register argument validation", () => {
  it("rejects non-integer seed", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", seed: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("seed");
  });

  it("rejects float seed", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", seed: 3.5 });
    expect(res.status).toBe(400);
  });

  it("rejects non-integer divisor", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", divisor: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("divisor");
  });

  it("rejects zero divisor", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", divisor: 0 });
    expect(res.status).toBe(400);
  });

  it("rejects negative divisor", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", divisor: -1 });
    expect(res.status).toBe(400);
  });

  it("rejects lowercase currency", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", currency: "usd" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("currency");
  });

  it("rejects currency with wrong length", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", currency: "US" });
    expect(res.status).toBe(400);
  });

  it("rejects currency with special characters", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", currency: "U$D" });
    expect(res.status).toBe(400);
  });

  it("rejects currency that looks like a flag", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", currency: "--h" });
    expect(res.status).toBe(400);
  });

  it("accepts valid 3-letter uppercase currency", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({ stdout: "ok\n", stderr: "", exitCode: 0 });
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", currency: "EUR" });
    expect(res.status).toBe(200);
    expect(mockRunWithFile).toHaveBeenCalledWith(expect.any(String), "1.00,2.00\n", [
      "--currency",
      "EUR",
    ]);
  });

  it("accepts valid integer seed and divisor", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({ stdout: "ok\n", stderr: "", exitCode: 0 });
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", seed: 42, divisor: 3 });
    expect(res.status).toBe(200);
  });
});

// ── Stderr suppression ──────────────────────────────────────────────

describe("Stderr suppression in exercise responses", () => {
  it("does not include stderr in cash-register 422 response", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "/usr/local/bin/cash-register: segfault at 0x7fff",
      exitCode: 139,
    });

    const res = await request(app).post("/api/exercises/cash-register").send({ input: "bad\n" });

    expect(res.status).toBe(422);
    expect(res.body.stderr).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("segfault");
    expect(res.body.error).toBe("exercise failed");

    // But stderr IS logged server-side
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not include stderr in missing-number 422 response", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "panic: index out of bounds",
      exitCode: 1,
    });

    const res = await request(app).post("/api/exercises/missing-number").send({ input: "bad" });

    expect(res.status).toBe(422);
    expect(res.body.stderr).toBeUndefined();
    spy.mockRestore();
  });

  it("does not include stderr in morse-code 422 response", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "error at line 42",
      exitCode: 1,
    });

    const res = await request(app).post("/api/exercises/morse-code/encode").send({ input: "bad" });

    expect(res.status).toBe(422);
    expect(res.body.stderr).toBeUndefined();
    spy.mockRestore();
  });

  it("does not include stderr in on-screen-keyboard 422 response", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "Traceback (most recent call last):\n  File ...",
      exitCode: 1,
    });

    const res = await request(app).post("/api/exercises/on-screen-keyboard").send({ input: "bad" });

    expect(res.status).toBe(422);
    expect(res.body.stderr).toBeUndefined();
    spy.mockRestore();
  });
});

// ── CSP headers ─────────────────────────────────────────────────────

describe("Security headers", () => {
  it("includes Content-Security-Policy header", async () => {
    const app = freshApp();
    const res = await request(app).get("/api/restaurants");
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(res.headers["content-security-policy"]).toContain("script-src 'self'");
    expect(res.headers["content-security-policy"]).toContain("object-src 'none'");
    expect(res.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  });

  it("includes X-Content-Type-Options nosniff", async () => {
    const app = freshApp();
    const res = await request(app).get("/api/restaurants");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("includes X-Frame-Options", async () => {
    const app = freshApp();
    const res = await request(app).get("/api/restaurants");
    expect(res.headers["x-frame-options"]).toBeDefined();
  });

  it("does not expose X-Powered-By", async () => {
    const app = freshApp();
    const res = await request(app).get("/api/restaurants");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

// ── Gilded Rose command sanitization ────────────────────────────────
// Note: These are integration-level route tests; the actual newline stripping
// is in sendCommand() which is tested indirectly.

describe("Gilded Rose command validation", () => {
  it("rejects empty command", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/gilded-rose/fake-session/command")
      .send({ command: "" });
    expect(res.status).toBe(400);
  });

  it("rejects non-string command", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/gilded-rose/fake-session/command")
      .send({ command: 123 });
    expect(res.status).toBe(400);
  });

  it("rejects command exceeding max length", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/gilded-rose/fake-session/command")
      .send({ command: "x".repeat(257) });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("too long");
  });

  it("rejects oversized inventory", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/gilded-rose/start")
      .send({ inventory: "x".repeat(17 * 1024) });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("too large");
  });

  it("returns 404 for non-existent session", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/gilded-rose/nonexistent/command")
      .send({ command: "list" });
    expect(res.status).toBe(404);
  });
});

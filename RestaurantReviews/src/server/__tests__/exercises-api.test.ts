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

// ── Cash Register ────────────────────────────────────────────────────

describe("POST /api/exercises/cash-register", () => {
  it("returns output on success", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "Quarter:3,Dime:1,Nickel:0,Penny:3\n",
      stderr: "",
      exitCode: 0,
    });

    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "2.12,3.00\n" });

    expect(res.status).toBe(200);
    expect(res.body.output).toBe("Quarter:3,Dime:1,Nickel:0,Penny:3");
  });

  it("passes optional args (seed, divisor, currency)", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "result\n",
      stderr: "",
      exitCode: 0,
    });

    await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1.00,2.00\n", seed: 42, divisor: 3, currency: "EUR" });

    expect(mockRunWithFile).toHaveBeenCalledWith(
      expect.any(String),
      "1.00,2.00\n",
      ["--seed", "42", "--divisor", "3", "--currency", "EUR"]
    );
  });

  it("returns 400 for missing input", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-string input", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: 123 });
    expect(res.status).toBe(400);
  });

  it("returns 422 on non-zero exit code", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "parse error",
      exitCode: 1,
    });

    const res = await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "bad\n" });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("exercise failed");
    // stderr is no longer leaked to clients (security fix)
    expect(res.body.stderr).toBeUndefined();
  });
});

// ── Missing Number ───────────────────────────────────────────────────

describe("POST /api/exercises/missing-number", () => {
  it("returns output on success", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "3\n",
      stderr: "",
      exitCode: 0,
    });

    const res = await request(app)
      .post("/api/exercises/missing-number")
      .send({ input: "1,2,4,5\n" });

    expect(res.status).toBe(200);
    expect(res.body.output).toBe("3");
  });

  it("returns 400 for missing input", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/missing-number")
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns 422 on failure", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "error",
      exitCode: 1,
    });

    const res = await request(app)
      .post("/api/exercises/missing-number")
      .send({ input: "bad" });
    expect(res.status).toBe(422);
  });
});

// ── Morse Code ───────────────────────────────────────────────────────

describe("POST /api/exercises/morse-code/encode", () => {
  it("encodes text to morse", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: ".... . .-.. .-.. ---\n",
      stderr: "",
      exitCode: 0,
    });

    const res = await request(app)
      .post("/api/exercises/morse-code/encode")
      .send({ input: "HELLO\n" });

    expect(res.status).toBe(200);
    expect(res.body.output).toBe(".... . .-.. .-.. ---");
  });

  it("returns 400 for missing input", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/morse-code/encode")
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns 422 on failure", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "error",
      exitCode: 1,
    });

    const res = await request(app)
      .post("/api/exercises/morse-code/encode")
      .send({ input: "bad" });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/exercises/morse-code/decode", () => {
  it("decodes morse to text", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "HELLO\n",
      stderr: "",
      exitCode: 0,
    });

    const res = await request(app)
      .post("/api/exercises/morse-code/decode")
      .send({ input: ".... . .-.. .-.. ---\n" });

    expect(res.status).toBe(200);
    expect(res.body.output).toBe("HELLO");
  });

  it("returns 400 for missing input", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/morse-code/decode")
      .send({});
    expect(res.status).toBe(400);
  });
});

// ── On-Screen Keyboard ──────────────────────────────────────────────

describe("POST /api/exercises/on-screen-keyboard", () => {
  it("returns keyboard path on success", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "D,R,R,R,S,U,L,L,L,S\n",
      stderr: "",
      exitCode: 0,
    });

    const res = await request(app)
      .post("/api/exercises/on-screen-keyboard")
      .send({ input: "IT\n" });

    expect(res.status).toBe(200);
    expect(res.body.output).toBe("D,R,R,R,S,U,L,L,L,S");
  });

  it("passes python3 as interpreter", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "output\n",
      stderr: "",
      exitCode: 0,
    });

    await request(app)
      .post("/api/exercises/on-screen-keyboard")
      .send({ input: "test\n" });

    expect(mockRunWithFile).toHaveBeenCalledWith(
      expect.any(String),
      "test\n",
      [],
      { interpreter: "python3" }
    );
  });

  it("returns 400 for missing input", async () => {
    const app = freshApp();
    const res = await request(app)
      .post("/api/exercises/on-screen-keyboard")
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns 422 on failure", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "",
      stderr: "error",
      exitCode: 1,
    });

    const res = await request(app)
      .post("/api/exercises/on-screen-keyboard")
      .send({ input: "bad" });
    expect(res.status).toBe(422);
  });
});

// ── Runner unit tests ────────────────────────────────────────────────

describe("runner.ts (unit)", () => {
  it("runWithFile is called with correct binary path for cash-register", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "ok\n",
      stderr: "",
      exitCode: 0,
    });

    await request(app)
      .post("/api/exercises/cash-register")
      .send({ input: "1,2\n" });

    const binaryPath = mockRunWithFile.mock.calls[0][0];
    expect(binaryPath).toContain("CashRegister");
    expect(binaryPath).toContain("cash-register");
  });

  it("runWithFile is called with correct binary path for missing-number", async () => {
    const app = freshApp();
    mockRunWithFile.mockResolvedValue({
      stdout: "ok\n",
      stderr: "",
      exitCode: 0,
    });

    await request(app)
      .post("/api/exercises/missing-number")
      .send({ input: "1,2\n" });

    const binaryPath = mockRunWithFile.mock.calls[0][0];
    expect(binaryPath).toContain("MissingNumber");
  });
});

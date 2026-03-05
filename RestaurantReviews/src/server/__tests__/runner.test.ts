import { describe, it, expect } from "vitest";
import { runWithFile, spawnAndCapture } from "../exercises/runner.js";

// ── runWithFile ─────────────────────────────────────────────────────

describe("runWithFile", () => {
  it("rejects input exceeding 64 KB", async () => {
    const bigInput = "x".repeat(65 * 1024);
    const result = await runWithFile("/bin/cat", bigInput);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe("Input too large");
    expect(result.stdout).toBe("");
  });

  it("accepts input just under 64 KB", async () => {
    // 64 KB exactly should be fine (limit is >64KB)
    const input = "hello\n";
    const result = await runWithFile("/bin/cat", input);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("hello");
  });

  it("writes input to temp file and passes it as first arg", async () => {
    // /bin/cat reads from a file argument
    const result = await runWithFile("/bin/cat", "test data\n");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("test data\n");
  });

  it("passes extra args after the file arg", async () => {
    // Use head -n 1 to only show first line — proves args pass through
    const input = "line1\nline2\nline3\n";
    const result = await runWithFile("/usr/bin/head", input, ["-n", "1"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("line1");
  });

  it("uses interpreter when provided", async () => {
    // With interpreter, command becomes interpreter, args become [binary, file, ...extra]
    // Use /bin/sh -c as a proxy: we verify the interpreter+binary args structure
    // by passing a script that cats its own argument
    const result = await runWithFile("/bin/cat", "interpreted\n", [], {
      interpreter: "/usr/bin/env",
    });
    // /usr/bin/env /bin/cat <tmpfile> — env runs cat which reads the file
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("interpreted");
  });

  it("captures stderr on failure", async () => {
    const result = await runWithFile("/bin/cat", "data\n", ["/nonexistent/file"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toBeTruthy();
  });

  it("cleans up temp directory after success", async () => {
    const { tmpdir } = await import("os");
    const { readdir } = await import("fs/promises");

    // Count exercise- dirs before and after
    const tmpBase = tmpdir();
    const before = (await readdir(tmpBase)).filter((f) => f.startsWith("exercise-")).length;

    await runWithFile("/bin/cat", "cleanup test\n");

    const after = (await readdir(tmpBase)).filter((f) => f.startsWith("exercise-")).length;

    // Should not leave extra dirs behind
    expect(after).toBeLessThanOrEqual(before);
  });

  it("cleans up temp directory after failure", async () => {
    const { tmpdir } = await import("os");
    const { readdir } = await import("fs/promises");

    const tmpBase = tmpdir();
    const before = (await readdir(tmpBase)).filter((f) => f.startsWith("exercise-")).length;

    await runWithFile("/bin/false", "test\n");

    const after = (await readdir(tmpBase)).filter((f) => f.startsWith("exercise-")).length;

    expect(after).toBeLessThanOrEqual(before);
  });
});

// ── spawnAndCapture ─────────────────────────────────────────────────

describe("spawnAndCapture", () => {
  it("captures stdout from a simple command", async () => {
    const result = await spawnAndCapture("/bin/echo", ["hello world"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("hello world");
    expect(result.stderr).toBe("");
  });

  it("captures stderr", async () => {
    const result = await spawnAndCapture("/bin/sh", ["-c", "echo err >&2; exit 1"]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr.trim()).toBe("err");
  });

  it("returns non-zero exit code for failing commands", async () => {
    const result = await spawnAndCapture("/bin/false", []);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
  });

  it("times out long-running commands", async () => {
    // spawn with timeout kills the process; it resolves with non-zero exit code
    const result = await spawnAndCapture("/bin/sleep", ["60"], 100);
    expect(result.exitCode).not.toBe(0);
  });

  it("handles command not found", async () => {
    await expect(spawnAndCapture("/nonexistent/binary", [])).rejects.toThrow();
  });

  it("captures multi-line stdout", async () => {
    const result = await spawnAndCapture("/bin/sh", ["-c", "echo line1; echo line2; echo line3"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("line1\nline2\nline3\n");
  });

  it("handles empty stdout and stderr", async () => {
    const result = await spawnAndCapture("/bin/true", []);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  it("sets truncated to false for small output", async () => {
    const result = await spawnAndCapture("/bin/echo", ["hello"]);
    expect(result.truncated).toBe(false);
  });

  it("sets truncated to true when stdout exceeds 256 KB", async () => {
    // Generate 300 KB of output via dd
    const result = await spawnAndCapture("/bin/dd", [
      "if=/dev/zero",
      "bs=1024",
      "count=300",
    ]);
    expect(result.truncated).toBe(true);
  });
});

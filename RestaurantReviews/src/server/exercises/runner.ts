import { spawn } from "child_process";
import { writeFile, rm, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const MAX_INPUT_BYTES = 64 * 1024; // 64 KB
const MAX_OUTPUT_BYTES = 256 * 1024; // 256 KB

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  truncated: boolean;
}

/**
 * Write input to a temp file, spawn a binary with that file as an argument,
 * capture stdout/stderr, clean up, and return the result.
 */
export async function runWithFile(
  binary: string,
  input: string,
  extraArgs: string[] = [],
  options: { interpreter?: string; timeout?: number } = {}
): Promise<RunResult> {
  if (Buffer.byteLength(input, "utf-8") > MAX_INPUT_BYTES) {
    return { stdout: "", stderr: "Input too large", exitCode: 1, truncated: false };
  }

  const dir = await mkdtemp(path.join(tmpdir(), "exercise-"));
  const inputFile = path.join(dir, "input.txt");

  await writeFile(inputFile, input, "utf-8");

  try {
    const cmd = options.interpreter ? options.interpreter : binary;
    const args = options.interpreter
      ? [binary, inputFile, ...extraArgs]
      : [inputFile, ...extraArgs];

    return await spawnAndCapture(cmd, args, options.timeout);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

export function spawnAndCapture(
  cmd: string,
  args: string[],
  timeout: number = 10_000
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { timeout });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutLen = 0;
    let stderrLen = 0;

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutLen += chunk.length;
      if (stdoutLen <= MAX_OUTPUT_BYTES) stdoutChunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrLen += chunk.length;
      if (stderrLen <= MAX_OUTPUT_BYTES) stderrChunks.push(chunk);
    });

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
        exitCode: code ?? 1,
        truncated: stdoutLen > MAX_OUTPUT_BYTES || stderrLen > MAX_OUTPUT_BYTES,
      });
    });
  });
}

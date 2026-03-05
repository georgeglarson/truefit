import { describe, it, expect } from "vitest";
import { parseMorseTokens } from "../../client/hooks/useMorseAudio.js";

// Real encoder format: || between letters, |||| between words
// e.g. "HELLO WORLD" → "....||.||.-..||.-..||---||||.--||---||.-.||.-..||-.."

describe("parseMorseTokens", () => {
  it("parses a single letter", () => {
    const tokens = parseMorseTokens("....");
    expect(tokens).toEqual([{ type: "letter", symbols: [".", ".", ".", "."], raw: "...." }]);
  });

  it("parses two letters separated by ||", () => {
    const tokens = parseMorseTokens("....||.");
    expect(tokens).toEqual([
      { type: "letter", symbols: [".", ".", ".", "."], raw: "...." },
      { type: "letter", symbols: ["."], raw: "." },
    ]);
  });

  it("parses a word gap (||||)", () => {
    const tokens = parseMorseTokens("....||.||||.--||---");
    expect(tokens).toEqual([
      { type: "letter", symbols: [".", ".", ".", "."], raw: "...." },
      { type: "letter", symbols: ["."], raw: "." },
      { type: "word-gap" },
      { type: "letter", symbols: [".", "-", "-"], raw: ".--" },
      { type: "letter", symbols: ["-", "-", "-"], raw: "---" },
    ]);
  });

  it("handles dashes", () => {
    const tokens = parseMorseTokens("-..||.-||...||....");
    expect(tokens).toHaveLength(4);
    expect(tokens[0]).toEqual({
      type: "letter",
      symbols: ["-", ".", "."],
      raw: "-..",
    });
  });

  it("returns empty array for empty string", () => {
    expect(parseMorseTokens("")).toEqual([]);
  });

  it("handles consecutive word gaps", () => {
    const tokens = parseMorseTokens(".||||||||.");
    // . |||| |||| . → letter, word-gap, word-gap, letter
    expect(tokens.filter((t) => t.type === "word-gap")).toHaveLength(2);
    expect(tokens.filter((t) => t.type === "letter")).toHaveLength(2);
  });

  it("ignores empty letter groups from leading/trailing delimiters", () => {
    const tokens = parseMorseTokens("||....");
    // leading || creates an empty group that gets filtered
    expect(tokens).toEqual([{ type: "letter", symbols: [".", ".", ".", "."], raw: "...." }]);
  });

  it("parses full HELLO WORLD morse", () => {
    const morse = "....||.||.-..||.-..||---||||.--||---||.-.||.-..||-..";
    const tokens = parseMorseTokens(morse);

    const letters = tokens.filter((t) => t.type === "letter");
    const gaps = tokens.filter((t) => t.type === "word-gap");
    // HELLO = 5 letters, WORLD = 5 letters
    expect(letters).toHaveLength(10);
    expect(gaps).toHaveLength(1);
  });

  it("extracts correct symbols for SOS", () => {
    const tokens = parseMorseTokens("...||---||...");
    expect(tokens).toEqual([
      { type: "letter", symbols: [".", ".", "."], raw: "..." },
      { type: "letter", symbols: ["-", "-", "-"], raw: "---" },
      { type: "letter", symbols: [".", ".", "."], raw: "..." },
    ]);
  });

  it("parses real encoder output for HELLO WORLD with correct token structure", () => {
    const morse = "....||.||.-..||.-..||---||||.--||---||.-.||.-..||--..";
    const tokens = parseMorseTokens(morse);

    // HELLO = H E L L O, WORLD = W O R L D → 10 letters, 1 word gap
    expect(tokens).toHaveLength(11);

    // Verify word gap is at index 5 (after HELLO's 5 letters)
    expect(tokens[5]).toEqual({ type: "word-gap" });

    // Verify specific letters
    expect(tokens[0]).toEqual({ type: "letter", symbols: [".", ".", ".", "."], raw: "...." }); // H
    expect(tokens[1]).toEqual({ type: "letter", symbols: ["."], raw: "." }); // E
    expect(tokens[2]).toEqual({ type: "letter", symbols: [".", "-", ".", "."], raw: ".-.." }); // L
    expect(tokens[3]).toEqual({ type: "letter", symbols: [".", "-", ".", "."], raw: ".-.." }); // L
    expect(tokens[4]).toEqual({ type: "letter", symbols: ["-", "-", "-"], raw: "---" }); // O
    expect(tokens[6]).toEqual({ type: "letter", symbols: [".", "-", "-"], raw: ".--" }); // W
    expect(tokens[7]).toEqual({ type: "letter", symbols: ["-", "-", "-"], raw: "---" }); // O
    expect(tokens[8]).toEqual({ type: "letter", symbols: [".", "-", "."], raw: ".-." }); // R
    expect(tokens[9]).toEqual({ type: "letter", symbols: [".", "-", ".", "."], raw: ".-.." }); // L
    expect(tokens[10]).toEqual({ type: "letter", symbols: ["-", "-", ".", "."], raw: "--.." }); // D
  });

  it("parses single-letter words separated by word gap", () => {
    // A = .-, I = .. → "A I"
    const tokens = parseMorseTokens(".-||||..");
    expect(tokens).toEqual([
      { type: "letter", symbols: [".", "-"], raw: ".-" },
      { type: "word-gap" },
      { type: "letter", symbols: [".", "."], raw: ".." },
    ]);
  });

  it("parses all-dash letters", () => {
    // O O = "---||---"
    const tokens = parseMorseTokens("---||---");
    expect(tokens).toEqual([
      { type: "letter", symbols: ["-", "-", "-"], raw: "---" },
      { type: "letter", symbols: ["-", "-", "-"], raw: "---" },
    ]);
  });
});

import path from "path";

const ROOT = path.resolve(import.meta.dirname, "../../../");

export const EXERCISE_PATHS = {
  cashRegister: path.join(ROOT, "CashRegister/target/debug/cash-register"),
  missingNumber: path.join(ROOT, "MissingNumber/zig-out/bin/MissingNumber"),
  morseEncode: path.join(ROOT, "MorseCode/morse_encode"),
  morseDecode: path.join(ROOT, "MorseCode/morse_decode"),
  onScreenKeyboard: path.join(ROOT, "OnScreenKeyboard/main.py"),
  gildedRose: path.join(ROOT, "GildedRose/gildedrose"),
} as const;

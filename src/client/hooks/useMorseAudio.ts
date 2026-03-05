import { useRef, useState, useCallback } from "react";

// ITU timing (in units): dot=1, dash=3, intra-char gap=1, inter-char gap=3, word gap=7
const UNIT_MS = 80; // base unit duration

interface PlaybackState {
  playing: boolean;
  /** Index of the current top-level token (letter group or word gap) being played */
  tokenIndex: number;
}

/**
 * Plays Morse code audio using the Web Audio API.
 * Morse format: dots/dashes within a letter, || between letters, |||| between words.
 */
export function useMorseAudio() {
  const [state, setState] = useState<PlaybackState>({ playing: false, tokenIndex: -1 });
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ playing: false, tokenIndex: -1 });
  }, []);

  const play = useCallback(
    async (morse: string) => {
      stop();

      const ctx = new AudioContext();
      const controller = new AbortController();
      abortRef.current = controller;

      // Parse into tokens: each letter's signals or a word gap marker
      const tokens = parseMorseTokens(morse);

      setState({ playing: true, tokenIndex: 0 });

      try {
        let t = ctx.currentTime + 0.05; // small lead-in

        for (let i = 0; i < tokens.length; i++) {
          if (controller.signal.aborted) break;

          setState({ playing: true, tokenIndex: i });
          const token = tokens[i];

          if (token.type === "word-gap") {
            // 7 units total, but 3 already elapsed from previous inter-char gap
            await sleep(4 * UNIT_MS, controller.signal);
            continue;
          }

          // Play each symbol in the letter
          for (const sym of token.symbols) {
            if (controller.signal.aborted) break;
            const dur = sym === "." ? 1 * UNIT_MS : 3 * UNIT_MS;
            scheduleBeep(ctx, t, dur / 1000, 600);
            t += dur / 1000;
            // Intra-character gap (1 unit)
            t += (1 * UNIT_MS) / 1000;
            await sleep(dur + 1 * UNIT_MS, controller.signal);
          }

          // Inter-character gap (3 units total, 1 already elapsed)
          if (i < tokens.length - 1 && tokens[i + 1].type !== "word-gap") {
            t += (2 * UNIT_MS) / 1000;
            await sleep(2 * UNIT_MS, controller.signal);
          }
        }
      } catch {
        // AbortError — expected on stop()
      } finally {
        ctx.close().catch(() => {});
        setState({ playing: false, tokenIndex: -1 });
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [stop]
  );

  return { playing: state.playing, tokenIndex: state.tokenIndex, play, stop };
}

// ── Helpers ────────────────────────────────────────────────────────

interface LetterToken {
  type: "letter";
  symbols: string[]; // "." or "-"
  raw: string; // original morse string for this letter
}
interface WordGapToken {
  type: "word-gap";
}
type MorseToken = LetterToken | WordGapToken;

export function parseMorseTokens(morse: string): MorseToken[] {
  const tokens: MorseToken[] = [];
  // Split on word boundaries (||||), then each word on letter boundaries (||)
  const words = morse.split("||||");
  for (let w = 0; w < words.length; w++) {
    if (w > 0) tokens.push({ type: "word-gap" });
    const letters = words[w].split("||").filter((l) => l.length > 0);
    for (const letter of letters) {
      const symbols = letter.split("").filter((c) => c === "." || c === "-");
      if (symbols.length > 0) {
        tokens.push({ type: "letter", symbols, raw: letter });
      }
    }
  }
  return tokens;
}

function scheduleBeep(ctx: AudioContext, startTime: number, duration: number, frequency: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  // Gentle attack/release to avoid clicks
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.005);
  gain.gain.setValueAtTime(0.3, startTime + duration - 0.005);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

import { useState } from "react";
import { useApi } from "../../hooks/useApi.js";
import { ContextBox, Lang, Stat } from "../ContextBox.js";

export function MorseCodePanel() {
  const [input, setInput] = useState("HELLO WORLD");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const { data, error, loading, call } = useApi<{ output: string }>();

  const handleRun = async () => {
    if (!input.trim()) return;
    await call(`/api/exercises/morse-code/${mode}`, {
      method: "POST",
      body: JSON.stringify({ input }),
    });
  };

  const handleSwap = () => {
    if (!data?.output) return;
    const newMode = mode === "encode" ? "decode" : "encode";
    setInput(data.output);
    setMode(newMode);
  };

  return (
    <div style={styles.panel}>
      <h2 style={styles.title}>Morse Code</h2>
      <p style={styles.desc}>
        Encode text to Morse or decode Morse to text. Use || as letter
        separator and |||| as word separator when decoding.
      </p>

      <ContextBox>
        <ContextBox.Section heading="Problem">
          Build a bidirectional Morse code translator that handles encoding (text to Morse)
          and decoding (Morse to text), including multi-word messages with proper delimiter hierarchy.
        </ContextBox.Section>
        <ContextBox.Section heading="Solution">
          <Lang>Perl</Lang> &mdash; A text-processing problem at its
          core &mdash; splitting on delimiters and mapping through a lookup table. Perl is <em>the</em> language
          for this domain. The solution uses a three-tier delimiter hierarchy
          (dot for signals, pipe-pair for letters, quad-pipe for words) and builds both encoder and
          decoder from a single authoritative lookup table.
        </ContextBox.Section>
        <ContextBox.Section heading="Testing">
          <Stat>195 tests</Stat> &mdash; covers every letter A&ndash;Z,
          digits 0&ndash;9, all supported punctuation, multi-word encoding/decoding, full round-trip
          verification (encode then decode returns original), edge cases like empty input,
          unknown characters, and malformed Morse sequences.
        </ContextBox.Section>
      </ContextBox>

      <div style={styles.modeToggle}>
        <button
          onClick={() => {
            if (mode === "encode") return;
            setMode("encode");
            if (data?.output) setInput(data.output);
            else setInput("HELLO WORLD");
          }}
          style={{
            ...styles.modeBtn,
            ...(mode === "encode" ? styles.modeActive : {}),
          }}
        >
          Encode
        </button>
        <button
          onClick={() => {
            if (mode === "decode") return;
            setMode("decode");
            if (data?.output) setInput(data.output);
            else setInput("");
          }}
          style={{
            ...styles.modeBtn,
            ...(mode === "decode" ? styles.modeActive : {}),
          }}
        >
          Decode
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          mode === "encode"
            ? "HELLO WORLD"
            : "....|.|.-..|.-..|---||||.--|---|-.|.-..|-.."
        }
        rows={6}
        style={styles.textarea}
      />

      <div style={styles.buttonRow}>
        <button onClick={handleRun} disabled={loading} style={styles.button}>
          {loading ? "Running..." : mode === "encode" ? "Encode" : "Decode"}
        </button>
        {data?.output && (
          <button onClick={handleSwap} style={styles.swapBtn}>
            {mode === "encode" ? "Decode result \u2192" : "\u2190 Encode result"}
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {data && <pre style={styles.output}>{data.output}</pre>}
    </div>
  );
}

const styles = {
  panel: { padding: "28px 32px" },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "6px",
    color: "#f1f5f9",
    letterSpacing: "-0.01em",
  },
  desc: {
    color: "#94a3b8",
    marginBottom: "20px",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  modeToggle: {
    display: "flex",
    gap: "4px",
    marginBottom: "12px",
  },
  modeBtn: {
    padding: "8px 20px",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  modeActive: {
    background: "#1e40af",
    color: "#fff",
    borderColor: "#2563eb",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontFamily: "monospace",
    fontSize: "14px",
    resize: "vertical" as const,
    lineHeight: 1.5,
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "12px",
  },
  button: {
    padding: "10px 28px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  swapBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  error: {
    marginTop: "12px",
    padding: "12px 14px",
    background: "#7f1d1d",
    borderRadius: "8px",
    color: "#fca5a5",
    fontSize: "13px",
  },
  output: {
    marginTop: "16px",
    padding: "16px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#a5f3fc",
    fontFamily: "monospace",
    fontSize: "14px",
    whiteSpace: "pre-wrap" as const,
    lineHeight: 1.5,
  },
};

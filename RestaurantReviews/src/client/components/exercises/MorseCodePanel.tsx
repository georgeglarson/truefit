import { useState } from "react";
import { useApi } from "../../hooks/useApi.js";

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

  return (
    <div style={styles.panel}>
      <h2 style={styles.title}>Morse Code</h2>
      <p style={styles.desc}>
        Encode text to Morse or decode Morse to text. Use || as letter
        separator and |||| as word separator when decoding.
      </p>

      <div style={styles.contextBox}>
        <div style={styles.contextHeading}>The Challenge</div>
        <p style={styles.contextText}>
          Build a bidirectional Morse code translator that handles encoding (text to Morse)
          and decoding (Morse to text), including multi-word messages with proper delimiter hierarchy.
        </p>
        <div style={styles.contextHeading}>Our Solution</div>
        <p style={styles.contextText}>
          <strong style={styles.contextLang}>Perl</strong> &mdash; A text-processing problem at its
          core &mdash; splitting on delimiters and mapping through a lookup table. Perl is <em>the</em> language
          for this domain. The solution uses a three-tier delimiter hierarchy
          (dot for signals, pipe-pair for letters, quad-pipe for words) and builds both encoder and
          decoder from a single authoritative lookup table.
        </p>
        <div style={styles.contextHeading}>Testing</div>
        <p style={styles.contextText}>
          <strong style={styles.contextStat}>195 tests</strong> &mdash; covers every letter A&ndash;Z,
          digits 0&ndash;9, all supported punctuation, multi-word encoding/decoding, full round-trip
          verification (encode then decode returns original), edge cases like empty input,
          unknown characters, and malformed Morse sequences.
        </p>
      </div>

      <div style={styles.modeToggle}>
        <button
          onClick={() => {
            setMode("encode");
            setInput("HELLO WORLD");
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
            setMode("decode");
            setInput("....|.|.-..|.-..|---||||.--|---|-.|.-..|-..");
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

      <button onClick={handleRun} disabled={loading} style={styles.button}>
        {loading ? "Running..." : mode === "encode" ? "Encode" : "Decode"}
      </button>

      {error && <div style={styles.error}>{error}</div>}
      {data && <pre style={styles.output}>{data.output}</pre>}
    </div>
  );
}

const styles = {
  panel: { padding: "24px", maxWidth: "800px" },
  title: { fontSize: "24px", marginBottom: "8px", color: "#f1f5f9" },
  desc: { color: "#94a3b8", marginBottom: "16px", fontSize: "14px" },
  contextBox: {
    padding: "12px 16px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: "1.6",
  },
  contextHeading: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "4px",
    marginTop: "8px",
  },
  contextText: { margin: "0 0 8px 0" } as const,
  contextLang: { color: "#38bdf8" },
  contextStat: { color: "#4ade80" },
  modeToggle: { display: "flex", gap: "4px", marginBottom: "12px" },
  modeBtn: {
    padding: "6px 16px",
    border: "1px solid #334155",
    borderRadius: "6px",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
  },
  modeActive: { background: "#1e40af", color: "#fff", borderColor: "#2563eb" },
  textarea: {
    width: "100%",
    padding: "12px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#e2e8f0",
    fontFamily: "monospace",
    fontSize: "14px",
    resize: "vertical" as const,
  },
  button: {
    marginTop: "12px",
    padding: "8px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  error: {
    marginTop: "12px",
    padding: "12px",
    background: "#7f1d1d",
    borderRadius: "6px",
    color: "#fca5a5",
    fontSize: "14px",
  },
  output: {
    marginTop: "12px",
    padding: "16px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#a5f3fc",
    fontFamily: "monospace",
    fontSize: "14px",
    whiteSpace: "pre-wrap" as const,
  },
};

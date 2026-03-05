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

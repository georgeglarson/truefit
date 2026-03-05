import { useState, type ReactNode } from "react";
import { useApi } from "../../hooks/useApi.js";

interface Props {
  title: string;
  description: string;
  endpoint: string;
  placeholder: string;
  defaultValue?: string;
  method?: string;
  buildBody?: (input: string) => Record<string, unknown>;
  children?: ReactNode;
}

export function ExercisePanel({
  title,
  description,
  endpoint,
  placeholder,
  defaultValue = "",
  method = "POST",
  buildBody = (input) => ({ input }),
  children,
}: Props) {
  const [input, setInput] = useState(defaultValue);
  const { data, error, loading, call } = useApi<{ output: string }>();

  const handleRun = async () => {
    if (!input.trim()) return;
    await call(endpoint, {
      method,
      body: JSON.stringify(buildBody(input)),
    });
  };

  return (
    <div style={styles.panel}>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.desc}>{description}</p>

      {children}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        rows={6}
        style={styles.textarea}
      />

      <button onClick={handleRun} disabled={loading} style={styles.button}>
        {loading ? "Running..." : "Run"}
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {data && (
        <pre style={styles.output}>{data.output}</pre>
      )}
    </div>
  );
}

const styles = {
  panel: {
    padding: "28px 32px",
  },
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
  button: {
    marginTop: "12px",
    padding: "10px 28px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
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
    overflowX: "auto" as const,
    lineHeight: 1.5,
  },
};

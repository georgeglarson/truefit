import type { ReactNode } from "react";

interface SectionProps {
  heading: string;
  children: ReactNode;
}

function Section({ heading, children }: SectionProps) {
  return (
    <>
      <div style={styles.heading}>{heading}</div>
      <p style={styles.text}>{children}</p>
    </>
  );
}

interface Props {
  children: ReactNode;
}

export function ContextBox({ children }: Props) {
  return <div style={styles.box}>{children}</div>;
}

ContextBox.Section = Section;

/* Inline helper for language name highlights */
export function Lang({ children }: { children: ReactNode }) {
  return <strong style={styles.lang}>{children}</strong>;
}

/* Inline helper for stat callouts (test counts) */
export function Stat({ children }: { children: ReactNode }) {
  return <strong style={styles.stat}>{children}</strong>;
}

/* Inline code */
export function Code({ children }: { children: ReactNode }) {
  return <code style={styles.code}>{children}</code>;
}

const styles = {
  box: {
    padding: "14px 18px",
    background: "linear-gradient(135deg, #1e293b 0%, #1a2536 100%)",
    border: "1px solid #334155",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: 1.7,
  },
  heading: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "4px",
    marginTop: "12px",
  },
  text: {
    margin: "0 0 4px 0",
  } as const,
  lang: { color: "#38bdf8" },
  stat: { color: "#4ade80", fontWeight: 600 },
  code: {
    padding: "2px 6px",
    background: "#0f172a",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#e2e8f0",
    fontFamily: "monospace",
  },
};

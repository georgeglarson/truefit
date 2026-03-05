import { ExercisePanel } from "./ExercisePanel.js";

export function CashRegisterPanel() {
  return (
    <ExercisePanel
      title="Cash Register"
      description="Enter transactions as owed,paid per line (e.g. 2.12,3.00). Returns optimal change."
      endpoint="/api/exercises/cash-register"
      placeholder="owed,paid"
      defaultValue={"2.12,3.00\n1.97,2.00\n3.33,5.00"}
      buildBody={(input) => ({ input, seed: 42 })}
    >
      <div style={contextStyles.box}>
        <div style={contextStyles.heading}>The Challenge</div>
        <p style={contextStyles.text}>
          Build a cash register that calculates optimal change using US coin and bill denominations.
          If the amount owed is divisible by 3, return a random (seeded) assortment instead of optimal change.
        </p>
        <div style={contextStyles.heading}>Our Solution</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.lang}>Rust</strong> &mdash; Financial calculations demand zero-cost
          abstractions and type safety. All arithmetic uses integer cents to eliminate floating-point
          rounding bugs entirely. A trait-based strategy pattern (<code style={contextStyles.code}>ChangeStrategy</code>)
          cleanly separates the greedy optimal algorithm from the randomized path, making new strategies
          a one-file addition.
        </p>
        <div style={contextStyles.heading}>Testing</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.stat}>74 tests</strong> &mdash; covers exact change, overpayment with
          every denomination, the divisible-by-3 randomization path, penny-level precision, large
          amounts, zero-change edge cases, and round-trip verification that computed change always
          sums back to the correct amount.
        </p>
      </div>
    </ExercisePanel>
  );
}

const contextStyles = {
  box: {
    padding: "12px 16px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: "1.6",
  },
  heading: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "4px",
    marginTop: "8px",
  },
  text: { margin: "0 0 8px 0" },
  lang: { color: "#38bdf8" },
  code: {
    padding: "2px 6px",
    background: "#0f172a",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#e2e8f0",
  },
  stat: { color: "#4ade80" },
};

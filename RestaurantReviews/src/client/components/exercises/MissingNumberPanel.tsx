import { ExercisePanel } from "./ExercisePanel.js";

export function MissingNumberPanel() {
  return (
    <ExercisePanel
      title="Missing Number"
      description="Enter comma-separated number sequences, one per line. Returns the missing number from each."
      endpoint="/api/exercises/missing-number"
      placeholder="comma-separated numbers"
      defaultValue={"1,2,3,4,5,6,7,8,9,10,12\n24,26,27,29,28\n1,2,4,5"}
    >
      <div style={contextStyles.box}>
        <div style={contextStyles.heading}>The Challenge</div>
        <p style={contextStyles.text}>
          Given a sequence of numbers with exactly one value missing, find the gap.
          The sequence may be unsorted and can use any consistent step size (1, 2, 3, etc.).
        </p>
        <div style={contextStyles.heading}>Our Solution</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.lang}>Zig</strong> &mdash; A tight algorithmic problem suited to a
          systems language. Zig's explicit allocator model and comptime features show well on small,
          performance-sensitive code. The solution detects the step size from the sorted input, then
          uses arithmetic sum comparison to pinpoint the missing value in O(n log n) time.
        </p>
        <div style={contextStyles.heading}>Testing</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.stat}>46 tests</strong> &mdash; covers step sizes of 1 through 5,
          unsorted input, negative numbers, missing first/last elements, two-element sequences,
          large sequences (1000+ elements), and malformed input rejection. Uses a custom test runner
          for verbose per-test output.
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
  stat: { color: "#4ade80" },
};

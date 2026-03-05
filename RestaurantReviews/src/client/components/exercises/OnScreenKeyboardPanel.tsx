import { ExercisePanel } from "./ExercisePanel.js";

export function OnScreenKeyboardPanel() {
  return (
    <ExercisePanel
      title="On-Screen Keyboard"
      description="Enter words (one per line) to get the cursor path on a TV-style remote keyboard."
      endpoint="/api/exercises/on-screen-keyboard"
      placeholder="words to spell"
      defaultValue={"IT Crowd"}
    >
      <div style={contextStyles.box}>
        <div style={contextStyles.heading}>The Challenge</div>
        <p style={contextStyles.text}>
          Simulate a TV/DVR on-screen keyboard where a cursor starts at 'A' and moves
          Up/Down/Left/Right to spell words. Output the minimal sequence of moves and
          selections (U, D, L, R, S) for each input word.
        </p>
        <div style={contextStyles.heading}>Our Solution</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.lang}>Python</strong> &mdash; If this were production code, it would
          be scripting device input on a smart TV &mdash; a space where Python dominates. The layout is
          modeled as data (a list of row strings) with an index dict for O(1) character lookups.
          Manhattan distance cursor movement keeps the algorithm clean and extensible to different
          keyboard layouts.
        </p>
        <div style={contextStyles.heading}>Testing</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.stat}>73 tests</strong> &mdash; covers single characters, full words,
          phrases with spaces, wraparound edge cases, every character on the keyboard, multi-word
          input, and output format verification. Tests validate both the move sequence and final
          cursor position.
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

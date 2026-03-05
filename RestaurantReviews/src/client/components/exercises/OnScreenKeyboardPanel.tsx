import { ExercisePanel } from "./ExercisePanel.js";
import { ContextBox, Lang, Stat } from "../ContextBox.js";

export function OnScreenKeyboardPanel() {
  return (
    <ExercisePanel
      title="On-Screen Keyboard"
      description="Enter words (one per line) to get the cursor path on a TV-style remote keyboard."
      endpoint="/api/exercises/on-screen-keyboard"
      placeholder="words to spell"
      defaultValue={"IT Crowd"}
    >
      <ContextBox>
        <ContextBox.Section heading="Problem">
          Simulate a TV/DVR on-screen keyboard where a cursor starts at 'A' and moves
          Up/Down/Left/Right to spell words. Output the minimal sequence of moves and
          selections (U, D, L, R, S) for each input word.
        </ContextBox.Section>
        <ContextBox.Section heading="Solution">
          <Lang>Python</Lang> &mdash; If this were production code, it would be scripting device
          input on a smart TV &mdash; a space where Python dominates. The layout is modeled as data
          (a list of row strings) with an index dict for O(1) character lookups. Manhattan distance
          cursor movement keeps the algorithm clean and extensible to different keyboard layouts.
        </ContextBox.Section>
        <ContextBox.Section heading="Testing">
          <Stat>73 tests</Stat> &mdash; covers single characters, full words, phrases with spaces,
          wraparound edge cases, every character on the keyboard, multi-word input, and output format
          verification. Tests validate both the move sequence and final cursor position.
        </ContextBox.Section>
      </ContextBox>
    </ExercisePanel>
  );
}

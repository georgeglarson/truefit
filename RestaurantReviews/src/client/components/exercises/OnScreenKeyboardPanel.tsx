import { ExercisePanel } from "./ExercisePanel.js";

export function OnScreenKeyboardPanel() {
  return (
    <ExercisePanel
      title="On-Screen Keyboard"
      description="Enter words (one per line) to get the cursor path on a TV-style remote keyboard."
      endpoint="/api/exercises/on-screen-keyboard"
      placeholder="words to spell"
      defaultValue={"IT Crowd"}
    />
  );
}

import { ExercisePanel } from "./ExercisePanel.js";

export function MissingNumberPanel() {
  return (
    <ExercisePanel
      title="Missing Number"
      description="Enter comma-separated number sequences, one per line. Returns the missing number from each."
      endpoint="/api/exercises/missing-number"
      placeholder="comma-separated numbers"
      defaultValue={"1,2,3,4,5,6,7,8,9,10,12\n24,26,27,29,28\n1,2,4,5"}
    />
  );
}

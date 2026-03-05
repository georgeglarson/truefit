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
    />
  );
}

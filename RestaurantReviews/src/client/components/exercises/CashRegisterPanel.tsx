import { ExercisePanel } from "./ExercisePanel.js";
import { ContextBox, Lang, Stat, Code } from "../ContextBox.js";

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
      <ContextBox>
        <ContextBox.Section heading="Problem">
          Build a cash register that calculates optimal change using US coin and bill
          denominations. If the amount owed is divisible by 3, return a random (seeded)
          assortment instead of optimal change.
        </ContextBox.Section>
        <ContextBox.Section heading="Solution">
          <Lang>Rust</Lang> &mdash; Financial calculations demand zero-cost abstractions and
          type safety. All arithmetic uses integer cents to eliminate floating-point rounding bugs
          entirely. A trait-based strategy pattern (<Code>ChangeStrategy</Code>) cleanly separates
          the greedy optimal algorithm from the randomized path, making new strategies a one-file
          addition.
        </ContextBox.Section>
        <ContextBox.Section heading="Testing">
          <Stat>79 tests</Stat> &mdash; covers exact change, overpayment with every denomination,
          the divisible-by-3 randomization path, penny-level precision, large amounts, zero-change
          edge cases, and round-trip verification that computed change always sums back to the
          correct amount.
        </ContextBox.Section>
      </ContextBox>
    </ExercisePanel>
  );
}

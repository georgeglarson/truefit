import { useState } from "react";
import type { TabId } from "./types/index.js";
import { TabNav } from "./components/TabNav.js";
import { ReviewsPanel } from "./components/reviews/ReviewsPanel.js";
import { CashRegisterPanel } from "./components/exercises/CashRegisterPanel.js";
import { MissingNumberPanel } from "./components/exercises/MissingNumberPanel.js";
import { MorseCodePanel } from "./components/exercises/MorseCodePanel.js";
import { OnScreenKeyboardPanel } from "./components/exercises/OnScreenKeyboardPanel.js";
import { GildedRosePanel } from "./components/exercises/GildedRosePanel.js";

const PANELS: Record<TabId, () => JSX.Element> = {
  reviews: ReviewsPanel,
  "cash-register": CashRegisterPanel,
  "missing-number": MissingNumberPanel,
  "morse-code": MorseCodePanel,
  "on-screen-keyboard": OnScreenKeyboardPanel,
  "gilded-rose": GildedRosePanel,
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("reviews");
  const Panel = PANELS[activeTab];

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.h1}>TrueFit Control Panel</h1>
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        <Panel />
      </main>
    </div>
  );
}

const styles = {
  header: {
    padding: "16px 24px",
    background: "#1e293b",
    borderBottom: "1px solid #334155",
  },
  h1: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f1f5f9",
  },
};

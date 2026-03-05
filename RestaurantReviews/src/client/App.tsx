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
    <div style={styles.shell}>
      <header style={styles.header}>
        <h1 style={styles.h1}>TrueFit Control Panel</h1>
        <span style={styles.subtitle}>6 exercises &middot; 6 languages &middot; 740+ tests</span>
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={styles.main}>
        <Panel />
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    padding: "20px 28px 16px",
    background: "#1e293b",
    borderBottom: "1px solid #334155",
    display: "flex",
    alignItems: "baseline",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  h1: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 400,
  },
  main: {
    flex: 1,
    maxWidth: "960px",
    width: "100%",
    margin: "0 auto",
    padding: "8px 0",
  },
};

import type { Tab, TabId } from "../types/index.js";

const TABS: Tab[] = [
  { id: "reviews", label: "Restaurant Reviews" },
  { id: "cash-register", label: "Cash Register" },
  { id: "missing-number", label: "Missing Number" },
  { id: "morse-code", label: "Morse Code" },
  { id: "on-screen-keyboard", label: "On-Screen Keyboard" },
  { id: "gilded-rose", label: "Gilded Rose" },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNav({ activeTab, onTabChange }: Props) {
  return (
    <nav style={styles.nav} role="tablist" aria-label="Exercise panels">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            ...styles.tab,
            ...(activeTab === tab.id ? styles.active : {}),
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    gap: "4px",
    padding: "8px 16px",
    background: "#1e293b",
    borderBottom: "1px solid #334155",
    flexWrap: "wrap" as const,
  },
  tab: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px 6px 0 0",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  },
  active: {
    background: "#0f172a",
    color: "#38bdf8",
    borderBottom: "2px solid #38bdf8",
  },
};

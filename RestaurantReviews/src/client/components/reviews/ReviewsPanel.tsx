import { useState } from "react";
import { UserSection } from "./UserSection.js";
import { RestaurantSection } from "./RestaurantSection.js";
import { ReviewSection } from "./ReviewSection.js";
import { styles } from "./styles.js";

export function ReviewsPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleMutate = () => setRefreshKey((k) => k + 1);

  return (
    <div style={styles.panel}>
      <h2 style={styles.title}>Restaurant Reviews</h2>
      <p style={styles.desc}>
        Full CRUD for users, restaurants, and reviews. Blocked users cannot
        create new reviews.
      </p>

      <div style={contextStyles.box}>
        <div style={contextStyles.heading}>The Challenge</div>
        <p style={contextStyles.text}>
          Build a restaurant review application with full CRUD (Create, Read, Update, Delete)
          for users, restaurants, and reviews. Support user blocking, relational integrity, and
          a functional web interface.
        </p>
        <div style={contextStyles.heading}>Our Solution</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.lang}>TypeScript / React</strong> &mdash; TrueFit's core
          stack. Express + better-sqlite3 on the backend with RESTful routes for all three entities.
          React frontend with data tables, inline editing, entity picker dropdowns, and client-side
          filtering. This panel also serves as a <em>unified control panel</em> integrating all 5
          other exercises as live, interactive demos.
        </p>
        <div style={contextStyles.heading}>Testing</div>
        <p style={contextStyles.text}>
          <strong style={contextStyles.stat}>277 tests</strong> &mdash; 46 model tests (CRUD operations,
          FK constraints, email uniqueness), 103 API route tests (all HTTP verbs, validation, 404/409
          error paths), and 128 client tests (rendering, inline edit flows, entity pickers,
          cross-section refresh, and all exercise panel integration).
        </p>
      </div>

      <div style={styles.grid}>
        <UserSection refreshKey={refreshKey} onMutate={handleMutate} />
        <RestaurantSection refreshKey={refreshKey} onMutate={handleMutate} />
        <ReviewSection refreshKey={refreshKey} onMutate={handleMutate} />
      </div>
    </div>
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
  } as const,
  heading: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "4px",
    marginTop: "8px",
  } as const,
  text: { margin: "0 0 8px 0" } as const,
  lang: { color: "#38bdf8" } as const,
  stat: { color: "#4ade80" } as const,
};

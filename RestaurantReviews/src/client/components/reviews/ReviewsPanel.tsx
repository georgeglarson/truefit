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
      <div style={styles.grid}>
        <UserSection refreshKey={refreshKey} onMutate={handleMutate} />
        <RestaurantSection refreshKey={refreshKey} onMutate={handleMutate} />
        <ReviewSection refreshKey={refreshKey} onMutate={handleMutate} />
      </div>
    </div>
  );
}

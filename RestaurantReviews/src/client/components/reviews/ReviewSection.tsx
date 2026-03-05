import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi.js";
import type { User, Restaurant, ReviewWithNames } from "../../types/index.js";
import { styles } from "./styles.js";

interface Props {
  refreshKey: number;
  onMutate: () => void;
}

export function ReviewSection({ refreshKey, onMutate }: Props) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [rating, setRating] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState("");
  const [editBody, setEditBody] = useState("");

  const usersApi = useApi<User[]>();
  const restaurantsApi = useApi<Restaurant[]>();
  const listApi = useApi<ReviewWithNames[]>();
  const createApi = useApi<ReviewWithNames>();
  const updateApi = useApi<ReviewWithNames>();
  const deleteApi = useApi<void>();

  useEffect(() => {
    listApi.call("/api/reviews");
    usersApi.call("/api/users");
    restaurantsApi.call("/api/restaurants");
  }, [refreshKey]);

  const handleCreate = async () => {
    if (!selectedUserId || !selectedRestaurantId || !rating) return;
    const result = await createApi.call("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        userId: Number(selectedUserId),
        restaurantId: Number(selectedRestaurantId),
        rating: Number(rating),
        body,
      }),
    });
    if (result) {
      setSelectedUserId("");
      setSelectedRestaurantId("");
      setRating("");
      setBody("");
      onMutate();
    }
  };

  const startEdit = (review: ReviewWithNames) => {
    setEditingId(review.id);
    setEditRating(String(review.rating));
    setEditBody(review.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (id: number) => {
    if (!editRating) return;
    const result = await updateApi.call(`/api/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        rating: Number(editRating),
        body: editBody,
      }),
    });
    if (result) {
      setEditingId(null);
      onMutate();
    }
  };

  const handleDelete = async (id: number) => {
    await deleteApi.call(`/api/reviews/${id}`, { method: "DELETE" });
    onMutate();
  };

  const users = usersApi.data ?? [];
  const restaurants = restaurantsApi.data ?? [];
  const reviews = listApi.data ?? [];

  return (
    <section style={styles.section}>
      <h3 style={styles.sectionTitle}>Reviews</h3>
      <div style={styles.form}>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={styles.select}
          aria-label="Select user"
        >
          <option value="">Select user...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email}){u.blocked ? " [blocked]" : ""}
            </option>
          ))}
        </select>
        <select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          style={styles.select}
          aria-label="Select restaurant"
        >
          <option value="">Select restaurant...</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.city}
            </option>
          ))}
        </select>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          style={styles.select}
          aria-label="Select rating"
        >
          <option value="">Rating...</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Review text (optional)"
          style={{ ...styles.input, minHeight: "36px", flex: 1 }}
        />
        <button
          onClick={handleCreate}
          disabled={createApi.loading}
          style={styles.btn}
        >
          {createApi.loading ? "Creating..." : "Create"}
        </button>
      </div>
      {createApi.error && <div style={styles.error}>{createApi.error}</div>}
      {updateApi.error && <div style={styles.error}>{updateApi.error}</div>}
      {deleteApi.error && <div style={styles.error}>{deleteApi.error}</div>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>User</th>
            <th style={styles.th}>Restaurant</th>
            <th style={styles.th}>Rating</th>
            <th style={styles.th}>Body</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 && (
            <tr>
              <td colSpan={6} style={styles.emptyRow}>
                No reviews yet
              </td>
            </tr>
          )}
          {reviews.map((r) => (
            <tr key={r.id}>
              <td style={styles.td}>{r.id}</td>
              <td style={styles.td}>{r.user_name}</td>
              <td style={styles.td}>{r.restaurant_name}</td>
              <td style={styles.td}>
                {editingId === r.id ? (
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                    style={styles.editInput}
                    aria-label="Edit rating"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                ) : (
                  r.rating
                )}
              </td>
              <td style={styles.td}>
                {editingId === r.id ? (
                  <input
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    style={styles.editInput}
                    aria-label="Edit body"
                  />
                ) : (
                  r.body || "—"
                )}
              </td>
              <td style={styles.td}>
                <div style={styles.actions}>
                  {editingId === r.id ? (
                    <>
                      <button
                        onClick={() => handleSave(r.id)}
                        style={styles.btnSuccessSmall}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={styles.btnCancelSmall}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(r)}
                        style={styles.btnSmall}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={styles.btnDangerSmall}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

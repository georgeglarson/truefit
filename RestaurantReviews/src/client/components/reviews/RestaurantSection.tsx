import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi.js";
import type { Restaurant } from "../../types/index.js";
import { styles } from "./styles.js";

interface Props {
  refreshKey: number;
  onMutate: () => void;
}

export function RestaurantSection({ refreshKey, onMutate }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCuisine, setEditCuisine] = useState("");
  const [rowError, setRowError] = useState<Record<number, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const listApi = useApi<Restaurant[]>();
  const createApi = useApi<Restaurant>();
  const updateApi = useApi<Restaurant>();

  useEffect(() => {
    listApi.call("/api/restaurants");
  }, [refreshKey]);

  const handleCreate = async () => {
    if (!name.trim() || !city.trim()) return;
    const result = await createApi.call("/api/restaurants", {
      method: "POST",
      body: JSON.stringify({ name, city, cuisine }),
    });
    if (result) {
      setName("");
      setCity("");
      setCuisine("");
      onMutate();
    }
  };

  const startEdit = (r: Restaurant) => {
    setEditingId(r.id);
    setEditName(r.name);
    setEditCity(r.city);
    setEditCuisine(r.cuisine);
    setConfirmDelete(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (id: number) => {
    if (!editName.trim() || !editCity.trim()) return;
    const result = await updateApi.call(`/api/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: editName,
        city: editCity,
        cuisine: editCuisine,
      }),
    });
    if (result) {
      setEditingId(null);
      onMutate();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setRowError((prev) => ({ ...prev, [id]: "" }));
    setConfirmDelete(null);
    const res = await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      onMutate();
    } else {
      const json = await res.json();
      setRowError((prev) => ({
        ...prev,
        [id]: json.error || `HTTP ${res.status}`,
      }));
    }
  };

  const allRestaurants = listApi.data ?? [];
  const filtered = filter.trim()
    ? allRestaurants.filter((r) => r.city.toLowerCase().includes(filter.toLowerCase()))
    : allRestaurants;

  return (
    <section style={styles.section}>
      <h3 style={styles.sectionTitle}>Restaurants</h3>
      <div style={styles.form}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={styles.input}
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          style={styles.input}
        />
        <input
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="Cuisine (optional)"
          style={styles.input}
        />
        <button onClick={handleCreate} disabled={createApi.loading} style={styles.btn}>
          {createApi.loading ? "Creating..." : "Create"}
        </button>
      </div>
      {createApi.error && <div style={styles.error}>{createApi.error}</div>}
      {updateApi.error && <div style={styles.error}>{updateApi.error}</div>}

      {listApi.loading && !listApi.data && (
        <div style={{ color: "#64748b", fontSize: "13px", padding: "16px 0" }}>
          Loading restaurants...
        </div>
      )}

      <div style={styles.filterRow}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by city..."
          style={styles.filterInput}
        />
        {filter && (
          <span style={styles.filterLabel}>
            {filtered.length} of {allRestaurants.length}
          </span>
        )}
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>City</th>
            <th style={styles.th}>Cuisine</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && !listApi.loading && (
            <tr>
              <td colSpan={4} style={styles.emptyRow}>
                {filter
                  ? "No restaurants match that filter"
                  : "No restaurants yet \u2014 create one above to get started"}
              </td>
            </tr>
          )}
          {filtered.map((r) => (
            <tr key={r.id} data-editing={editingId === r.id || undefined}>
              <td style={styles.td}>
                {editingId === r.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={styles.editInput}
                    aria-label="Edit name"
                  />
                ) : (
                  r.name
                )}
              </td>
              <td style={styles.td}>
                {editingId === r.id ? (
                  <input
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    style={styles.editInput}
                    aria-label="Edit city"
                  />
                ) : (
                  r.city
                )}
              </td>
              <td style={styles.td}>
                {editingId === r.id ? (
                  <input
                    value={editCuisine}
                    onChange={(e) => setEditCuisine(e.target.value)}
                    style={styles.editInput}
                    aria-label="Edit cuisine"
                  />
                ) : (
                  r.cuisine || "\u2014"
                )}
              </td>
              <td style={styles.td}>
                <div style={styles.actions}>
                  {editingId === r.id ? (
                    <>
                      <button onClick={() => handleSave(r.id)} style={styles.btnSuccessSmall}>
                        Save
                      </button>
                      <button onClick={cancelEdit} style={styles.btnCancelSmall}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(r)} style={styles.btnSmall}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={confirmDelete === r.id ? styles.btnDanger : styles.btnDangerSmall}
                      >
                        {confirmDelete === r.id ? "Confirm?" : "Delete"}
                      </button>
                    </>
                  )}
                </div>
                {rowError[r.id] && <div style={styles.rowError}>{rowError[r.id]}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

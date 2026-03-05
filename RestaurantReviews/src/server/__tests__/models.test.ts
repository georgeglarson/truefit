import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { migrate } from "../db/schema.js";
import { UserModel } from "../models/user.js";
import { RestaurantModel } from "../models/restaurant.js";
import { ReviewModel } from "../models/review.js";

let db: Database.Database;
let users: UserModel;
let restaurants: RestaurantModel;
let reviews: ReviewModel;

beforeEach(() => {
  db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  migrate(db);
  users = new UserModel(db);
  restaurants = new RestaurantModel(db);
  reviews = new ReviewModel(db);
});

// ── UserModel ───────────────────────────────────────────────────────

describe("UserModel", () => {
  it("creates a user and returns it with id", () => {
    const user = users.create("Alice", "alice@example.com");
    expect(user.id).toBe(1);
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("alice@example.com");
    expect(user.blocked).toBe(0);
    expect(user.created_at).toBeDefined();
  });

  it("auto-increments id", () => {
    const u1 = users.create("Alice", "alice@example.com");
    const u2 = users.create("Bob", "bob@example.com");
    expect(u2.id).toBe(u1.id + 1);
  });

  it("findAll returns all users ordered by id", () => {
    users.create("Alice", "alice@example.com");
    users.create("Bob", "bob@example.com");
    users.create("Carol", "carol@example.com");
    const all = users.findAll();
    expect(all).toHaveLength(3);
    expect(all[0].name).toBe("Alice");
    expect(all[2].name).toBe("Carol");
  });

  it("findAll returns empty when no users", () => {
    expect(users.findAll()).toEqual([]);
  });

  it("findById returns the correct user", () => {
    const created = users.create("Alice", "alice@example.com");
    const found = users.findById(created.id);
    expect(found).toMatchObject({ name: "Alice", email: "alice@example.com" });
  });

  it("findById returns undefined for missing user", () => {
    const found = users.findById(999);
    expect(found).toBeUndefined();
  });

  it("findByEmail returns the correct user", () => {
    users.create("Alice", "alice@example.com");
    const found = users.findByEmail("alice@example.com");
    expect(found?.name).toBe("Alice");
  });

  it("findByEmail returns undefined for missing email", () => {
    const found = users.findByEmail("nobody@example.com");
    expect(found).toBeUndefined();
  });

  it("update changes name and email", () => {
    users.create("Alice", "alice@example.com");
    const updated = users.update(1, "Alicia", "alicia@example.com");
    expect(updated?.name).toBe("Alicia");
    expect(updated?.email).toBe("alicia@example.com");
  });

  it("update returns undefined for missing user", () => {
    const result = users.update(999, "Nobody", "nobody@example.com");
    expect(result).toBeUndefined();
  });

  it("update preserves blocked status", () => {
    users.create("Alice", "alice@example.com");
    users.block(1);
    const updated = users.update(1, "Alicia", "alicia@example.com");
    expect(updated?.blocked).toBe(1);
  });

  it("block sets blocked to 1", () => {
    users.create("Alice", "alice@example.com");
    const blocked = users.block(1);
    expect(blocked?.blocked).toBe(1);
  });

  it("block returns undefined for missing user", () => {
    const result = users.block(999);
    expect(result).toBeUndefined();
  });

  it("unblock sets blocked to 0", () => {
    users.create("Alice", "alice@example.com");
    users.block(1);
    const unblocked = users.unblock(1);
    expect(unblocked?.blocked).toBe(0);
  });

  it("unblock returns undefined for missing user", () => {
    const result = users.unblock(999);
    expect(result).toBeUndefined();
  });

  it("unblock is idempotent on non-blocked user", () => {
    users.create("Alice", "alice@example.com");
    const result = users.unblock(1);
    expect(result?.blocked).toBe(0);
  });

  it("isBlocked returns true for blocked user", () => {
    users.create("Alice", "alice@example.com");
    users.block(1);
    expect(users.isBlocked(1)).toBe(true);
  });

  it("isBlocked returns false for non-blocked user", () => {
    users.create("Alice", "alice@example.com");
    expect(users.isBlocked(1)).toBe(false);
  });

  it("isBlocked returns false for non-existent user", () => {
    expect(users.isBlocked(999)).toBe(false);
  });

  it("enforces unique email constraint", () => {
    users.create("Alice", "alice@example.com");
    expect(() => users.create("Bob", "alice@example.com")).toThrow();
  });

  it("deleteById removes the user and returns true", () => {
    users.create("Alice", "alice@example.com");
    expect(users.deleteById(1)).toBe(true);
    expect(users.findById(1)).toBeUndefined();
  });

  it("deleteById returns false for non-existent user", () => {
    expect(users.deleteById(999)).toBe(false);
  });

  it("deleteById throws on FK violation when user has reviews", () => {
    const user = users.create("Alice", "alice@example.com");
    const restaurant = restaurants.create("Place", "City", "Food");
    reviews.create(user.id, restaurant.id, 5, "Great!");
    expect(() => users.deleteById(user.id)).toThrow(/FOREIGN KEY/);
  });
});

// ── RestaurantModel ─────────────────────────────────────────────────

describe("RestaurantModel", () => {
  it("creates a restaurant with all fields", () => {
    const r = restaurants.create("Pizza Palace", "Pittsburgh", "Italian");
    expect(r.id).toBe(1);
    expect(r.name).toBe("Pizza Palace");
    expect(r.city).toBe("Pittsburgh");
    expect(r.cuisine).toBe("Italian");
  });

  it("creates a restaurant with empty cuisine", () => {
    const r = restaurants.create("Place", "City", "");
    expect(r.cuisine).toBe("");
  });

  it("findById returns correct restaurant", () => {
    const created = restaurants.create("Place", "City", "Food");
    const found = restaurants.findById(created.id);
    expect(found?.name).toBe("Place");
  });

  it("findById returns undefined for missing", () => {
    expect(restaurants.findById(999)).toBeUndefined();
  });

  it("findByCity returns matching restaurants", () => {
    restaurants.create("A", "Pittsburgh", "");
    restaurants.create("B", "Philadelphia", "");
    restaurants.create("C", "Pittsburgh", "");
    const results = restaurants.findByCity("Pittsburgh");
    expect(results).toHaveLength(2);
  });

  it("findByCity is case-insensitive", () => {
    restaurants.create("A", "Pittsburgh", "");
    const results = restaurants.findByCity("pittsburgh");
    expect(results).toHaveLength(1);
  });

  it("findByCity returns empty for unknown city", () => {
    const results = restaurants.findByCity("Atlantis");
    expect(results).toEqual([]);
  });

  it("findAll returns all restaurants", () => {
    restaurants.create("A", "City1", "");
    restaurants.create("B", "City2", "");
    const all = restaurants.findAll();
    expect(all).toHaveLength(2);
  });

  it("findAll returns empty when none exist", () => {
    expect(restaurants.findAll()).toEqual([]);
  });

  it("update changes name, city, and cuisine", () => {
    restaurants.create("Old Name", "Old City", "Old Cuisine");
    const updated = restaurants.update(1, "New Name", "New City", "New Cuisine");
    expect(updated?.name).toBe("New Name");
    expect(updated?.city).toBe("New City");
    expect(updated?.cuisine).toBe("New Cuisine");
  });

  it("update returns undefined for missing restaurant", () => {
    const result = restaurants.update(999, "Name", "City", "Cuisine");
    expect(result).toBeUndefined();
  });

  it("deleteById removes the restaurant and returns true", () => {
    restaurants.create("Place", "City", "");
    expect(restaurants.deleteById(1)).toBe(true);
    expect(restaurants.findById(1)).toBeUndefined();
  });

  it("deleteById returns false for non-existent restaurant", () => {
    expect(restaurants.deleteById(999)).toBe(false);
  });

  it("deleteById throws on FK violation when restaurant has reviews", () => {
    const user = users.create("Alice", "alice@example.com");
    const restaurant = restaurants.create("Place", "City", "Food");
    reviews.create(user.id, restaurant.id, 5, "Great!");
    expect(() => restaurants.deleteById(restaurant.id)).toThrow(/FOREIGN KEY/);
  });
});

// ── ReviewModel ─────────────────────────────────────────────────────

describe("ReviewModel", () => {
  let userId: number;
  let restaurantId: number;

  beforeEach(() => {
    userId = users.create("Alice", "alice@example.com").id;
    restaurantId = restaurants.create("Place", "City", "Food").id;
  });

  it("creates a review with all fields", () => {
    const r = reviews.create(userId, restaurantId, 5, "Great!");
    expect(r.id).toBe(1);
    expect(r.user_id).toBe(userId);
    expect(r.restaurant_id).toBe(restaurantId);
    expect(r.rating).toBe(5);
    expect(r.body).toBe("Great!");
  });

  it("creates a review with empty body", () => {
    const r = reviews.create(userId, restaurantId, 3, "");
    expect(r.body).toBe("");
  });

  it("findAll returns all reviews ordered by id", () => {
    const r2 = restaurants.create("B", "City", "").id;
    reviews.create(userId, restaurantId, 5, "A");
    reviews.create(userId, r2, 3, "B");
    const all = reviews.findAll();
    expect(all).toHaveLength(2);
    expect(all[0].body).toBe("A");
    expect(all[1].body).toBe("B");
  });

  it("findAll returns empty when no reviews", () => {
    expect(reviews.findAll()).toEqual([]);
  });

  it("findById returns the correct review", () => {
    const created = reviews.create(userId, restaurantId, 4, "Good");
    const found = reviews.findById(created.id);
    expect(found?.rating).toBe(4);
    expect(found?.body).toBe("Good");
  });

  it("findById returns undefined for missing review", () => {
    expect(reviews.findById(999)).toBeUndefined();
  });

  it("findByUserId returns all reviews for a user", () => {
    const r2 = restaurants.create("B", "City", "").id;
    reviews.create(userId, restaurantId, 5, "A");
    reviews.create(userId, r2, 3, "B");
    const found = reviews.findByUserId(userId);
    expect(found).toHaveLength(2);
  });

  it("findByUserId returns empty for user with no reviews", () => {
    expect(reviews.findByUserId(userId)).toEqual([]);
  });

  it("findByRestaurantId returns all reviews for a restaurant", () => {
    const u2 = users.create("Bob", "bob@example.com").id;
    reviews.create(userId, restaurantId, 5, "A");
    reviews.create(u2, restaurantId, 3, "B");
    const found = reviews.findByRestaurantId(restaurantId);
    expect(found).toHaveLength(2);
  });

  it("findByRestaurantId returns empty for restaurant with no reviews", () => {
    expect(reviews.findByRestaurantId(restaurantId)).toEqual([]);
  });

  it("findAllWithNames returns reviews with user and restaurant names", () => {
    reviews.create(userId, restaurantId, 5, "Amazing");
    const result = reviews.findAllWithNames();
    expect(result).toHaveLength(1);
    expect(result[0].user_name).toBe("Alice");
    expect(result[0].restaurant_name).toBe("Place");
    expect(result[0].rating).toBe(5);
  });

  it("findAllWithNames returns empty when no reviews", () => {
    expect(reviews.findAllWithNames()).toEqual([]);
  });

  it("findByUserIdWithNames returns reviews with names for a user", () => {
    const u2 = users.create("Bob", "bob@example.com").id;
    reviews.create(userId, restaurantId, 5, "A");
    reviews.create(u2, restaurantId, 3, "B");
    const result = reviews.findByUserIdWithNames(userId);
    expect(result).toHaveLength(1);
    expect(result[0].user_name).toBe("Alice");
    expect(result[0].restaurant_name).toBe("Place");
  });

  it("findByRestaurantIdWithNames returns reviews with names for a restaurant", () => {
    const u2 = users.create("Bob", "bob@example.com").id;
    const r2 = restaurants.create("Other", "Town", "").id;
    reviews.create(userId, restaurantId, 5, "A");
    reviews.create(u2, r2, 3, "B");
    const result = reviews.findByRestaurantIdWithNames(restaurantId);
    expect(result).toHaveLength(1);
    expect(result[0].user_name).toBe("Alice");
    expect(result[0].restaurant_name).toBe("Place");
  });

  it("update changes rating and body", () => {
    reviews.create(userId, restaurantId, 3, "OK");
    const updated = reviews.update(1, 5, "Actually great!");
    expect(updated?.rating).toBe(5);
    expect(updated?.body).toBe("Actually great!");
  });

  it("update returns undefined for missing review", () => {
    const result = reviews.update(999, 5, "Nope");
    expect(result).toBeUndefined();
  });

  it("update preserves user_id and restaurant_id", () => {
    reviews.create(userId, restaurantId, 3, "OK");
    const updated = reviews.update(1, 5, "Better");
    expect(updated?.user_id).toBe(userId);
    expect(updated?.restaurant_id).toBe(restaurantId);
  });

  it("deleteById removes the review and returns true", () => {
    const r = reviews.create(userId, restaurantId, 4, "ok");
    const deleted = reviews.deleteById(r.id);
    expect(deleted).toBe(true);
    expect(reviews.findById(r.id)).toBeUndefined();
  });

  it("deleteById returns false for non-existent review", () => {
    expect(reviews.deleteById(999)).toBe(false);
  });

  it("enforces rating CHECK constraint (1-5)", () => {
    expect(() => reviews.create(userId, restaurantId, 0, "")).toThrow();
    expect(() => reviews.create(userId, restaurantId, 6, "")).toThrow();
  });

  it("enforces FK constraint on user_id", () => {
    expect(() => reviews.create(999, restaurantId, 3, "")).toThrow();
  });

  it("enforces FK constraint on restaurant_id", () => {
    expect(() => reviews.create(userId, 999, 3, "")).toThrow();
  });
});

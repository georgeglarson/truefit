import type Database from "better-sqlite3";

export interface Review {
  id: number;
  user_id: number;
  restaurant_id: number;
  rating: number;
  body: string;
  created_at: string;
}

export interface ReviewWithNames extends Review {
  user_name: string;
  restaurant_name: string;
}

export class ReviewModel {
  constructor(private db: Database.Database) {}

  create(
    userId: number,
    restaurantId: number,
    rating: number,
    body: string = ""
  ): Review {
    const stmt = this.db.prepare(
      "INSERT INTO reviews (user_id, restaurant_id, rating, body) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(userId, restaurantId, rating, body);
    return this.findById(info.lastInsertRowid as number)!;
  }

  findAll(): Review[] {
    return this.db
      .prepare("SELECT * FROM reviews ORDER BY id")
      .all() as Review[];
  }

  findById(id: number): Review | undefined {
    return this.db
      .prepare("SELECT * FROM reviews WHERE id = ?")
      .get(id) as Review | undefined;
  }

  findByUserId(userId: number): Review[] {
    return this.db
      .prepare("SELECT * FROM reviews WHERE user_id = ? ORDER BY id")
      .all(userId) as Review[];
  }

  findByRestaurantId(restaurantId: number): Review[] {
    return this.db
      .prepare("SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY id")
      .all(restaurantId) as Review[];
  }

  findAllWithNames(): ReviewWithNames[] {
    return this.db
      .prepare(
        `SELECT r.*, u.name AS user_name, rest.name AS restaurant_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         JOIN restaurants rest ON r.restaurant_id = rest.id
         ORDER BY r.id`
      )
      .all() as ReviewWithNames[];
  }

  findByUserIdWithNames(userId: number): ReviewWithNames[] {
    return this.db
      .prepare(
        `SELECT r.*, u.name AS user_name, rest.name AS restaurant_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         JOIN restaurants rest ON r.restaurant_id = rest.id
         WHERE r.user_id = ?
         ORDER BY r.id`
      )
      .all(userId) as ReviewWithNames[];
  }

  findByRestaurantIdWithNames(restaurantId: number): ReviewWithNames[] {
    return this.db
      .prepare(
        `SELECT r.*, u.name AS user_name, rest.name AS restaurant_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         JOIN restaurants rest ON r.restaurant_id = rest.id
         WHERE r.restaurant_id = ?
         ORDER BY r.id`
      )
      .all(restaurantId) as ReviewWithNames[];
  }

  update(id: number, rating: number, body: string): Review | undefined {
    this.db
      .prepare("UPDATE reviews SET rating = ?, body = ? WHERE id = ?")
      .run(rating, body, id);
    return this.findById(id);
  }

  deleteById(id: number): boolean {
    const info = this.db
      .prepare("DELETE FROM reviews WHERE id = ?")
      .run(id);
    return info.changes > 0;
  }
}

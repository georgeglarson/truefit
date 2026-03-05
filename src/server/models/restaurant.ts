import type Database from "better-sqlite3";

export interface Restaurant {
  id: number;
  name: string;
  city: string;
  cuisine: string;
  created_at: string;
}

export class RestaurantModel {
  constructor(private db: Database.Database) {}

  create(name: string, city: string, cuisine: string = ""): Restaurant {
    const stmt = this.db.prepare("INSERT INTO restaurants (name, city, cuisine) VALUES (?, ?, ?)");
    const info = stmt.run(name, city, cuisine);
    return this.findById(info.lastInsertRowid as number)!;
  }

  findById(id: number): Restaurant | undefined {
    return this.db.prepare("SELECT * FROM restaurants WHERE id = ?").get(id) as
      | Restaurant
      | undefined;
  }

  findByCity(city: string): Restaurant[] {
    return this.db
      .prepare("SELECT * FROM restaurants WHERE city = ? COLLATE NOCASE")
      .all(city) as Restaurant[];
  }

  findAll(): Restaurant[] {
    return this.db.prepare("SELECT * FROM restaurants ORDER BY id").all() as Restaurant[];
  }

  update(id: number, name: string, city: string, cuisine: string): Restaurant | undefined {
    this.db
      .prepare("UPDATE restaurants SET name = ?, city = ?, cuisine = ? WHERE id = ?")
      .run(name, city, cuisine, id);
    return this.findById(id);
  }

  deleteById(id: number): boolean {
    const info = this.db.prepare("DELETE FROM restaurants WHERE id = ?").run(id);
    return info.changes > 0;
  }
}

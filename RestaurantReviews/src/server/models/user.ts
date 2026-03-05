import type Database from "better-sqlite3";

export interface User {
  id: number;
  name: string;
  email: string;
  blocked: number;
  created_at: string;
}

export class UserModel {
  constructor(private db: Database.Database) {}

  create(name: string, email: string): User {
    const stmt = this.db.prepare(
      "INSERT INTO users (name, email) VALUES (?, ?)"
    );
    const info = stmt.run(name, email);
    return this.findById(info.lastInsertRowid as number)!;
  }

  findAll(): User[] {
    return this.db
      .prepare("SELECT * FROM users ORDER BY id")
      .all() as User[];
  }

  findById(id: number): User | undefined {
    return this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as User | undefined;
  }

  findByEmail(email: string): User | undefined {
    return this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as User | undefined;
  }

  update(id: number, name: string, email: string): User | undefined {
    this.db
      .prepare("UPDATE users SET name = ?, email = ? WHERE id = ?")
      .run(name, email, id);
    return this.findById(id);
  }

  block(id: number): User | undefined {
    this.db.prepare("UPDATE users SET blocked = 1 WHERE id = ?").run(id);
    return this.findById(id);
  }

  unblock(id: number): User | undefined {
    this.db.prepare("UPDATE users SET blocked = 0 WHERE id = ?").run(id);
    return this.findById(id);
  }

  isBlocked(id: number): boolean {
    const user = this.findById(id);
    return user ? user.blocked === 1 : false;
  }

  deleteById(id: number): boolean {
    const info = this.db
      .prepare("DELETE FROM users WHERE id = ?")
      .run(id);
    return info.changes > 0;
  }
}

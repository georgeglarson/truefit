import Database from "better-sqlite3";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized — call setDb() first");
  }
  return db;
}

export function createDb(path: string = ":memory:"): Database.Database {
  const instance = new Database(path);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  return instance;
}

export function setDb(instance: Database.Database): void {
  db = instance;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

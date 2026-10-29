import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db, sqlite, createDatabaseConnection } from "./client";
import path from "path";

export function runMigrations(dbInstance = db) {
  const migrationsFolder = path.resolve(import.meta.dirname, "../../../drizzle");
  migrate(dbInstance, { migrationsFolder });
}

if (import.meta.main) {
  try {
    console.log("Aplicando migrations SQLite via Drizzle...");
    runMigrations();
    console.log("Migrations aplicadas com sucesso!");
    sqlite.close();
    process.exit(0);
  } catch (err) {
    console.error("Falha ao aplicar migrations:", err);
    process.exit(1);
  }
}

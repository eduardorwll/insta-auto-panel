import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema";
import path from "path";
import { mkdirSync } from "fs";

export interface DatabaseConnection {
  sqlite: Database;
  db: ReturnType<typeof drizzle<typeof schema>>;
}

/**
 * Cria uma nova conexão com SQLite configurada para alta confiabilidade:
 * - Modo WAL (Write-Ahead Logging) para concorrência leitura/escrita
 * - Foreign Keys habilitadas para integridade referencial
 * - Synchronous NORMAL para equilíbrio ótimo de persistência e performance
 * - Execução automática de migrations pendentes
 */
export function createDatabaseConnection(dbPath: string = "./data/social_panel.db"): DatabaseConnection {
  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (dir) {
      mkdirSync(dir, { recursive: true });
    }
  }

  const sqlite = new Database(dbPath, { create: true });
  sqlite.run("PRAGMA journal_mode = WAL;");
  sqlite.run("PRAGMA foreign_keys = ON;");
  sqlite.run("PRAGMA synchronous = NORMAL;");

  const db = drizzle(sqlite, { schema });

  // Auto-aplicar migrations se for arquivo em disco
  if (dbPath !== ":memory:") {
    try {
      const migrationsFolder = path.resolve(import.meta.dirname, "../../../drizzle");
      migrate(db, { migrationsFolder });
    } catch {}
    // Garante colunas do Marco 6 (OpenDesign Studio) em bancos pré-existentes
    for (const alterSql of [
      "ALTER TABLE post_slides ADD COLUMN template_id text DEFAULT 'modern-bold';",
      "ALTER TABLE post_slides ADD COLUMN rendered_image_url text;",
      "ALTER TABLE post_slides ADD COLUMN image_prompt text;",
    ]) {
      try {
        sqlite.run(alterSql);
      } catch {}
    }
  }

  return { sqlite, db };
}

/**
 * Factory para criar banco de dados isolado em memória para suites de teste TDD
 */
export function createTestDb(): DatabaseConnection {
  const sqlite = new Database(":memory:");
  sqlite.run("PRAGMA foreign_keys = ON;");
  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}

let defaultConnection: DatabaseConnection | null = null;

export function getDatabase(): DatabaseConnection {
  if (!defaultConnection) {
    defaultConnection = createDatabaseConnection();
  }
  return defaultConnection;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDatabase().db, prop, receiver);
  },
});

export const sqlite = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDatabase().sqlite, prop, receiver);
  },
});

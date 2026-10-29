import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
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

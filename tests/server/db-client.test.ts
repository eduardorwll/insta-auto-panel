import { describe, expect, it } from "bun:test";
import { createDatabaseConnection, createTestDb } from "@/server/db/client";
import { unlinkSync } from "fs";

describe("SQLite ACID Client com Bun e Drizzle", () => {
  it("deve inicializar com modo WAL e foreign_keys ativados para arquivo de banco", () => {
    const tempPath = `/tmp/test_panel_${Date.now()}.db`;
    try {
      const { sqlite } = createDatabaseConnection(tempPath);
      const journalMode = sqlite.query("PRAGMA journal_mode;").get() as { journal_mode: string };
      const foreignKeys = sqlite.query("PRAGMA foreign_keys;").get() as { foreign_keys: number };
      const synchronous = sqlite.query("PRAGMA synchronous;").get() as { synchronous: number };

      expect(journalMode.journal_mode.toLowerCase()).toBe("wal");
      expect(foreignKeys.foreign_keys).toBe(1);
      // SQLite synchronous: 1 is NORMAL, 2 is FULL
      expect(synchronous.synchronous).toBe(1);
      sqlite.close();
    } finally {
      try {
        unlinkSync(tempPath);
        unlinkSync(`${tempPath}-wal`);
        unlinkSync(`${tempPath}-shm`);
      } catch {}
    }
  });

  it("createTestDb deve retornar banco isolado com foreign_keys habilitados", () => {
    const { sqlite, db } = createTestDb();
    expect(db).toBeDefined();

    const foreignKeys = sqlite.query("PRAGMA foreign_keys;").get() as { foreign_keys: number };
    expect(foreignKeys.foreign_keys).toBe(1);

    // Testar enforcement de integridade referencial
    sqlite.run("CREATE TABLE parent (id TEXT PRIMARY KEY);");
    sqlite.run("CREATE TABLE child (id TEXT PRIMARY KEY, parent_id TEXT REFERENCES parent(id));");

    expect(() => {
      sqlite.run("INSERT INTO child (id, parent_id) VALUES ('c1', 'non_existent_parent');");
    }).toThrow();

    sqlite.close();
  });
});

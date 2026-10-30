import { describe, expect, it } from "bun:test";
import { createDatabaseConnection } from "@/server/db/client";
import { runMigrations } from "@/server/db/migrate";
import { runSeed } from "@/server/db/seed";
import { companies, ai_provider_settings } from "@/server/db/schema";
import { unlinkSync } from "fs";

describe("Drizzle Migrations & Seed Automatizado", () => {
  it("deve aplicar migrations Drizzle e executar seed em banco limpo", async () => {
    const tempDbPath = `/tmp/test_migrate_${Date.now()}.db`;
    try {
      const { sqlite, db } = createDatabaseConnection(tempDbPath);

      // Aplica migrations
      runMigrations(db);

      // Executa seed inicial
      await runSeed(db);

      // Valida que tabelas existem e possuem os registros do seed
      const seededCompanies = await db.select().from(companies);
      const seededAi = await db.select().from(ai_provider_settings);

      expect(seededCompanies.length).toBe(1);
      expect(seededCompanies[0]?.id).toBe("demo_corp");
      expect(seededCompanies[0]?.primaryColor).toBe("#0D9488");

      expect(seededAi.length).toBe(1);
      expect(seededAi[0]?.id).toBe("global");
      expect(seededAi[0]?.provider).toBe("gemini");
      expect(seededAi[0]?.modelName).toBe("gemini-2.5-flash");

      sqlite.close();
    } finally {
      try {
        unlinkSync(tempDbPath);
        unlinkSync(`${tempDbPath}-wal`);
        unlinkSync(`${tempDbPath}-shm`);
      } catch {}
    }
  });
});

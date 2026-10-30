import { describe, expect, it } from "bun:test";
import { createDatabaseConnection } from "@/server/db/client";
import { runMigrations } from "@/server/db/migrate";
import { companies } from "@/server/db/schema";
import { sanitizeDatabase } from "@/server/db/sanitize";
import { eq, ne } from "drizzle-orm";
import { unlinkSync } from "fs";

describe("Integridade de Banco & Prevenção de Leakage de Empresas de Teste", () => {
  it("deve detectar e sanitizar empresas de teste deixando apenas demo_corp canônico em ambiente de teste", async () => {
    const tempDbPath = `/tmp/test_leakage_${Date.now()}.db`;
    try {
      const { sqlite, db: testDb } = createDatabaseConnection(tempDbPath);
      runMigrations(testDb);

      // 1. Simular inserção de empresa de teste temporária
      const tempTestId = `leak_test_dummy_${Date.now()}`;
      await testDb.insert(companies).values({
        id: tempTestId,
        name: "Empresa Fake Residual",
        instagramHandle: "@empresa_residual",
        niche: "Teste",
        toneOfVoice: "Neutro",
      });

      const beforeSanitize = await testDb.select().from(companies);
      expect(beforeSanitize.some((c) => c.id === tempTestId)).toBe(true);

      // 2. Executar sanitizador
      const result = await sanitizeDatabase(testDb);
      expect(result.removedCompaniesCount).toBeGreaterThanOrEqual(1);
      expect(result.removedIds).toContain(tempTestId);

      // 3. Garantir que nenhuma empresa não-demo existe no banco
      const afterSanitize = await testDb.select().from(companies).where(ne(companies.id, "demo_corp"));
      expect(afterSanitize.length).toBe(0);

      // 4. Garantir que demo_corp canônica está íntegra com Brand Kit e cronogramas
      const [demoCorp] = await testDb.select().from(companies).where(eq(companies.id, "demo_corp"));
      expect(demoCorp).toBeDefined();
      expect(demoCorp?.name).toBe("Demo Corp");
      expect(demoCorp?.instagramHandle).toBe("@democorp");

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

import { describe, expect, it } from "bun:test";
import { db } from "@/server/db/client";
import { companies, weekly_schedules, posts, post_slides } from "@/server/db/schema";
import { sanitizeDatabase } from "@/server/db/sanitize";
import { eq, ne } from "drizzle-orm";

describe("Integridade de Banco & Prevenção de Leakage de Empresas de Teste", () => {
  it("deve detectar e sanitizar empresas de teste deixando apenas demo_corp canônico", async () => {
    // 1. Simular inserção de empresa de teste temporária
    const tempTestId = `leak_test_dummy_${Date.now()}`;
    await db.insert(companies).values({
      id: tempTestId,
      name: "Empresa Fake Residual",
      instagramHandle: "@empresa_residual",
      niche: "Teste",
      toneOfVoice: "Neutro",
    });

    const beforeSanitize = await db.select().from(companies);
    expect(beforeSanitize.some((c) => c.id === tempTestId)).toBe(true);

    // 2. Executar sanitizador
    const result = await sanitizeDatabase(db);
    expect(result.removedCompaniesCount).toBeGreaterThanOrEqual(1);
    expect(result.removedIds).toContain(tempTestId);

    // 3. Garantir que nenhuma empresa não-demo existe no banco
    const afterSanitize = await db.select().from(companies).where(ne(companies.id, "demo_corp"));
    expect(afterSanitize.length).toBe(0);

    // 4. Garantir que demo_corp canônica está íntegra com Brand Kit e cronogramas
    const [demoCorp] = await db.select().from(companies).where(eq(companies.id, "demo_corp"));
    expect(demoCorp).toBeDefined();
    expect(demoCorp?.name).toBe("Demo Corp");
    expect(demoCorp?.instagramHandle).toBe("@democorp");
  });

  it("o banco de dados do sistema deve conter exclusivamente a empresa demo_corp após os testes", async () => {
    const allCompanies = await db.select().from(companies);
    const nonDemoCompanies = allCompanies.filter((c) => c.id !== "demo_corp");

    expect(nonDemoCompanies).toEqual([]);
    expect(allCompanies.length).toBe(1);
    expect(allCompanies[0]?.id).toBe("demo_corp");
  });
});

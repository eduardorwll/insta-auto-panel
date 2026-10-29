import { describe, expect, it, beforeEach } from "bun:test";
import { createTestDb } from "@/server/db/client";
import { companies, photo_assets, photoCategorySchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("Schema e Integridade: Companies & Photo Assets", () => {
  let testEnv: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testEnv = createTestDb();
    // Cria as tabelas para o teste no banco isolado
    testEnv.sqlite.run(`
      CREATE TABLE companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        instagram_handle TEXT NOT NULL,
        niche TEXT NOT NULL,
        tone_of_voice TEXT NOT NULL,
        primary_color TEXT DEFAULT '#6366F1',
        secondary_color TEXT DEFAULT '#EC4899',
        background_color TEXT DEFAULT '#0F172A',
        accent_color TEXT DEFAULT '#10B981',
        whatsapp_number TEXT,
        whatsapp_default_message TEXT,
        website_url TEXT,
        canva_template_id TEXT,
        created_at INTEGER
      );
    `);

    testEnv.sqlite.run(`
      CREATE TABLE photo_assets (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        times_used INTEGER DEFAULT 0,
        uploaded_at INTEGER
      );
    `);
  });

  it("deve criar uma empresa com cores padrão do Brand Kit", async () => {
    await testEnv.db.insert(companies).values({
      id: "clinica_sorriso",
      name: "Clínica Sorriso",
      instagramHandle: "@clinicasorriso",
      niche: "Odontologia",
      toneOfVoice: "Acolhedor e Especialista",
    });

    const [saved] = await testEnv.db
      .select()
      .from(companies)
      .where(eq(companies.id, "clinica_sorriso"));

    expect(saved).toBeDefined();
    expect(saved?.name).toBe("Clínica Sorriso");
    expect(saved?.primaryColor).toBe("#6366F1");
    expect(saved?.secondaryColor).toBe("#EC4899");
    expect(saved?.backgroundColor).toBe("#0F172A");
    expect(saved?.accentColor).toBe("#10B981");
  });

  it("deve associar photo_assets a uma empresa e validar categorias válidas", async () => {
    await testEnv.db.insert(companies).values({
      id: "techcorp",
      name: "TechCorp",
      instagramHandle: "@techcorp",
      niche: "SaaS B2B",
      toneOfVoice: "Direto e Tecnológico",
    });

    // Validar categorias permitidas pelo schema Zod
    expect(photoCategorySchema.safeParse("Especialista").success).toBe(true);
    expect(photoCategorySchema.safeParse("Produto").success).toBe(true);
    expect(photoCategorySchema.safeParse("Logo").success).toBe(true);
    expect(photoCategorySchema.safeParse("Fundo").success).toBe(true);
    expect(photoCategorySchema.safeParse("CategoriaInvalida").success).toBe(false);

    await testEnv.db.insert(photo_assets).values({
      id: "photo_01",
      companyId: "techcorp",
      filename: "photo_01.jpg",
      originalName: "foto-fundador.jpg",
      filePath: "data/uploads/photo_01.jpg",
      category: "Especialista",
      tags: JSON.stringify(["fundador", "palestra"]),
    });

    const photos = await testEnv.db
      .select()
      .from(photo_assets)
      .where(eq(photo_assets.companyId, "techcorp"));

    expect(photos.length).toBe(1);
    expect(photos[0]?.category).toBe("Especialista");
    expect(photos[0]?.timesUsed).toBe(0);
  });

  it("deve impedir inserção de photo_assets para empresa inexistente (Foreign Key)", async () => {
    expect(async () => {
      await testEnv.db.insert(photo_assets).values({
        id: "photo_orphan",
        companyId: "empresa_que_nao_existe",
        filename: "orphan.jpg",
        originalName: "orphan.jpg",
        filePath: "data/uploads/orphan.jpg",
        category: "Logo",
      });
    }).toThrow();
  });

  it("deve deletar em cascata photo_assets quando a empresa for excluída", async () => {
    await testEnv.db.insert(companies).values({
      id: "temp_company",
      name: "Temp Company",
      instagramHandle: "@temp",
      niche: "Varejo",
      toneOfVoice: "Comercial",
    });

    await testEnv.db.insert(photo_assets).values({
      id: "photo_temp",
      companyId: "temp_company",
      filename: "temp.jpg",
      originalName: "temp.jpg",
      filePath: "data/uploads/temp.jpg",
      category: "Produto",
    });

    // Excluir a empresa
    await testEnv.db.delete(companies).where(eq(companies.id, "temp_company"));

    // Conferir se a foto foi removida em cascata
    const photos = await testEnv.db
      .select()
      .from(photo_assets)
      .where(eq(photo_assets.companyId, "temp_company"));

    expect(photos.length).toBe(0);
  });
});

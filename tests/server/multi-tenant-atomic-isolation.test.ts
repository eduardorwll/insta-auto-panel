import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { createDatabaseConnection } from "@/server/db/client";
import { runMigrations } from "@/server/db/migrate";
import {
  companies,
  company_settings,
  photo_assets,
  weekly_schedules,
  posts,
  post_slides,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { unlinkSync, existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

describe("Auditoria de Isolamento Atômico Multi-Tenant (Cross-Tenant Zero Leakage)", () => {
  const tempDbPath = `/tmp/test_isolation_${Date.now()}.db`;
  let sqliteInstance: any;
  let testDb: any;

  const TENANT_A = "tenant_alpha";
  const TENANT_B = "tenant_beta";

  beforeAll(async () => {
    const conn = createDatabaseConnection(tempDbPath);
    sqliteInstance = conn.sqlite;
    testDb = conn.db;
    runMigrations(testDb);

    // 1. Cadastrar Tenant Alpha (ex: Tecnologia)
    await testDb.insert(companies).values({
      id: TENANT_A,
      name: "Alpha Tech Solutions",
      instagramHandle: "@alphatech",
      niche: "Inteligência Artificial e Nuvem",
      toneOfVoice: "Inovador e Técnico",
      primaryColor: "#0D9488",
      secondaryColor: "#0284C7",
      backgroundColor: "#0F172A",
      accentColor: "#10B981",
      whatsappNumber: "5511999990001",
      websiteUrl: "https://alphatech.example.com",
      seoDisplayName: "Alpha Tech | IA e Nuvem",
      bioText: "Soluções corporativas em nuvem e IA.",
      targetKeywords: "inteligencia artificial, cloud computing",
    });

    // 2. Cadastrar Tenant Beta (ex: Odontologia)
    await testDb.insert(companies).values({
      id: TENANT_B,
      name: "Clínica Odonto Beta",
      instagramHandle: "@odontobeta",
      niche: "Odontologia Estética",
      toneOfVoice: "Acolhedor e Educativo",
      primaryColor: "#EC4899",
      secondaryColor: "#8B5CF6",
      backgroundColor: "#18181B",
      accentColor: "#F59E0B",
      whatsappNumber: "5511999990002",
      websiteUrl: "https://odontobeta.example.com",
      seoDisplayName: "Odonto Beta | Sorrisos",
      bioText: "Cuidando do seu sorriso com excelência.",
      targetKeywords: "odontologia, clareamento, lentes de contato dental",
    });
  });

  afterAll(async () => {
    try {
      sqliteInstance.close();
      if (existsSync(tempDbPath)) unlinkSync(tempDbPath);
      if (existsSync(`${tempDbPath}-wal`)) unlinkSync(`${tempDbPath}-wal`);
      if (existsSync(`${tempDbPath}-shm`)) unlinkSync(`${tempDbPath}-shm`);
    } catch {}
  });

  it("1. Parâmetros e Brand Kit devem ser estritamente isolados sem cruzamento de dados", async () => {
    const [alpha] = await testDb.select().from(companies).where(eq(companies.id, TENANT_A));
    const [beta] = await testDb.select().from(companies).where(eq(companies.id, TENANT_B));

    expect(alpha).toBeDefined();
    expect(beta).toBeDefined();

    // Verificação de divergência total
    expect(alpha.name).toBe("Alpha Tech Solutions");
    expect(beta.name).toBe("Clínica Odonto Beta");
    expect(alpha.primaryColor).toBe("#0D9488");
    expect(beta.primaryColor).toBe("#EC4899");
    expect(alpha.niche).not.toBe(beta.niche);
    expect(alpha.targetKeywords).not.toBe(beta.targetKeywords);
  });

  it("2. Cookies de sessão do Instagram e Settings devem ser atômicos por empresa", async () => {
    // Configura cookies do Instagram para Alpha
    await testDb.insert(company_settings).values({
      companyId: TENANT_A,
      instagramSessionId: "session_secret_alpha_123456",
      instagramCsrfToken: "csrf_alpha_789",
      instagramDsUserId: "111111",
      instagramCookiesJson: JSON.stringify([{ name: "sessionid", value: "secret_alpha" }]),
      instagramSessionStatus: "active",
      preferredImageProvider: "gemini-imagen",
    });

    // Configura cookies do Instagram para Beta
    await testDb.insert(company_settings).values({
      companyId: TENANT_B,
      instagramSessionId: "session_secret_beta_654321",
      instagramCsrfToken: "csrf_beta_987",
      instagramDsUserId: "222222",
      instagramCookiesJson: JSON.stringify([{ name: "sessionid", value: "secret_beta" }]),
      instagramSessionStatus: "active",
      preferredImageProvider: "openai-image",
    });

    // Consultas estritas por companyId
    const [settingsA] = await testDb
      .select()
      .from(company_settings)
      .where(eq(company_settings.companyId, TENANT_A));

    const [settingsB] = await testDb
      .select()
      .from(company_settings)
      .where(eq(company_settings.companyId, TENANT_B));

    expect(settingsA.instagramSessionId).toBe("session_secret_alpha_123456");
    expect(settingsB.instagramSessionId).toBe("session_secret_beta_654321");
    expect(settingsA.instagramDsUserId).toBe("111111");
    expect(settingsB.instagramDsUserId).toBe("222222");
    expect(settingsA.preferredImageProvider).toBe("gemini-imagen");
    expect(settingsB.preferredImageProvider).toBe("openai-image");

    // Prova de não contaminação cruzada
    expect(settingsA.instagramSessionId).not.toBe(settingsB.instagramSessionId);
  });

  it("3. Banco de fotos base da marca deve pertencer exclusivamente ao respectivo tenant", async () => {
    // Foto do Tenant Alpha
    const photoAlphaId = `photo_${TENANT_A}_001`;
    await testDb.insert(photo_assets).values({
      id: photoAlphaId,
      companyId: TENANT_A,
      filename: `${photoAlphaId}_server_rack.png`,
      originalName: "server_rack.png",
      filePath: `data/uploads/${photoAlphaId}_server_rack.png`,
      category: "Produto",
      tags: JSON.stringify(["datacenter", "cloud"]),
    });

    // Foto do Tenant Beta
    const photoBetaId = `photo_${TENANT_B}_001`;
    await testDb.insert(photo_assets).values({
      id: photoBetaId,
      companyId: TENANT_B,
      filename: `${photoBetaId}_consultorio.png`,
      originalName: "consultorio.png",
      filePath: `data/uploads/${photoBetaId}_consultorio.png`,
      category: "Especialista",
      tags: JSON.stringify(["dentista", "clinica"]),
    });

    // Query de fotos do Tenant Alpha
    const photosA = await testDb
      .select()
      .from(photo_assets)
      .where(eq(photo_assets.companyId, TENANT_A));

    // Query de fotos do Tenant Beta
    const photosB = await testDb
      .select()
      .from(photo_assets)
      .where(eq(photo_assets.companyId, TENANT_B));

    expect(photosA.length).toBe(1);
    expect(photosA[0].id).toBe(photoAlphaId);
    expect(photosA[0].companyId).toBe(TENANT_A);

    expect(photosB.length).toBe(1);
    expect(photosB[0].id).toBe(photoBetaId);
    expect(photosB[0].companyId).toBe(TENANT_B);

    // Alpha NUNCA pode ter acesso à foto de Beta
    expect(photosA.some((p: any) => p.companyId === TENANT_B)).toBe(false);
    expect(photosB.some((p: any) => p.companyId === TENANT_A)).toBe(false);
  });

  it("4. Cronogramas semanais e listas de posts devem ser totalmente particionados por tenant", async () => {
    const week = "2026-11-02";
    const schedA = `sched_${TENANT_A}_${week.replace(/-/g, "")}`;
    const schedB = `sched_${TENANT_B}_${week.replace(/-/g, "")}`;

    // Cronograma Alpha
    await testDb.insert(weekly_schedules).values({
      id: schedA,
      companyId: TENANT_A,
      weekStartDate: week,
    });

    const postAId = `post_${schedA}_segunda`;
    await testDb.insert(posts).values({
      id: postAId,
      scheduleId: schedA,
      companyId: TENANT_A,
      dayOfWeek: "segunda",
      theme: "Arquitetura de Microsserviços e Kubernetes",
      category: "Tutorial",
      slideCount: 5,
      scheduledTime: "09:00",
      status: "draft",
    });

    // Cronograma Beta
    await testDb.insert(weekly_schedules).values({
      id: schedB,
      companyId: TENANT_B,
      weekStartDate: week,
    });

    const postBId = `post_${schedB}_segunda`;
    await testDb.insert(posts).values({
      id: postBId,
      scheduleId: schedB,
      companyId: TENANT_B,
      dayOfWeek: "segunda",
      theme: "5 Cuidados Essenciais Após o Clareamento Dental",
      category: "Dica Prática",
      slideCount: 4,
      scheduledTime: "18:00",
      status: "draft",
    });

    // Busca de cronograma filtrado por Tenant Alpha
    const scheduleA = await testDb
      .select()
      .from(weekly_schedules)
      .where(and(eq(weekly_schedules.companyId, TENANT_A), eq(weekly_schedules.weekStartDate, week)));

    const postsA = await testDb
      .select()
      .from(posts)
      .where(eq(posts.scheduleId, schedA));

    // Busca de cronograma filtrado por Tenant Beta
    const scheduleB = await testDb
      .select()
      .from(weekly_schedules)
      .where(and(eq(weekly_schedules.companyId, TENANT_B), eq(weekly_schedules.weekStartDate, week)));

    const postsB = await testDb
      .select()
      .from(posts)
      .where(eq(posts.scheduleId, schedB));

    expect(scheduleA.length).toBe(1);
    expect(scheduleA[0].id).toBe(schedA);
    expect(postsA.length).toBe(1);
    expect(postsA[0].theme).toBe("Arquitetura de Microsserviços e Kubernetes");
    expect(postsA[0].companyId).toBe(TENANT_A);

    expect(scheduleB.length).toBe(1);
    expect(scheduleB[0].id).toBe(schedB);
    expect(postsB.length).toBe(1);
    expect(postsB[0].theme).toBe("5 Cuidados Essenciais Após o Clareamento Dental");
    expect(postsB[0].companyId).toBe(TENANT_B);

    // Prova matemática de não sobreposição
    expect(postsA[0].id).not.toBe(postsB[0].id);
    expect(postsA[0].theme).not.toBe(postsB[0].theme);
  });

  it("5. Exclusão em cascata (onDelete: cascade) de um Tenant não afeta os dados do outro", async () => {
    // Remove Tenant Alpha por completo
    await testDb.delete(companies).where(eq(companies.id, TENANT_A));

    // Verifica que Tenant Alpha e todas suas tabelas filhas foram removidas
    const alphaComp = await testDb.select().from(companies).where(eq(companies.id, TENANT_A));
    const alphaSettings = await testDb.select().from(company_settings).where(eq(company_settings.companyId, TENANT_A));
    const alphaPhotos = await testDb.select().from(photo_assets).where(eq(photo_assets.companyId, TENANT_A));
    const alphaSchedules = await testDb.select().from(weekly_schedules).where(eq(weekly_schedules.companyId, TENANT_A));
    const alphaPosts = await testDb.select().from(posts).where(eq(posts.companyId, TENANT_A));

    expect(alphaComp.length).toBe(0);
    expect(alphaSettings.length).toBe(0);
    expect(alphaPhotos.length).toBe(0);
    expect(alphaSchedules.length).toBe(0);
    expect(alphaPosts.length).toBe(0);

    // Garante que Tenant Beta permanece 100% intacto e íntegro
    const betaComp = await testDb.select().from(companies).where(eq(companies.id, TENANT_B));
    const betaSettings = await testDb.select().from(company_settings).where(eq(company_settings.companyId, TENANT_B));
    const betaPhotos = await testDb.select().from(photo_assets).where(eq(photo_assets.companyId, TENANT_B));
    const betaSchedules = await testDb.select().from(weekly_schedules).where(eq(weekly_schedules.companyId, TENANT_B));
    const betaPosts = await testDb.select().from(posts).where(eq(posts.companyId, TENANT_B));

    expect(betaComp.length).toBe(1);
    expect(betaComp[0].name).toBe("Clínica Odonto Beta");
    expect(betaSettings.length).toBe(1);
    expect(betaPhotos.length).toBe(1);
    expect(betaSchedules.length).toBe(1);
    expect(betaPosts.length).toBe(1);
  });
});

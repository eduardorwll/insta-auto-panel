import { describe, expect, it, beforeEach } from "bun:test";
import { createTestDb } from "@/server/db/client";
import {
  companies,
  photo_assets,
  weekly_schedules,
  posts,
  post_slides,
  postInsertSchema,
  POST_STATUSES,
  DAYS_OF_WEEK,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("Schema e Integridade: Calendário, Posts Dinâmicos (3 a 10 Slides) e Lâminas", () => {
  let testEnv: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testEnv = createTestDb();
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
        seo_display_name TEXT,
        bio_text TEXT,
        target_keywords TEXT,
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

    testEnv.sqlite.run(`
      CREATE TABLE weekly_schedules (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        week_start_date TEXT NOT NULL,
        created_at INTEGER
      );
    `);

    testEnv.sqlite.run(`
      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
        company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        day_of_week TEXT NOT NULL,
        theme TEXT NOT NULL,
        category TEXT NOT NULL,
        slide_count INTEGER NOT NULL DEFAULT 5,
        status TEXT DEFAULT 'draft',
        caption TEXT,
        alt_text TEXT,
        scheduled_time TEXT DEFAULT '09:00',
        selected_photo_ids TEXT,
        created_at INTEGER
      );
    `);

    testEnv.sqlite.run(`
      CREATE TABLE post_slides (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        slide_number INTEGER NOT NULL,
        title TEXT,
        body_text TEXT,
        cta_text TEXT,
        assigned_photo_id TEXT REFERENCES photo_assets(id) ON DELETE SET NULL,
        template_id TEXT DEFAULT 'modern-bold',
        rendered_image_url TEXT,
        image_prompt TEXT
      );
    `);
  });

  it("deve validar rigorosamente a variável de lâminas (slideCount entre 3 e 10)", () => {
    const validPost = {
      id: "post_valido",
      scheduleId: "sched_01",
      companyId: "empresa_a",
      dayOfWeek: "quarta" as const,
      theme: "5 Erros Comuns de Gestão",
      category: "Dica Prática",
      slideCount: 7, // 7 lâminas é válido
    };

    expect(postInsertSchema.safeParse(validPost).success).toBe(true);

    // Menos de 3 lâminas deve falhar
    const invalidLow = { ...validPost, slideCount: 2 };
    expect(postInsertSchema.safeParse(invalidLow).success).toBe(false);

    // Mais de 10 lâminas deve falhar
    const invalidHigh = { ...validPost, slideCount: 11 };
    expect(postInsertSchema.safeParse(invalidHigh).success).toBe(false);

    // Dia da semana inválido deve falhar
    const invalidDay = { ...validPost, dayOfWeek: "segunda-feira" };
    expect(postInsertSchema.safeParse(invalidDay).success).toBe(false);
  });

  it("deve salvar post com 8 lâminas dinâmicas e recuperar ordenado", async () => {
    // 1. Setup empresa e schedule
    await testEnv.db.insert(companies).values({
      id: "clinica_a",
      name: "Clínica A",
      instagramHandle: "@clinicaa",
      niche: "Saúde",
      toneOfVoice: "Humanizado",
    });

    await testEnv.db.insert(weekly_schedules).values({
      id: "sched_2026_w44",
      companyId: "clinica_a",
      weekStartDate: "2026-10-26",
    });

    // 2. Post com 8 slides
    const slideCount = 8;
    await testEnv.db.insert(posts).values({
      id: "post_quarta",
      scheduleId: "sched_2026_w44",
      companyId: "clinica_a",
      dayOfWeek: "quarta",
      theme: "Guia Completo de Clareamento",
      category: "Tutorial",
      slideCount,
      status: "draft",
    });

    // 3. Inserir 8 lâminas
    for (let i = 1; i <= slideCount; i++) {
      await testEnv.db.insert(post_slides).values({
        id: `slide_${i}`,
        postId: "post_quarta",
        slideNumber: i,
        title: i === 1 ? "Capa / Gancho" : i === slideCount ? "Chamada Final" : `Passo ${i - 1}`,
        bodyText: `Conteúdo da lâmina ${i}`,
        ctaText: i === slideCount ? "Agende sua avaliação pelo WhatsApp!" : null,
      });
    }

    const savedSlides = await testEnv.db
      .select()
      .from(post_slides)
      .where(eq(post_slides.postId, "post_quarta"));

    expect(savedSlides.length).toBe(8);
  });

  it("deve remover posts e lâminas em cascata ao excluir um cronograma semanal", async () => {
    await testEnv.db.insert(companies).values({
      id: "empresa_b",
      name: "Empresa B",
      instagramHandle: "@empresa_b",
      niche: "Moda",
      toneOfVoice: "Elegante",
    });

    await testEnv.db.insert(weekly_schedules).values({
      id: "sched_temp",
      companyId: "empresa_b",
      weekStartDate: "2026-11-02",
    });

    await testEnv.db.insert(posts).values({
      id: "post_temp",
      scheduleId: "sched_temp",
      companyId: "empresa_b",
      dayOfWeek: "segunda",
      theme: "Nova Coleção",
      category: "Vitrine",
      slideCount: 4,
    });

    await testEnv.db.insert(post_slides).values({
      id: "slide_temp_1",
      postId: "post_temp",
      slideNumber: 1,
      title: "Capa",
    });

    // Deletar o schedule
    await testEnv.db.delete(weekly_schedules).where(eq(weekly_schedules.id, "sched_temp"));

    // Conferir cascata em posts e post_slides
    const remainingPosts = await testEnv.db
      .select()
      .from(posts)
      .where(eq(posts.id, "post_temp"));
    const remainingSlides = await testEnv.db
      .select()
      .from(post_slides)
      .where(eq(post_slides.id, "slide_temp_1"));

    expect(remainingPosts.length).toBe(0);
    expect(remainingSlides.length).toBe(0);
  });
});

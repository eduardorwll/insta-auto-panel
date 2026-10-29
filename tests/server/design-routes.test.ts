import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { server } from "../../src/server/index";
import { db } from "../../src/server/db/client";
import { companies, weekly_schedules, posts, post_slides } from "../../src/server/db/schema";
import { eq } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";

describe("M6-T2: REST API Studio Visual Sem Canva (/api/design)", () => {
  const baseUrl = `http://localhost:${server.port}`;

  const companyId = "test_studio_co";
  const scheduleId = "test_studio_sched";
  const postId = "test_studio_post";

  beforeAll(async () => {
    // Limpeza prévia para garantir idempotência
    await db.delete(companies).where(eq(companies.id, companyId));
  });

  afterAll(async () => {
    // Teardown completo de banco e disco para tolerância zero a empresas residuais
    await db.delete(companies).where(eq(companies.id, companyId));
    const renderDir = path.resolve(import.meta.dirname, `../../data/renders/${companyId}`);
    await fs.rm(renderDir, { recursive: true, force: true });
    const queueDir = path.resolve(import.meta.dirname, `../../data/autosocial/queue/${companyId}`);
    await fs.rm(queueDir, { recursive: true, force: true });
  });

  test("POST /api/design/generate-background deve gerar background com provedor variável (Pollinations / ComfyUI Local)", async () => {
    const res = await fetch(`${baseUrl}/api/design/generate-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "pollinations",
        prompt: "Clínica odontológica premium com luz natural suave",
        brandPrimaryColor: "#0EA5E9",
        brandSecondaryColor: "#6366F1",
        offlineFallback: true,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      provider: string;
      imageUrl: string;
      costEstimateUsd: number;
    };
    expect(body.provider).toBe("pollinations");
    expect(body.costEstimateUsd).toBe(0);
    expect(body.imageUrl).toContain("data:image/svg+xml;base64,");
  });

  test("POST /api/design/render-post deve renderizar lâminas 4:5 (OpenDesign), salvar PNGs e enfileirar direto no AutoSocial sem Canva", async () => {
    await db.insert(companies).values({
      id: companyId,
      name: "Studio Dental Prime",
      instagramHandle: "@studiodentalprime",
      niche: "Odontologia Estética",
      toneOfVoice: "Sofisticado e acolhedor",
      primaryColor: "#0EA5E9",
      secondaryColor: "#6366F1",
      backgroundColor: "#0F172A",
      accentColor: "#10B981",
    });

    await db.insert(weekly_schedules).values({
      id: scheduleId,
      companyId,
      weekStartDate: "2026-11-02",
    });

    await db.insert(posts).values({
      id: postId,
      scheduleId,
      companyId,
      dayOfWeek: "terca",
      theme: "Lentes de Contato Dental em 3 Passos",
      category: "Educativo",
      slideCount: 3,
      status: "draft",
      caption: "Transforme seu sorriso com segurança! #odontologia",
    });

    for (let i = 1; i <= 3; i++) {
      await db.insert(post_slides).values({
        id: `${postId}_s${i}`,
        postId,
        slideNumber: i,
        title: `Slide ${i}: Planejamento Digital`,
        bodyText: `Detalhamento clínico da etapa ${i} com previsibilidade estética.`,
        ctaText: i === 3 ? "Toque no link da bio e agende" : null,
      });
    }

    const res = await fetch(`${baseUrl}/api/design/render-post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        templateId: "modern-bold",
        enqueueImmediately: true,
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      templateId: string;
      renderedCount: number;
      renderedSlides: Array<{ slideNumber: number; renderedImageUrl: string; svgPreviewUrl: string }>;
      queuedFiles: string[];
    };

    expect(data.success).toBe(true);
    expect(data.templateId).toBe("modern-bold");
    expect(data.renderedCount).toBe(3);
    expect(data.renderedSlides.length).toBe(3);
    expect(data.queuedFiles.length).toBeGreaterThanOrEqual(4); // 1 .description + 3 .png

    // Verificar que o post foi atualizado para status 'queued'
    const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId));
    expect(updatedPost?.status).toBe("queued");

    // Verificar que a rota estática /renders/... serve o PNG renderizado
    const firstSlideUrl = data.renderedSlides[0]?.renderedImageUrl;
    expect(firstSlideUrl).toBeDefined();
    const imgRes = await fetch(`${baseUrl}${firstSlideUrl}`);
    expect(imgRes.status).toBe(200);
    expect(imgRes.headers.get("content-type")).toContain("image/png");
  });
});

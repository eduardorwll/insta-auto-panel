import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { db } from "@/server/db/client";
import {
  companies,
  weekly_schedules,
  posts,
  post_slides,
  photo_assets,
} from "@/server/db/schema";
import { generateCanvaCsv } from "@/server/services/export/canva";
import { eq } from "drizzle-orm";

describe("Motor de Exportação Canva Pro (Bulk Create CSV)", () => {
  const companyId = "empresa_canva_test";
  const schedId = `sched_${companyId}_20261102`;

  beforeAll(async () => {
    // 1. Criar empresa com Brand Kit
    await db.delete(companies).where(eq(companies.id, companyId));
    await db.insert(companies).values({
      id: companyId,
      name: "Odonto White Canva",
      instagramHandle: "@odontowhite",
      niche: "Odontologia Estética",
      toneOfVoice: "Inovador",
      primaryColor: "#4F46E5",
      secondaryColor: "#EC4899",
      backgroundColor: "#0B0F19",
      accentColor: "#10B981",
      canvaTemplateId: "CANVA-PRO-12345",
      whatsappNumber: "5511999998888",
    });

    // 2. Criar cronograma
    await db.delete(weekly_schedules).where(eq(weekly_schedules.id, schedId));
    await db.insert(weekly_schedules).values({
      id: schedId,
      companyId,
      weekStartDate: "2026-11-02",
    });

    // 3. Criar foto de exemplo
    const photoId = `photo_canva_test`;
    await db.delete(photo_assets).where(eq(photo_assets.id, photoId));
    await db.insert(photo_assets).values({
      id: photoId,
      companyId,
      filename: "teste_especialista.jpg",
      originalName: "doutora.jpg",
      filePath: "data/uploads/teste_especialista.jpg",
      category: "Especialista",
    });

    // 4. Criar post com 6 lâminas e aspas/vírgulas no texto para validar escape RFC 4180
    const postId = `post_${schedId}_segunda`;
    await db.delete(posts).where(eq(posts.id, postId));
    await db.insert(posts).values({
      id: postId,
      scheduleId: schedId,
      companyId,
      dayOfWeek: "segunda",
      theme: 'Guia "Rápido" de Clareamento, Passo a Passo',
      category: "Dica Prática",
      slideCount: 6,
      selectedPhotoIds: JSON.stringify([photoId]),
      caption: "Legenda completa com hashtags #odonto",
      status: "ready_for_review",
    });

    for (let i = 1; i <= 6; i++) {
      await db.insert(post_slides).values({
        id: `slide_${postId}_${i}`,
        postId,
        slideNumber: i,
        title: `Lâmina ${i}: Dica de Ouro, "Atenção"`,
        bodyText: `Linha 1 do slide ${i}\nLinha 2 com vírgula, e ponto.`,
        ctaText: i === 6 ? "Agende via WhatsApp!" : null,
        assignedPhotoId: i === 1 ? photoId : null,
      });
    }
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
  });

  it("deve gerar CSV iniciando com UTF-8 BOM (\\uFEFF) para compatibilidade nativa com Excel e Canva", async () => {
    const { csvContent, filename } = await generateCanvaCsv(schedId, companyId);
    expect(csvContent.startsWith("\uFEFF")).toBe(true);
    expect(filename).toContain(`canva_bulk_create_${companyId}_2026-11-02.csv`);
  });

  it("deve conter colunas obrigatórias com os metadados do post, lâminas e Brand Kit", async () => {
    const { csvContent } = await generateCanvaCsv(schedId, companyId);
    const lines = csvContent.replace(/^\uFEFF/, "").split("\r\n");
    const header = lines[0];

    expect(header).toContain("dia");
    expect(header).toContain("tema");
    expect(header).toContain("slide_numero");
    expect(header).toContain("titulo");
    expect(header).toContain("corpo");
    expect(header).toContain("cta");
    expect(header).toContain("imagem_url");
    expect(header).toContain("cor_primaria");
    expect(header).toContain("cor_secundaria");
    expect(header).toContain("cor_fundo");
    expect(header).toContain("cor_destaque");
    expect(header).toContain("canva_template_id");
  });

  it("deve escapar corretamente aspas e quebras de linha conforme RFC 4180", async () => {
    const { csvContent } = await generateCanvaCsv(schedId, companyId);
    // Aspas duplas em volta do texto e escape "" para aspas internas
    expect(csvContent).toContain('""Rápido""');
    expect(csvContent).toContain('""Atenção""');
    expect(csvContent).toContain("#4F46E5");
    expect(csvContent).toContain("CANVA-PRO-12345");
    expect(csvContent).toContain("teste_especialista.jpg");
  });

  it("GET /api/export/canva deve retornar arquivo CSV com Content-Disposition attachment", async () => {
    const { server } = await import("@/server/index");
    const req = new Request(
      `http://localhost:${server.port}/api/export/canva?scheduleId=${schedId}&companyId=${companyId}`
    );
    const res = await server.fetch(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment; filename=");
    const text = await res.text();
    expect(text.startsWith("\uFEFF")).toBe(true);
  });
});

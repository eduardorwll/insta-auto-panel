import { db } from "../../db/client";
import {
  companies,
  weekly_schedules,
  posts,
  post_slides,
  photo_assets,
} from "../../db/schema";
import { eq, asc } from "drizzle-orm";

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function generateCanvaCsv(
  scheduleId: string,
  companyId: string
): Promise<{ filename: string; csvContent: string }> {
  // 1. Buscar empresa
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!company) {
    throw new Error(`Empresa com ID "${companyId}" não encontrada.`);
  }

  // 2. Buscar cronograma
  const [schedule] = await db
    .select()
    .from(weekly_schedules)
    .where(eq(weekly_schedules.id, scheduleId));

  const weekDate = schedule?.weekStartDate || new Date().toISOString().split("T")[0];

  // 3. Buscar fotos da empresa para lookup rápido
  const photos = await db
    .select()
    .from(photo_assets)
    .where(eq(photo_assets.companyId, companyId));
  const photoMap = new Map(photos.map((p) => [p.id, p]));

  // 4. Buscar posts da semana
  const weekPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.scheduleId, scheduleId));

  // 5. Montar cabeçalhos do CSV para Canva Bulk Create
  const headers = [
    "id_post",
    "dia",
    "tema",
    "categoria",
    "slide_numero",
    "total_slides",
    "titulo",
    "corpo",
    "cta",
    "imagem_url",
    "imagem_nome",
    "cor_primaria",
    "cor_secundaria",
    "cor_fundo",
    "cor_destaque",
    "instagram_handle",
    "whatsapp_contato",
    "canva_template_id",
    "legenda_post",
  ];

  const rows: string[][] = [];

  for (const post of weekPosts) {
    const slides = await db
      .select()
      .from(post_slides)
      .where(eq(post_slides.postId, post.id))
      .orderBy(asc(post_slides.slideNumber));

    for (const slide of slides) {
      // Foto vinculada diretamente ao slide ou primeira foto do post
      const photoId = slide.assignedPhotoId || (post.selectedPhotoIds ? JSON.parse(post.selectedPhotoIds)[0] : null);
      const photo = photoId ? photoMap.get(photoId) : null;

      rows.push([
        post.id,
        post.dayOfWeek,
        post.theme || "",
        post.category || "",
        String(slide.slideNumber),
        String(post.slideCount),
        slide.title || "",
        slide.bodyText || "",
        slide.ctaText || "",
        photo ? `/uploads/${photo.filename}` : "",
        photo ? photo.originalName : "",
        company.primaryColor || "#6366F1",
        company.secondaryColor || "#EC4899",
        company.backgroundColor || "#0F172A",
        company.accentColor || "#10B981",
        company.instagramHandle || "",
        company.whatsappNumber || "",
        company.canvaTemplateId || "",
        post.caption || "",
      ]);
    }
  }

  // 6. Formatar linhas com escape RFC 4180
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((r) => r.map(escapeCsvCell).join(","));

  // UTF-8 BOM (\uFEFF) no início para o Excel e Canva Bulk Create lerem sem corromper acentuação
  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const filename = `canva_bulk_create_${company.id}_${weekDate}.csv`;

  return { filename, csvContent };
}

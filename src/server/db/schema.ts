import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

/**
 * Categorias válidas para fotos do banco isolado por empresa
 */
export const PHOTO_CATEGORIES = ["Especialista", "Produto", "Logo", "Fundo"] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];
export const photoCategorySchema = z.enum(PHOTO_CATEGORIES);

/**
 * Tabela de Empresas (Multi-Tenant)
 */
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(), // slug único (ex: 'techcorp', 'clinica_sorriso')
  name: text("name").notNull(),
  instagramHandle: text("instagram_handle").notNull(),
  niche: text("niche").notNull(),
  toneOfVoice: text("tone_of_voice").notNull(),
  primaryColor: text("primary_color").default("#6366F1"),
  secondaryColor: text("secondary_color").default("#EC4899"),
  backgroundColor: text("background_color").default("#0F172A"),
  accentColor: text("accent_color").default("#10B981"),
  whatsappNumber: text("whatsapp_number"),
  whatsappDefaultMessage: text("whatsapp_default_message"),
  websiteUrl: text("website_url"),
  canvaTemplateId: text("canva_template_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

/**
 * Tabela de Banco de Fotos por Empresa
 */
export const photo_assets = sqliteTable("photo_assets", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  category: text("category").notNull(), // 'Especialista', 'Produto', 'Logo', 'Fundo'
  tags: text("tags"), // JSON array serializado de tags
  timesUsed: integer("times_used").default(0),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

/**
 * Relações Drizzle ORM
 */
export const companiesRelations = relations(companies, ({ many }) => ({
  photos: many(photo_assets),
}));

export const photoAssetsRelations = relations(photo_assets, ({ one }) => ({
  company: one(companies, {
    fields: [photo_assets.companyId],
    references: [companies.id],
  }),
}));

/**
 * Schemas de Validação Zod para entrada de dados
 */
export const companyInsertSchema = z.object({
  id: z.string().min(2).regex(/^[a-z0-9_-]+$/, "Slug deve conter apenas letras minúsculas, números, - e _"),
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  instagramHandle: z.string().min(1, "Arroba do Instagram é obrigatória"),
  niche: z.string().min(1, "Nicho de atuação é obrigatório"),
  toneOfVoice: z.string().min(1, "Tom de voz é obrigatório"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366F1"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#EC4899"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#0F172A"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#10B981"),
  whatsappNumber: z.string().optional().nullable(),
  whatsappDefaultMessage: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  canvaTemplateId: z.string().optional().nullable(),
});

export const photoAssetInsertSchema = z.object({
  id: z.string().min(1),
  companyId: z.string().min(1),
  filename: z.string().min(1),
  originalName: z.string().min(1),
  filePath: z.string().min(1),
  category: photoCategorySchema,
  tags: z.array(z.string()).optional(),
  timesUsed: z.number().int().min(0).default(0),
});

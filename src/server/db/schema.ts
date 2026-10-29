import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

/**
 * Categorias válidas para fotos do banco isolado por empresa
 */
export const PHOTO_CATEGORIES = ["Especialista", "Produto", "Logo", "Fundo"] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];
export const photoCategorySchema = z.enum(PHOTO_CATEGORIES);

/**
 * Dias da semana para o cronograma editorial
 */
export const DAYS_OF_WEEK = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export const dayOfWeekSchema = z.enum(DAYS_OF_WEEK);

/**
 * Status do fluxo editorial do post
 */
export const POST_STATUSES = [
  "draft",
  "ai_generated",
  "ready_canva",
  "queued",
  "posted",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export const postStatusSchema = z.enum(POST_STATUSES);

/**
 * Provedores de IA Generativa suportados pela arquitetura agnóstica
 */
export const AI_PROVIDERS = [
  "gemini",
  "openai",
  "claude",
  "groq",
  "deepseek",
  "ollama",
  "openrouter",
] as const;
export type AIProviderName = (typeof AI_PROVIDERS)[number];
export const aiProviderSchema = z.enum(AI_PROVIDERS);

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
 * Tabela de Cronogramas Semanais (Segunda a Domingo)
 */
export const weekly_schedules = sqliteTable("weekly_schedules", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  weekStartDate: text("week_start_date").notNull(), // 'YYYY-MM-DD'
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

/**
 * Tabela de Posts Diários da Semana
 */
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => weekly_schedules.id, { onDelete: "cascade" }),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  dayOfWeek: text("day_of_week").notNull(), // 'segunda'..'domingo'
  theme: text("theme").notNull(),
  category: text("category").notNull(),
  slideCount: integer("slide_count").notNull().default(5), // Variável dinâmica (3 a 10 lâminas)
  status: text("status").default("draft"),
  caption: text("caption"),
  selectedPhotoIds: text("selected_photo_ids"), // JSON array serializado
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

/**
 * Tabela de Lâminas do Carrossel por Post
 */
export const post_slides = sqliteTable("post_slides", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  slideNumber: integer("slide_number").notNull(), // 1 a 10
  title: text("title"),
  bodyText: text("body_text"),
  ctaText: text("cta_text"),
  assignedPhotoId: text("assigned_photo_id").references(() => photo_assets.id, {
    onDelete: "set null",
  }),
});

/**
 * Tabela de Configurações de IA (Multi-Provedor)
 * Permite escopo global ('global') ou sobrescrita específica por empresa ('company_id')
 */
export const ai_provider_settings = sqliteTable("ai_provider_settings", {
  id: text("id").primaryKey(), // 'global' ou company_id
  provider: text("provider").notNull(), // 'gemini', 'openai', 'claude', etc.
  apiKey: text("api_key"),
  modelName: text("model_name").notNull(),
  baseUrl: text("base_url"),
  temperature: real("temperature").default(0.7),
  isActive: integer("is_active").default(1),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

/**
 * Relações Drizzle ORM
 */
export const companiesRelations = relations(companies, ({ many }) => ({
  photos: many(photo_assets),
  schedules: many(weekly_schedules),
  posts: many(posts),
}));

export const photoAssetsRelations = relations(photo_assets, ({ one }) => ({
  company: one(companies, {
    fields: [photo_assets.companyId],
    references: [companies.id],
  }),
}));

export const weeklySchedulesRelations = relations(weekly_schedules, ({ one, many }) => ({
  company: one(companies, {
    fields: [weekly_schedules.companyId],
    references: [companies.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  schedule: one(weekly_schedules, {
    fields: [posts.scheduleId],
    references: [weekly_schedules.id],
  }),
  company: one(companies, {
    fields: [posts.companyId],
    references: [companies.id],
  }),
  slides: many(post_slides),
}));

export const postSlidesRelations = relations(post_slides, ({ one }) => ({
  post: one(posts, {
    fields: [post_slides.postId],
    references: [posts.id],
  }),
  assignedPhoto: one(photo_assets, {
    fields: [post_slides.assignedPhotoId],
    references: [photo_assets.id],
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

export const weeklyScheduleInsertSchema = z.object({
  id: z.string().min(1),
  companyId: z.string().min(1),
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD"),
});

export const postInsertSchema = z.object({
  id: z.string().min(1),
  scheduleId: z.string().min(1),
  companyId: z.string().min(1),
  dayOfWeek: dayOfWeekSchema,
  theme: z.string().min(1, "Tema do post é obrigatório"),
  category: z.string().min(1, "Categoria editorial é obrigatória"),
  slideCount: z.number().int().min(3, "Mínimo de 3 lâminas").max(10, "Máximo de 10 lâminas").default(5),
  status: postStatusSchema.default("draft"),
  caption: z.string().optional().nullable(),
  selectedPhotoIds: z.array(z.string()).optional().nullable(),
});

export const postSlideInsertSchema = z.object({
  id: z.string().min(1),
  postId: z.string().min(1),
  slideNumber: z.number().int().min(1).max(10),
  title: z.string().optional().nullable(),
  bodyText: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  assignedPhotoId: z.string().optional().nullable(),
});

export const aiProviderSettingsInsertSchema = z.object({
  id: z.string().min(1),
  provider: aiProviderSchema,
  apiKey: z.string().optional().nullable(),
  modelName: z.string().min(1, "Nome do modelo é obrigatório"),
  baseUrl: z.string().url().optional().nullable().or(z.literal("")),
  temperature: z.number().min(0.0).max(1.0).default(0.7),
  isActive: z.number().int().min(0).max(1).default(1),
});

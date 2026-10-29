import { db, sqlite } from "./client";
import { companies, ai_provider_settings } from "./schema";
import { eq } from "drizzle-orm";

export async function runSeed(dbInstance = db) {
  // 1. Configuração global padrão de IA (Google Gemini 2.5 Flash)
  const existingAi = await dbInstance
    .select()
    .from(ai_provider_settings)
    .where(eq(ai_provider_settings.id, "global"));

  if (existingAi.length === 0) {
    await dbInstance.insert(ai_provider_settings).values({
      id: "global",
      provider: "gemini",
      apiKey: process.env.GEMINI_API_KEY || null,
      modelName: "gemini-2.5-flash",
      temperature: 0.7,
      isActive: 1,
    });
  }

  // 2. Empresa demo inicial com Brand Kit completo
  const existingCompany = await dbInstance
    .select()
    .from(companies)
    .where(eq(companies.id, "demo_corp"));

  if (existingCompany.length === 0) {
    await dbInstance.insert(companies).values({
      id: "demo_corp",
      name: "Demo Corp",
      instagramHandle: "@democorp",
      niche: "Inovação e Tecnologia",
      toneOfVoice: "Inovador, Direto e Técnico",
      primaryColor: "#6366F1",
      secondaryColor: "#EC4899",
      backgroundColor: "#0F172A",
      accentColor: "#10B981",
      whatsappNumber: "5511999999999",
      whatsappDefaultMessage: "Olá! Gostaria de saber mais sobre as soluções da Demo Corp.",
      websiteUrl: "https://democorp.example.com",
    });
  }
}

if (import.meta.main) {
  try {
    console.log("Executando seed de inicialização...");
    await runSeed();
    console.log("Seed concluído com sucesso!");
    sqlite.close();
    process.exit(0);
  } catch (err) {
    console.error("Falha no seed:", err);
    process.exit(1);
  }
}

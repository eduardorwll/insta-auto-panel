import type { AISettings, AIProvider } from "./provider";
import { GeminiProvider } from "./gemini";
import { MLStudioProvider } from "./mlstudio";
import { OpenAIProvider } from "./openai";
import { db } from "@/server/db/client";
import { ai_provider_settings } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export class AIProviderFactory {
  static create(settings: AISettings): AIProvider {
    switch (settings.provider) {
      case "gemini":
        return new GeminiProvider(settings);

      case "mlstudio":
      case "lmstudio":
        return new MLStudioProvider(settings);

      case "ollama":
        // Ollama oferece suporte nativo ao formato OpenAI em /v1
        return new MLStudioProvider({
          ...settings,
          baseUrl: settings.baseUrl || "http://localhost:11434/v1",
        });

      case "openai":
      case "groq":
      case "deepseek":
      case "openrouter":
        return new OpenAIProvider(settings);

      default:
        return new GeminiProvider(settings);
    }
  }

  /**
   * Obtém o provedor configurado para uma empresa específica ou fallback para a configuração global
   */
  static async getForCompany(companyId?: string): Promise<AIProvider> {
    if (companyId) {
      const [companySetting] = await db
        .select()
        .from(ai_provider_settings)
        .where(eq(ai_provider_settings.id, companyId));

      if (companySetting && companySetting.isActive) {
        return this.create(companySetting as AISettings);
      }
    }

    // Fallback: Configuração Global
    const [globalSetting] = await db
      .select()
      .from(ai_provider_settings)
      .where(eq(ai_provider_settings.id, "global"));

    if (globalSetting) {
      return this.create(globalSetting as AISettings);
    }

    // Fallback padrão se banco estiver vazio
    return this.create({
      id: "global",
      provider: "gemini",
      modelName: "gemini-2.5-flash",
      temperature: 0.7,
      isActive: 1,
    });
  }
}

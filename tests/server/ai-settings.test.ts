import { describe, expect, it, beforeEach } from "bun:test";
import { createTestDb } from "@/server/db/client";
import {
  ai_provider_settings,
  aiProviderSettingsInsertSchema,
  AI_PROVIDERS,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("Schema e Integridade: Configurações de IA Multi-Provedor", () => {
  let testEnv: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testEnv = createTestDb();
    testEnv.sqlite.run(`
      CREATE TABLE ai_provider_settings (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        api_key TEXT,
        model_name TEXT NOT NULL,
        base_url TEXT,
        temperature REAL DEFAULT 0.7,
        is_active INTEGER DEFAULT 1,
        updated_at INTEGER
      );
    `);
  });

  it("deve validar o schema Zod para provedores suportados e temperatura entre 0 e 1", () => {
    // Provedor válido
    const validConfig = {
      id: "global",
      provider: "gemini" as const,
      apiKey: "AIzaSyFakeKey123",
      modelName: "gemini-2.5-flash",
      temperature: 0.7,
      isActive: 1,
    };
    expect(aiProviderSettingsInsertSchema.safeParse(validConfig).success).toBe(true);

    // Provedor inválido
    const invalidProvider = { ...validConfig, provider: "provedor_desconhecido" };
    expect(aiProviderSettingsInsertSchema.safeParse(invalidProvider).success).toBe(false);

    // Temperatura fora do limite (> 1 ou < 0)
    const invalidTempHigh = { ...validConfig, temperature: 1.5 };
    expect(aiProviderSettingsInsertSchema.safeParse(invalidTempHigh).success).toBe(false);

    const invalidTempLow = { ...validConfig, temperature: -0.1 };
    expect(aiProviderSettingsInsertSchema.safeParse(invalidTempLow).success).toBe(false);
  });

  it("deve persistir configuração global e sobrescrita específica por empresa", async () => {
    // 1. Configuração Global (Google Gemini padrão)
    await testEnv.db.insert(ai_provider_settings).values({
      id: "global",
      provider: "gemini",
      apiKey: "global-gemini-key",
      modelName: "gemini-2.5-flash",
      temperature: 0.7,
      isActive: 1,
    });

    // 2. Sobrescrita específica para a empresa TechCorp (Claude 3.5 Sonnet)
    await testEnv.db.insert(ai_provider_settings).values({
      id: "techcorp",
      provider: "claude",
      apiKey: "techcorp-claude-key",
      modelName: "claude-3-5-sonnet",
      temperature: 0.5,
      isActive: 1,
    });

    // 3. Sobrescrita local para Ollama offline
    await testEnv.db.insert(ai_provider_settings).values({
      id: "clinica_offline",
      provider: "ollama",
      modelName: "llama3.3:70b",
      baseUrl: "http://localhost:11434/v1",
      temperature: 0.2,
      isActive: 1,
    });

    const [globalSetting] = await testEnv.db
      .select()
      .from(ai_provider_settings)
      .where(eq(ai_provider_settings.id, "global"));
    const [companySetting] = await testEnv.db
      .select()
      .from(ai_provider_settings)
      .where(eq(ai_provider_settings.id, "techcorp"));
    const [ollamaSetting] = await testEnv.db
      .select()
      .from(ai_provider_settings)
      .where(eq(ai_provider_settings.id, "clinica_offline"));

    expect(globalSetting?.provider).toBe("gemini");
    expect(companySetting?.provider).toBe("claude");
    expect(ollamaSetting?.baseUrl).toBe("http://localhost:11434/v1");
  });
});

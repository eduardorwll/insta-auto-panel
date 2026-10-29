export type AIProvider =
  | "mlstudio"
  | "lmstudio"
  | "gemini"
  | "openai"
  | "claude"
  | "groq"
  | "ollama"
  | "openrouter";

export interface AISettingsFormData {
  id: string; // 'global' ou companyId
  provider: AIProvider;
  apiKey?: string | null;
  modelName: string;
  baseUrl?: string | null;
  temperature: number;
  isActive: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  provider?: string;
  modelName?: string;
}

import { OpenRouter } from "@openrouter/sdk";

export interface OpenRouterTextModelItem {
  id: string;
  name: string;
  contextLength: number;
  promptPricePerMillion: number;
  completionPricePerMillion: number;
  supportsVision: boolean;
  recommendedRole: string;
}

export interface OpenRouterImageModelItem {
  id: string;
  name: string;
  pricePerImageUsd: number;
  supportsReferenceImage: boolean;
  recommendedRole: string;
}

export interface OpenRouterCatalogResult {
  source: "live" | "curated_cache";
  updatedAt: string;
  textModels: OpenRouterTextModelItem[];
  imageModels: OpenRouterImageModelItem[];
}

export interface OpenRouterKeyStatus {
  configured: boolean;
  valid: boolean;
  label?: string;
  usageUsd: number;
  limitUsd: number | null;
  remainingUsd: number | null;
  isFreeTier: boolean;
}

export const CURATED_OPENROUTER_TEXT_MODELS: OpenRouterTextModelItem[] = [
  {
    id: "google/gemini-3-flash-preview",
    name: "Google: Gemini 3 Flash Preview",
    contextLength: 1048576,
    promptPricePerMillion: 0.5,
    completionPricePerMillion: 3.0,
    supportsVision: true,
    recommendedRole: "Melhor Custo-Benefício para Extração de Style Blueprint (Visão) + Copy MATCH",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Google: Gemini 2.5 Flash",
    contextLength: 1048576,
    promptPricePerMillion: 0.3,
    completionPricePerMillion: 2.5,
    supportsVision: true,
    recommendedRole: "Padrão de Produção para Roteiros Semanais e Visão Multimodal",
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Google: Gemini 2.5 Flash Lite",
    contextLength: 1048576,
    promptPricePerMillion: 0.1,
    completionPricePerMillion: 0.4,
    supportsVision: true,
    recommendedRole: "Ultra-Econômico para Alto Volume de Roteiros e Legendas SEO",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "OpenAI: GPT-4o Mini",
    contextLength: 128000,
    promptPricePerMillion: 0.15,
    completionPricePerMillion: 0.6,
    supportsVision: true,
    recommendedRole: "Excelente Aderência a JSON Schema Estrito e Visão",
  },
  {
    id: "deepseek/deepseek-chat-v3-0324",
    name: "DeepSeek: V3 0324",
    contextLength: 163840,
    promptPricePerMillion: 0.2,
    completionPricePerMillion: 0.77,
    supportsVision: false,
    recommendedRole: "Copywriting Criativo em Português (Apenas Texto)",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Anthropic: Claude Sonnet 4",
    contextLength: 200000,
    promptPricePerMillion: 3.0,
    completionPricePerMillion: 15.0,
    supportsVision: true,
    recommendedRole: "Premium Editorial & Direção de Arte Complexa",
  },
];

export const CURATED_OPENROUTER_IMAGE_MODELS: OpenRouterImageModelItem[] = [
  {
    id: "black-forest-labs/flux.2-klein-4b",
    name: "Black Forest Labs: FLUX.2 Klein 4B",
    pricePerImageUsd: 0.014,
    supportsReferenceImage: false,
    recommendedRole: "Mais Econômico e Rápido para Fundos Editoriais 4:5 e 9:16",
  },
  {
    id: "sourceful/riverflow-v2-fast",
    name: "Sourceful: Riverflow V2 Fast",
    pricePerImageUsd: 0.02,
    supportsReferenceImage: true,
    recommendedRole: "Alta Velocidade com Suporte a Referência Visual",
  },
  {
    id: "bytedance-seed/seedream-4.5",
    name: "ByteDance: Seedream 4.5",
    pricePerImageUsd: 0.04,
    supportsReferenceImage: true,
    recommendedRole: "Fotorrealismo Editorial e Texturas Orgânicas de Estúdio",
  },
  {
    id: "black-forest-labs/flux.2-pro",
    name: "Black Forest Labs: FLUX.2 Pro",
    pricePerImageUsd: 0.03,
    supportsReferenceImage: true,
    recommendedRole: "Consistência Visual Multi-Lâmina com Imagem de Referência",
  },
  {
    id: "google/gemini-2.5-flash-image",
    name: "Google: Gemini 2.5 Flash Image (Nano Banana)",
    pricePerImageUsd: 0.038,
    supportsReferenceImage: true,
    recommendedRole: "Edição Contextual e Fusão de Fotos da Marca via Chat Multimodal",
  },
  {
    id: "google/gemini-3.1-flash-image-preview",
    name: "Google: Gemini 3.1 Flash Image Preview (Nano Banana 2)",
    pricePerImageUsd: 0.045,
    supportsReferenceImage: true,
    recommendedRole: "Nova Geração Multimodal com Controle de Proporção 4:5 e 9:16",
  },
];

let cachedCatalog: { data: OpenRouterCatalogResult; expiresAt: number } | null = null;

/**
 * Instancia o cliente oficial @openrouter/sdk com headers de atribuição da aplicação.
 */
export function createOpenRouterSdkClient(apiKey: string): OpenRouter {
  return new OpenRouter({
    apiKey,
    httpReferer: "http://localhost:3000",
  });
}

/**
 * Retorna o catálogo de modelos de texto/visão e imagem da OpenRouter,
 * combinando dados curados de alta precisão com cache em memória.
 */
export async function fetchOpenRouterCatalog(options?: {
  forceRefresh?: boolean;
  liveFetch?: boolean;
}): Promise<OpenRouterCatalogResult> {
  const now = Date.now();
  if (!options?.forceRefresh && cachedCatalog && cachedCatalog.expiresAt > now) {
    return cachedCatalog.data;
  }

  if (options?.liveFetch) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        signal: AbortSignal.timeout(4500),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          data?: Array<{
            id: string;
            name: string;
            context_length?: number;
            pricing?: { prompt?: string; completion?: string; image?: string };
            architecture?: { input_modalities?: string[]; output_modalities?: string[] };
          }>;
        };
        if (Array.isArray(json.data) && json.data.length > 0) {
          const curatedIds = new Set(CURATED_OPENROUTER_TEXT_MODELS.map((m) => m.id));
          const liveText = CURATED_OPENROUTER_TEXT_MODELS.map((curated) => {
            const match = json.data?.find((m) => m.id === curated.id);
            if (!match) return curated;
            const promptPerToken = Number.parseFloat(match.pricing?.prompt || "0");
            const compPerToken = Number.parseFloat(match.pricing?.completion || "0");
            return {
              ...curated,
              name: match.name || curated.name,
              contextLength: match.context_length || curated.contextLength,
              promptPricePerMillion:
                promptPerToken > 0
                  ? Number((promptPerToken * 1_000_000).toFixed(4))
                  : curated.promptPricePerMillion,
              completionPricePerMillion:
                compPerToken > 0
                  ? Number((compPerToken * 1_000_000).toFixed(4))
                  : curated.completionPricePerMillion,
            };
          });
          const result: OpenRouterCatalogResult = {
            source: "live",
            updatedAt: new Date().toISOString(),
            textModels: liveText.length > 0 ? liveText : CURATED_OPENROUTER_TEXT_MODELS,
            imageModels: CURATED_OPENROUTER_IMAGE_MODELS,
          };
          void curatedIds;
          cachedCatalog = { data: result, expiresAt: now + 3600_000 };
          return result;
        }
      }
    } catch {
      // Fallback imediato para o catálogo curado local
    }
  }

  const fallback: OpenRouterCatalogResult = {
    source: "curated_cache",
    updatedAt: new Date().toISOString(),
    textModels: CURATED_OPENROUTER_TEXT_MODELS,
    imageModels: CURATED_OPENROUTER_IMAGE_MODELS,
  };
  cachedCatalog = { data: fallback, expiresAt: now + 3600_000 };
  return fallback;
}

/**
 * Consulta o status e limites reais de uma API Key na OpenRouter via GET /api/v1/key.
 */
export async function fetchOpenRouterKeyStatus(
  apiKey: string | null | undefined
): Promise<OpenRouterKeyStatus> {
  if (!apiKey || apiKey.trim().length < 8) {
    return {
      configured: false,
      valid: false,
      usageUsd: 0,
      limitUsd: null,
      remainingUsd: null,
      isFreeTier: true,
    };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return {
        configured: true,
        valid: false,
        usageUsd: 0,
        limitUsd: null,
        remainingUsd: null,
        isFreeTier: false,
      };
    }

    const body = (await res.json()) as {
      data?: {
        label?: string;
        usage?: number;
        limit?: number | null;
        limit_remaining?: number | null;
        is_free_tier?: boolean;
      };
    };
    const d = body.data;
    return {
      configured: true,
      valid: true,
      label: d?.label,
      usageUsd: Number((d?.usage ?? 0).toFixed(4)),
      limitUsd: d?.limit ?? null,
      remainingUsd: d?.limit_remaining ?? null,
      isFreeTier: Boolean(d?.is_free_tier),
    };
  } catch {
    return {
      configured: true,
      valid: false,
      usageUsd: 0,
      limitUsd: null,
      remainingUsd: null,
      isFreeTier: false,
    };
  }
}

import {
  BaseAIProvider,
  carouselResponseSchema,
  type CarouselSlidesResponse,
  type GeneratePostParams,
} from "./provider";

interface AnthropicMessagesResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
}

/**
 * Provedor de IA para Anthropic Claude (Messages API /v1/messages)
 */
export class ClaudeProvider extends BaseAIProvider {
  private getBaseUrl(): string {
    const raw = this.settings.baseUrl?.trim() || "https://api.anthropic.com/v1";
    return raw.replace(/\/+$/, "");
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.settings.apiKey) {
      return {
        success: false,
        message: "API Key da Anthropic Claude não informada.",
      };
    }

    try {
      const res = await fetch(`${this.getBaseUrl()}/models`, {
        method: "GET",
        headers: {
          "x-api-key": this.settings.apiKey,
          "anthropic-version": "2023-06-01",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return {
          success: false,
          message: `Anthropic API retornou status HTTP ${res.status}`,
        };
      }

      return {
        success: true,
        message: `Conexão estabelecida com Anthropic Claude (${this.settings.modelName})`,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Erro ao conectar na Anthropic API: ${msg}`,
      };
    }
  }

  async generate(params: GeneratePostParams): Promise<CarouselSlidesResponse> {
    if (!this.settings.apiKey) {
      throw new Error("API Key da Anthropic Claude não configurada.");
    }

    const prompt = this.buildPrompt(params);
    const endpoint = `${this.getBaseUrl()}/messages`;

    const payload = {
      model: this.settings.modelName || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: this.settings.temperature ?? 0.7,
      system:
        "Você é um copywriter de carrosséis no Instagram que responde estritamente em formato JSON válido, sem blocos markdown.",
      messages: [{ role: "user", content: prompt }],
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.settings.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro na API do Claude (${res.status}): ${errorText.substring(0, 150)}`);
    }

    const json = (await res.json()) as AnthropicMessagesResponse;
    const rawContent = json.content?.[0]?.text || "{}";
    const cleanJson = rawContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsedObj: unknown = JSON.parse(cleanJson);

    const validated = carouselResponseSchema.parse(parsedObj);
    validated.caption = this.formatCaptionWithConversion(validated.caption, params.company);

    return validated;
  }
}

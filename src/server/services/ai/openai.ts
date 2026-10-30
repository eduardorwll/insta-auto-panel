import {
  BaseAIProvider,
  type GeneratePostParams,
  type CarouselSlidesResponse,
} from "./provider";

export class OpenAIProvider extends BaseAIProvider {
  private getEndpoint(): string {
    if (this.settings.baseUrl) {
      const raw = this.settings.baseUrl.trim();
      return raw.endsWith("/") ? `${raw}chat/completions` : `${raw}/chat/completions`;
    }
    // Endpoints padrão conforme o provedor
    if (this.settings.provider === "groq") {
      return "https://api.groq.com/openai/v1/chat/completions";
    }
    if (this.settings.provider === "deepseek") {
      return "https://api.deepseek.com/chat/completions";
    }
    if (this.settings.provider === "openrouter") {
      return "https://openrouter.ai/api/v1/chat/completions";
    }
    return "https://api.openai.com/v1/chat/completions";
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = this.getEndpoint();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.settings.apiKey || ""}`,
        },
        body: JSON.stringify({
          model: this.settings.modelName,
          messages: [{ role: "user", content: "Ping: responda OK" }],
          max_tokens: 10,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          message: `Falha na conexão (${res.status}): ${errorText.substring(0, 100)}`,
        };
      }

      return { success: true, message: `Conexão com ${this.settings.provider} realizada com sucesso!` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return { success: false, message: `Erro ao conectar: ${msg}` };
    }
  }

  async generate(params: GeneratePostParams): Promise<CarouselSlidesResponse> {
    const prompt = this.buildPrompt(params);
    const endpoint = this.getEndpoint();

    const payload = {
      model: this.settings.modelName,
      temperature: this.settings.temperature ?? 0.7,
      messages: [
        {
          role: "system",
          content: "Você é um copywriter de carrosséis no Instagram que responde estritamente em formato JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.settings.apiKey || ""}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro na API (${res.status}): ${errorText.substring(0, 150)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content || "{}";
    return this.parseCarouselResponse(content, params.company);
  }
}

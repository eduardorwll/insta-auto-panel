import {
  BaseAIProvider,
  type GeneratePostParams,
  type CarouselSlidesResponse,
  carouselResponseSchema,
} from "./provider";

/**
 * Adaptador para ML Studio API & LM Studio Local
 * Compatível com o padrão OpenAI /v1/chat/completions
 */
export class MLStudioProvider extends BaseAIProvider {
  private getEndpoint(): string {
    const raw = this.settings.baseUrl?.trim() || "http://localhost:1234/v1";
    return raw.endsWith("/") ? `${raw}chat/completions` : `${raw}/chat/completions`;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = this.getEndpoint();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (this.settings.apiKey) {
        headers["Authorization"] = `Bearer ${this.settings.apiKey}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
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
          message: `Falha na conexão com ML Studio (HTTP ${res.status}): ${errorText.substring(0, 100)}`,
        };
      }

      return { success: true, message: "Conexão com ML Studio API estabelecida com sucesso!" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return { success: false, message: `Não foi possível conectar ao ML Studio: ${msg}` };
    }
  }

  async generate(params: GeneratePostParams): Promise<CarouselSlidesResponse> {
    const prompt = this.buildPrompt(params);
    const endpoint = this.getEndpoint();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.settings.apiKey) {
      headers["Authorization"] = `Bearer ${this.settings.apiKey}`;
    }

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
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro na API do ML Studio (HTTP ${res.status}): ${errorText.substring(0, 150)}`);
    }

    const json = (await res.json()) as any;
    const content = json.choices?.[0]?.message?.content || "";

    // Parse e sanitização do JSON retornado
    const cleanJson = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsedObj = JSON.parse(cleanJson);

    const validated = carouselResponseSchema.parse(parsedObj);
    validated.caption = this.formatCaptionWithConversion(validated.caption, params.company);

    return validated;
  }
}

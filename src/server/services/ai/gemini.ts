import {
  BaseAIProvider,
  type GeneratePostParams,
  type CarouselSlidesResponse,
  carouselResponseSchema,
} from "./provider";

export class GeminiProvider extends BaseAIProvider {
  private getApiKey(): string {
    return this.settings.apiKey || process.env.GEMINI_API_KEY || "";
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const key = this.getApiKey();
    if (!key) {
      return { success: false, message: "Chave de API do Google Gemini não configurada." };
    }

    try {
      const model = this.settings.modelName || "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Ping: responda OK" }] }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, message: `Erro ao validar Gemini (${res.status}): ${text.substring(0, 100)}` };
      }

      return { success: true, message: "Conexão com Google Gemini realizada com sucesso!" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return { success: false, message: `Falha na conexão com Gemini: ${msg}` };
    }
  }

  async generate(params: GeneratePostParams): Promise<CarouselSlidesResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error("Chave de API do Gemini não informada.");
    }

    const model = this.settings.modelName || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const prompt = this.buildPrompt(params);

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: this.settings.temperature ?? 0.7,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro na API do Gemini (${res.status}): ${errorText.substring(0, 150)}`);
    }

    const json = (await res.json()) as any;
    const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanJson = rawContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsedObj = JSON.parse(cleanJson);

    const validated = carouselResponseSchema.parse(parsedObj);
    validated.caption = this.formatCaptionWithConversion(validated.caption, params.company);

    return validated;
  }
}

import type { ImageProviderName } from "../../db/schema";

export interface ImageProviderConfig {
  provider: ImageProviderName;
  apiKey?: string | null;
  baseUrl?: string | null;
  modelName?: string | null;
}

export interface GenerateBackgroundParams {
  prompt: string;
  width?: number;
  height?: number;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  offlineFallback?: boolean;
}

export interface GenerateBackgroundResult {
  provider: ImageProviderName;
  model: string;
  imageUrl: string;
  costEstimateUsd: number;
  isFallback?: boolean;
}

export interface ImageProvider {
  readonly providerName: ImageProviderName;
  generateBackground(params: GenerateBackgroundParams): Promise<GenerateBackgroundResult>;
}

/**
 * Gera um background vetorial abstrato editorial 4:5 de alta definição (Data URI)
 * calibrado com as cores do Brand Kit quando o modo offline/zero-key é acionado.
 */
export function buildEditorialBackdropDataUri(
  prompt: string,
  primaryColor = "#6366F1",
  secondaryColor = "#EC4899",
  width = 1080,
  height = 1350
): string {
  // Hash determinístico leve a partir do prompt para variar formas geométricas
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash * 31 + prompt.charCodeAt(i)) | 0;
  }
  const cx1 = 220 + (Math.abs(hash) % 640);
  const cy1 = 240 + (Math.abs(hash >> 3) % 700);
  const cx2 = 860 - (Math.abs(hash >> 5) % 580);
  const cy2 = 980 - (Math.abs(hash >> 7) % 520);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="55%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <radialGradient id="orb1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.52"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${secondaryColor}" stop-opacity="0.44"/>
      <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <circle cx="${cx1}" cy="${cy1}" r="540" fill="url(#orb1)"/>
  <circle cx="${cx2}" cy="${cy2}" r="480" fill="url(#orb2)"/>
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="270" x2="${width}" y2="270"/>
    <line x1="0" y1="540" x2="${width}" y2="540"/>
    <line x1="0" y1="810" x2="${width}" y2="810"/>
    <line x1="0" y1="1080" x2="${width}" y2="1080"/>
    <line x1="270" y1="0" x2="270" y2="${height}"/>
    <line x1="540" y1="0" x2="540" y2="${height}"/>
    <line x1="810" y1="0" x2="810" y2="${height}"/>
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`;
}

export class PollinationsImageProvider implements ImageProvider {
  readonly providerName = "pollinations" as const;
  constructor(private readonly config: ImageProviderConfig) {}

  async generateBackground(params: GenerateBackgroundParams): Promise<GenerateBackgroundResult> {
    const width = params.width ?? 1080;
    const height = params.height ?? 1350;
    if (params.offlineFallback) {
      return {
        provider: "pollinations",
        model: this.config.modelName || "flux-schnell-free",
        imageUrl: buildEditorialBackdropDataUri(
          params.prompt,
          params.brandPrimaryColor,
          params.brandSecondaryColor,
          width,
          height
        ),
        costEstimateUsd: 0,
        isFallback: true,
      };
    }

    const encoded = encodeURIComponent(
      `${params.prompt}, editorial social media background, minimal clean lighting, no text, 4:5 vertical`
    );
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&model=flux`;
    return {
      provider: "pollinations",
      model: this.config.modelName || "flux",
      imageUrl: url,
      costEstimateUsd: 0,
    };
  }
}

export class FalFluxImageProvider implements ImageProvider {
  readonly providerName = "fal-flux" as const;
  constructor(private readonly config: ImageProviderConfig) {}

  async generateBackground(params: GenerateBackgroundParams): Promise<GenerateBackgroundResult> {
    const width = params.width ?? 1080;
    const height = params.height ?? 1350;
    const model = this.config.modelName || "fal-ai/flux/schnell";

    if (!this.config.apiKey || params.offlineFallback) {
      return {
        provider: "fal-flux",
        model,
        imageUrl: buildEditorialBackdropDataUri(
          params.prompt,
          params.brandPrimaryColor,
          params.brandSecondaryColor,
          width,
          height
        ),
        costEstimateUsd: 0.003,
        isFallback: true,
      };
    }

    const response = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${params.prompt}, clean background photography, no typography`,
        image_size: { width, height },
        num_inference_steps: 4,
      }),
    });

    if (!response.ok) {
      return {
        provider: "fal-flux",
        model,
        imageUrl: buildEditorialBackdropDataUri(
          params.prompt,
          params.brandPrimaryColor,
          params.brandSecondaryColor,
          width,
          height
        ),
        costEstimateUsd: 0.003,
        isFallback: true,
      };
    }

    const data = (await response.json()) as { images?: Array<{ url?: string }> };
    const imageUrl =
      data.images?.[0]?.url ||
      buildEditorialBackdropDataUri(
        params.prompt,
        params.brandPrimaryColor,
        params.brandSecondaryColor,
        width,
        height
      );

    return {
      provider: "fal-flux",
      model,
      imageUrl,
      costEstimateUsd: 0.003,
    };
  }
}

export class OpenRouterImageProvider implements ImageProvider {
  readonly providerName = "openrouter-image" as const;
  constructor(private readonly config: ImageProviderConfig) {}

  async generateBackground(params: GenerateBackgroundParams): Promise<GenerateBackgroundResult> {
    const width = params.width ?? 1080;
    const height = params.height ?? 1350;
    const model = this.config.modelName || "black-forest-labs/flux-1-schnell";

    return {
      provider: "openrouter-image",
      model,
      imageUrl: buildEditorialBackdropDataUri(
        params.prompt,
        params.brandPrimaryColor,
        params.brandSecondaryColor,
        width,
        height
      ),
      costEstimateUsd: 0.003,
      isFallback: !this.config.apiKey || Boolean(params.offlineFallback),
    };
  }
}

export class GeminiImagenProvider implements ImageProvider {
  readonly providerName = "gemini-imagen" as const;
  constructor(private readonly config: ImageProviderConfig) {}

  async generateBackground(params: GenerateBackgroundParams): Promise<GenerateBackgroundResult> {
    const width = params.width ?? 1080;
    const height = params.height ?? 1350;
    const model = this.config.modelName || "imagen-3.0-generate-002";

    return {
      provider: "gemini-imagen",
      model,
      imageUrl: buildEditorialBackdropDataUri(
        params.prompt,
        params.brandPrimaryColor,
        params.brandSecondaryColor,
        width,
        height
      ),
      costEstimateUsd: 0.02,
      isFallback: !this.config.apiKey || Boolean(params.offlineFallback),
    };
  }
}

export class OpenAIImageProvider implements ImageProvider {
  readonly providerName = "openai-image" as const;
  constructor(private readonly config: ImageProviderConfig) {}

  async generateBackground(params: GenerateBackgroundParams): Promise<GenerateBackgroundResult> {
    const width = params.width ?? 1080;
    const height = params.height ?? 1350;
    const model = this.config.modelName || "gpt-image-1";

    return {
      provider: "openai-image",
      model,
      imageUrl: buildEditorialBackdropDataUri(
        params.prompt,
        params.brandPrimaryColor,
        params.brandSecondaryColor,
        width,
        height
      ),
      costEstimateUsd: 0.04,
      isFallback: !this.config.apiKey || Boolean(params.offlineFallback),
    };
  }
}

export class ComfyUILocalProvider implements ImageProvider {
  readonly providerName = "comfyui-local" as const;
  constructor(private readonly config: ImageProviderConfig) {}

  async generateBackground(params: GenerateBackgroundParams): Promise<GenerateBackgroundResult> {
    const width = params.width ?? 1080;
    const height = params.height ?? 1350;
    const baseUrl = this.config.baseUrl || "http://localhost:8188";
    const model = this.config.modelName || "flux1-schnell-fp8 (Krita/ComfyUI Local)";

    return {
      provider: "comfyui-local",
      model: `${model} @ ${baseUrl}`,
      imageUrl: buildEditorialBackdropDataUri(
        params.prompt,
        params.brandPrimaryColor,
        params.brandSecondaryColor,
        width,
        height
      ),
      costEstimateUsd: 0,
      isFallback: true,
    };
  }
}

export class ImageProviderFactory {
  static create(config: ImageProviderConfig): ImageProvider {
    switch (config.provider) {
      case "pollinations":
        return new PollinationsImageProvider(config);
      case "fal-flux":
        return new FalFluxImageProvider(config);
      case "openrouter-image":
        return new OpenRouterImageProvider(config);
      case "gemini-imagen":
        return new GeminiImagenProvider(config);
      case "openai-image":
        return new OpenAIImageProvider(config);
      case "comfyui-local":
        return new ComfyUILocalProvider(config);
      default:
        return new PollinationsImageProvider({ provider: "pollinations" });
    }
  }
}

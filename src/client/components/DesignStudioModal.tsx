import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Layers,
  Wand2,
  Send,
  CheckCircle,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Sliders,
} from "lucide-react";
import type { Company } from "../types/company";

export type StudioTemplateId =
  | "modern-bold"
  | "editorial-clean"
  | "dark-neon"
  | "split-photo";

export type StudioImageProvider =
  | "pollinations"
  | "fal-flux"
  | "openrouter-image"
  | "gemini-imagen"
  | "openai-image"
  | "comfyui-local";

export interface StudioSlideItem {
  id?: string;
  slideNumber: number;
  title?: string | null;
  bodyText?: string | null;
  ctaText?: string | null;
}

interface DesignStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTheme: string;
  slides: StudioSlideItem[];
  company: Company;
  onRenderedSuccess?: (queued: boolean) => void;
}

const TEMPLATE_OPTIONS: Array<{
  id: StudioTemplateId;
  label: string;
  subtitle: string;
}> = [
  {
    id: "modern-bold",
    label: "Modern Bold",
    subtitle: "Contraste forte, barra superior da marca e foco tipográfico",
  },
  {
    id: "editorial-clean",
    label: "Editorial Clean",
    subtitle: "Superfície clara de revista com leitura escaneável",
  },
  {
    id: "dark-neon",
    label: "Dark Obsidian",
    subtitle: "Superfície profunda de alto impacto visual",
  },
  {
    id: "split-photo",
    label: "Split Photo 4:5",
    subtitle: "Topo fotográfico IA + card editorial inferior",
  },
];

const IMAGE_PROVIDER_OPTIONS: Array<{
  id: StudioImageProvider;
  label: string;
  costLabel: string;
}> = [
  {
    id: "pollinations",
    label: "Pollinations Flux (Zero-Key)",
    costLabel: "$0.00 / img",
  },
  {
    id: "fal-flux",
    label: "Fal.ai FLUX.1 Schnell",
    costLabel: "~$0.003 / img",
  },
  {
    id: "openrouter-image",
    label: "OpenRouter Image (FLUX)",
    costLabel: "~$0.003 / img",
  },
  {
    id: "comfyui-local",
    label: "ComfyUI / Krita Local (:8188)",
    costLabel: "$0.00 Local",
  },
  {
    id: "gemini-imagen",
    label: "Google Imagen 3",
    costLabel: "~$0.02 / img",
  },
  {
    id: "openai-image",
    label: "OpenAI GPT-Image-1",
    costLabel: "~$0.04 / img",
  },
];

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const clean = (text || "").trim().replace(/\s+/g, " ");
  if (!clean) return [""];

  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        if (lines.length >= maxLines) {
          const last = lines[maxLines - 1] ?? "";
          lines[maxLines - 1] = `${last.slice(0, Math.max(4, last.length - 3))}...`;
          return lines;
        }
      }
      current = word;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

export function DesignStudioModal({
  isOpen,
  onClose,
  postId,
  postTheme,
  slides,
  company,
  onRenderedSuccess,
}: DesignStudioModalProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<StudioTemplateId>("modern-bold");
  const [selectedProvider, setSelectedProvider] =
    useState<StudioImageProvider>("pollinations");
  const [imagePrompt, setImagePrompt] = useState<string>(
    `Fotografia editorial minimalista para ${postTheme || company.niche}`
  );
  const [backgroundDataUrl, setBackgroundDataUrl] = useState<string | null>(
    null
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [renderedUrls, setRenderedUrls] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setImagePrompt(
      `Fotografia editorial minimalista sobre ${postTheme || company.niche}`
    );
    setActiveSlideIndex(0);
    setStatusMessage(null);
  }, [postId, postTheme, company.niche]);

  const currentSlide: StudioSlideItem = slides[activeSlideIndex] || {
    slideNumber: activeSlideIndex + 1,
    title: postTheme || "Headline Principal do Slide",
    bodyText:
      "Conteúdo estruturado para engajamento e retenção visual no formato vertical 4:5.",
    ctaText: "Agende pelo link na bio",
  };

  // Desenha a lâmina 1080x1350 no Canvas HTML5 (Modo Persuade)
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    const isLight = selectedTemplate === "editorial-clean";
    const bgColor = isLight
      ? "#F8FAFC"
      : selectedTemplate === "dark-neon"
        ? "#070A12"
        : company.backgroundColor || "#0F172A";
    const textColor = isLight ? "#0F172A" : "#F8FAFC";
    const bodyColor = isLight ? "#334155" : "#CBD5E1";
    const primary = company.primaryColor || "#0D9488";
    const accent = company.accentColor || "#14B8A6";

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Bloco superior de acento da marca
    ctx.fillStyle = primary;
    ctx.fillRect(96, 76, 888, 6);

    // Se for split-photo ou tiver background gerado, desenha área visual dedicada
    if (selectedTemplate === "split-photo" || backgroundDataUrl) {
      ctx.fillStyle = isLight ? "#E2E8F0" : "#162036";
      const boxY = selectedTemplate === "split-photo" ? 150 : 0;
      const boxH = selectedTemplate === "split-photo" ? 410 : height;
      const boxX = selectedTemplate === "split-photo" ? 96 : 0;
      const boxW = selectedTemplate === "split-photo" ? 888 : width;
      ctx.globalAlpha = selectedTemplate === "split-photo" ? 0.85 : 0.18;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.globalAlpha = 1;
    }

    // Cabeçalho da marca + contador tabular
    ctx.fillStyle = textColor;
    ctx.font = "700 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(company.name, 96, 132);

    ctx.fillStyle = primary;
    ctx.textAlign = "right";
    ctx.font = "700 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `Slide ${currentSlide.slideNumber} de ${Math.max(1, slides.length)}`,
      984,
      132
    );
    ctx.textAlign = "left";

    const headlineStartY = selectedTemplate === "split-photo" ? 660 : 360;

    // Tag da lâmina
    ctx.fillStyle = primary;
    ctx.fillRect(96, headlineStartY - 88, 180, 42);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `LÂMINA ${currentSlide.slideNumber}`,
      122,
      headlineStartY - 60
    );

    // Headline com wrap seguro (break-ui resilient)
    ctx.fillStyle = textColor;
    ctx.font =
      selectedTemplate === "split-photo"
        ? "800 54px system-ui, -apple-system, sans-serif"
        : "800 62px system-ui, -apple-system, sans-serif";
    const headlineLines = wrapCanvasLines(
      ctx,
      currentSlide.title || postTheme,
      888,
      4
    );
    headlineLines.forEach((line, idx) => {
      ctx.fillText(line, 96, headlineStartY + idx * 72);
    });

    // Body copy com wrap seguro
    const bodyStartY = headlineStartY + headlineLines.length * 72 + 40;
    ctx.fillStyle = bodyColor;
    ctx.font = "400 34px system-ui, -apple-system, sans-serif";
    const bodyLines = wrapCanvasLines(
      ctx,
      currentSlide.bodyText || "",
      888,
      6
    );
    bodyLines.forEach((line, idx) => {
      ctx.fillText(line, 96, bodyStartY + idx * 48);
    });

    // Barra CTA se existir
    if (currentSlide.ctaText) {
      ctx.fillStyle = primary;
      ctx.fillRect(96, 1110, 888, 86);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 28px system-ui, -apple-system, sans-serif";
      const ctaLines = wrapCanvasLines(ctx, currentSlide.ctaText, 820, 1);
      ctx.fillText(ctaLines[0] || "", 136, 1164);
    }

    // Rodapé com @handle e indicador
    ctx.fillStyle = bodyColor;
    ctx.font = "600 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(company.instagramHandle, 96, 1272);

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(968, 1262, 12, 0, Math.PI * 2);
    ctx.fill();
  }, [
    isOpen,
    selectedTemplate,
    currentSlide,
    company,
    postTheme,
    slides.length,
    backgroundDataUrl,
  ]);

  if (!isOpen) return null;

  const handleGenerateAiBackground = async () => {
    setIsGeneratingBg(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/design/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          prompt: imagePrompt,
          brandPrimaryColor: company.primaryColor,
          brandSecondaryColor: company.secondaryColor,
          offlineFallback: true,
        }),
      });
      if (!res.ok) {
        throw new Error("Falha ao gerar background IA");
      }
      const data = (await res.json()) as {
        provider: string;
        imageUrl: string;
        costEstimateUsd: number;
      };
      setBackgroundDataUrl(data.imageUrl);
      setStatusMessage(
        `Background IA (${data.provider}) aplicado · Custo estimado: $${data.costEstimateUsd.toFixed(
          3
        )}`
      );
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Erro ao gerar background"
      );
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const handleRenderCarousel = async (enqueueImmediately: boolean) => {
    setIsRendering(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/design/render-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          templateId: selectedTemplate,
          backgroundImageUrl: backgroundDataUrl,
          imagePrompt,
          enqueueImmediately,
        }),
      });
      if (!res.ok) {
        throw new Error("Falha ao renderizar carrossel 4:5");
      }
      const data = (await res.json()) as {
        renderedCount: number;
        renderedSlides: Array<{ renderedImageUrl: string }>;
        queuedFiles: string[];
      };
      setRenderedUrls(data.renderedSlides.map((s) => s.renderedImageUrl));
      setStatusMessage(
        enqueueImmediately
          ? `${data.renderedCount} lâminas 4:5 renderizadas e enfileiradas direto no AutoSocial (Sem Canva)!`
          : `${data.renderedCount} lâminas 4:5 renderizadas com sucesso em alta definição!`
      );
      if (onRenderedSuccess) {
        onRenderedSuccess(enqueueImmediately);
      }
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Erro ao renderizar carrossel"
      );
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div
      data-ui="design-studio-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Studio Visual OpenDesign Sem Canva"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
    >
      <div className="craft-modal-enter w-full max-w-6xl rounded-2xl bg-slate-900 text-slate-100 overflow-hidden">
        {/* Top Header — Modo Operate */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-950 text-teal-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Studio Visual Autônomo (OpenDesign 4:5 · Sem Canva)
              </h2>
              <p className="text-xs text-slate-400 tabular-nums">
                Resolução nativa 1080×1350px · {slides.length} lâminas · Marca:{" "}
                {company.name}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar Studio Visual"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Studio Grid: Left = Operate Controls, Right = Persuade 4:5 Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Coluna Esquerda (7 cols): Controles Operacionais */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Seletor de Template Determinístico 4:5 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-teal-400" />
                <span>1. Template Determinístico 4:5 (OpenDesign Engine)</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TEMPLATE_OPTIONS.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`text-left p-3 rounded-xl transition-opacity ${
                        isSelected
                          ? "bg-teal-950 text-white ring-2 ring-teal-500"
                          : "bg-slate-950/70 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="font-semibold text-sm">{tpl.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {tpl.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Motor de IA de Imagem Variável (Custo-Benefício) */}
            <div className="p-4 rounded-xl bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="studio-image-provider"
                  className="text-sm font-semibold text-slate-200 flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4 text-teal-400" />
                  <span>2. Motor de Imagem IA Variável (Melhor Custo-Benefício)</span>
                </Label>
                <span className="text-xs text-teal-400 font-medium tabular-nums">
                  {
                    IMAGE_PROVIDER_OPTIONS.find((p) => p.id === selectedProvider)
                      ?.costLabel
                  }
                </span>
              </div>

              <select
                id="studio-image-provider"
                aria-label="Provedor de Imagem IA"
                value={selectedProvider}
                onChange={(e) =>
                  setSelectedProvider(e.target.value as StudioImageProvider)
                }
                className="flex h-9 w-full rounded-md bg-slate-900 px-3 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
              >
                {IMAGE_PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.costLabel})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <Input
                  aria-label="Prompt de Background IA"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Descreva a atmosfera visual do fundo..."
                  className="bg-slate-900 text-slate-100"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateAiBackground}
                  disabled={isGeneratingBg}
                  className="shrink-0 gap-2 bg-slate-900 text-teal-300 hover:bg-slate-800"
                >
                  {isGeneratingBg ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span>Gerar Fundo IA</span>
                </Button>
              </div>
            </div>

            {/* 3. Feedback de Status & Links Renderizados */}
            {statusMessage && (
              <div
                role="status"
                className="p-3.5 rounded-xl bg-teal-950/60 text-teal-200 text-xs flex items-center gap-2.5"
              >
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {renderedUrls.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 space-y-1.5">
                <div className="text-xs font-semibold text-slate-300 tabular-nums">
                  Arquivos PNG 4:5 gerados no servidor ({renderedUrls.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {renderedUrls.map((u, idx) => (
                    <a
                      key={u}
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 text-teal-300 hover:bg-slate-700 tabular-nums"
                    >
                      Lâmina {idx + 1} (.PNG)
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Ações Finais Sem Canva */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isRendering}
                onClick={() => handleRenderCarousel(false)}
                className="gap-2 bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                {isRendering ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Layers className="h-4 w-4 text-teal-400" />
                )}
                <span>Renderizar Carrossel 4:5</span>
              </Button>

              <Button
                type="button"
                disabled={isRendering}
                onClick={() => handleRenderCarousel(true)}
                className="gap-2 bg-teal-600 text-white hover:bg-teal-500"
              >
                {isRendering ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Renderizar & Enviar para Fila AutoSocial (Sem Canva)</span>
              </Button>
            </div>
          </div>

          {/* Coluna Direita (5 cols): Palco 4:5 Persuade Canvas Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-950 rounded-2xl p-4">
            <div className="w-full flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 tabular-nums">
                Preview Lâmina {activeSlideIndex + 1} de{" "}
                {Math.max(1, slides.length)} (1080×1350)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={activeSlideIndex <= 0}
                  onClick={() =>
                    setActiveSlideIndex((prev) => Math.max(0, prev - 1))
                  }
                  aria-label="Lâmina Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={activeSlideIndex >= slides.length - 1}
                  onClick={() =>
                    setActiveSlideIndex((prev) =>
                      Math.min(slides.length - 1, prev + 1)
                    )
                  }
                  aria-label="Próxima Lâmina"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full max-w-[300px] aspect-[4/5] rounded-xl overflow-hidden bg-slate-900">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1350}
                data-testid="opendesign-canvas"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Motor OpenDesign 4:5 · Renderização determinística sem depender do
              Canva Pro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

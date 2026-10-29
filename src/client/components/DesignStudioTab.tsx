import React, { useState, useEffect, useRef } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import type { Post } from "@/client/types/schedule";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Badge } from "@/client/components/ui/badge";
import {
  Layers,
  Sparkles,
  Wand2,
  Send,
  CheckCircle,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import type { StudioTemplateId, StudioImageProvider } from "./DesignStudioModal";

interface DesignStudioTabProps {
  onSwitchToCanva?: () => void;
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

const DAY_LABELS: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

function getMonday(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0] || "";
}

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

export function DesignStudioTab({ onSwitchToCanva }: DesignStudioTabProps) {
  const { activeCompany } = useCompany();
  const [weekStartDate] = useState<string>(getMonday());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<StudioTemplateId>("modern-bold");
  const [selectedProvider, setSelectedProvider] = useState<StudioImageProvider>("pollinations");
  const [imagePrompt, setImagePrompt] = useState("");
  const [aiBackgroundDataUrl, setAiBackgroundDataUrl] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [renderedUrls, setRenderedUrls] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Carregar cronograma da semana
  useEffect(() => {
    if (!activeCompany) return;
    const loadSchedule = async () => {
      try {
        const res = await fetch(
          `/api/schedules?companyId=${activeCompany.id}&weekStartDate=${weekStartDate}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          setPosts(json.data.posts || []);
        }
      } catch (err) {
        console.error("Erro ao carregar cronograma no Studio:", err);
      }
    };
    loadSchedule();
  }, [activeCompany?.id, weekStartDate]);

  const activePost = posts[selectedDayIndex];
  const slides = activePost?.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0];

  useEffect(() => {
    setActiveSlideIndex(0);
    setRenderedUrls([]);
    setStatusMessage(null);
  }, [selectedDayIndex]);

  // Renderizador nativo 4:5 no Canvas (1080x1350)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeCompany) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const primaryColor = activeCompany.primaryColor || "#0D9488";
    const secondaryColor = activeCompany.secondaryColor || "#EC4899";
    const backgroundColor = activeCompany.backgroundColor || "#0F172A";
    const accentColor = activeCompany.accentColor || "#10B981";

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (aiBackgroundDataUrl) {
      const bgImg = new Image();
      bgImg.src = aiBackgroundDataUrl;
      bgImg.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.drawImage(bgImg, 0, 0, width, height);
        ctx.restore();
        drawTypographyLayers();
      };
      return;
    }

    drawTypographyLayers();

    function drawTypographyLayers() {
      if (!ctx || !activeCompany) return;

      if (selectedTemplate === "modern-bold") {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, width, 24);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.name.toUpperCase(), 80, 110);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "500 24px 'Instrument Sans', sans-serif";
        ctx.fillText(
          `${activeSlideIndex + 1} / ${Math.max(1, slides.length)}`,
          width - 150,
          110
        );

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 72px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Título do Slide";
        const titleLines = wrapCanvasLines(ctx, titleText, 920, 3);
        let yPos = 260;
        for (const line of titleLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 88;
        }

        ctx.fillStyle = "#CBD5E1";
        ctx.font = "normal 38px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Desenvolvimento estratégico do carrossel preparado sem Canva.";
        const bodyLines = wrapCanvasLines(ctx, bodyText, 920, 5);
        yPos += 30;
        for (const line of bodyLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 54;
        }

        if (currentSlide?.ctaText) {
          ctx.fillStyle = secondaryColor;
          ctx.beginPath();
          ctx.roundRect(80, height - 240, 920, 90, 16);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 34px 'Instrument Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(currentSlide.ctaText, width / 2, height - 184);
          ctx.textAlign = "left";
        }

        ctx.fillStyle = "#64748B";
        ctx.font = "500 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.instagramHandle || "@democorp", 80, height - 70);
      } else if (selectedTemplate === "editorial-clean") {
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = primaryColor;
        ctx.font = "bold 32px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.name.toUpperCase(), 90, 120);

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 68px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Editorial Clean";
        const titleLines = wrapCanvasLines(ctx, titleText, 900, 3);
        let yPos = 270;
        for (const line of titleLines) {
          ctx.fillText(line, 90, yPos);
          yPos += 84;
        }

        ctx.fillStyle = "#334155";
        ctx.font = "normal 38px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Tipografia editorial de revista com alta legibilidade.";
        const bodyLines = wrapCanvasLines(ctx, bodyText, 900, 5);
        yPos += 40;
        for (const line of bodyLines) {
          ctx.fillText(line, 90, yPos);
          yPos += 56;
        }

        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(90, height - 120);
        ctx.lineTo(width - 90, height - 120);
        ctx.stroke();

        ctx.fillStyle = "#64748B";
        ctx.font = "500 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.instagramHandle || "@democorp", 90, height - 70);
      } else {
        // Dark Neon & Split Photo
        ctx.fillStyle = "#090D16";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 30px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.name.toUpperCase(), 80, 110);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 70px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Dark Obsidian 4:5";
        const titleLines = wrapCanvasLines(ctx, titleText, 920, 3);
        let yPos = 260;
        for (const line of titleLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 84;
        }

        ctx.fillStyle = "#94A3B8";
        ctx.font = "normal 38px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Design de alto contraste com renderização pura sem Canva.";
        const bodyLines = wrapCanvasLines(ctx, bodyText, 920, 5);
        yPos += 40;
        for (const line of bodyLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 56;
        }

        ctx.fillStyle = "#64748B";
        ctx.font = "500 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.instagramHandle || "@democorp", 80, height - 70);
      }
    }
  }, [selectedTemplate, aiBackgroundDataUrl, activeSlideIndex, activePost, currentSlide, activeCompany]);

  // Gerar fundo com IA variável
  const handleGenerateAiBackground = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingBg(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/design/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          prompt: imagePrompt.trim(),
          brandPrimaryColor: activeCompany?.primaryColor,
          brandSecondaryColor: activeCompany?.secondaryColor,
          offlineFallback: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.message || "Falha ao gerar background com IA");
      }
      setAiBackgroundDataUrl(data.imageUrl);
      setStatusMessage(
        `Background gerado com sucesso via ${data.provider} ($${data.costEstimateUsd.toFixed(4)})!`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar background";
      setStatusMessage(`Erro: ${msg}`);
    } finally {
      setIsGeneratingBg(false);
    }
  };

  // Renderizar carrossel completo e opcionalmente enfileirar
  const handleRenderCarousel = async (enqueue: boolean) => {
    if (!activePost) return;
    setIsRendering(true);
    setStatusMessage(null);
    try {
      const canvas = canvasRef.current;
      const clientCanvasDataUrl = canvas ? canvas.toDataURL("image/png") : undefined;

      const res = await fetch("/api/design/render-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: activePost.id,
          templateId: selectedTemplate,
          imageProvider: selectedProvider,
          imagePrompt: imagePrompt || undefined,
          enqueueImmediately: enqueue,
          clientCanvasDataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha na renderização OpenDesign");
      }

      const urls = (data.renderedSlides || []).map(
        (s: { renderedImageUrl: string }) => s.renderedImageUrl
      );
      setRenderedUrls(urls);

      if (enqueue) {
        setStatusMessage(
          `Sucesso! ${data.renderedCount} lâminas renderizadas e enviadas diretamente para o AutoSocial (Sem Canva)!`
        );
      } else {
        setStatusMessage(
          `Sucesso! ${data.renderedCount} lâminas 4:5 geradas em PNG no servidor.`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na renderização";
      setStatusMessage(`Erro: ${msg}`);
    } finally {
      setIsRendering(false);
    }
  };

  if (!activeCompany) {
    return (
      <div className="py-12 text-center text-slate-400">
        Selecione uma empresa no topo para acessar o Studio Visual.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Transição de Modo */}
      <div className="p-4 rounded-xl border border-teal-800/80 bg-teal-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-900/60 border border-teal-700/80 text-teal-300 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">
                Modo Sem Canva (Studio Visual Autônomo OpenDesign 4:5)
              </h3>
              <Badge variant="outline" className="text-[11px] text-teal-300 border-teal-700">
                Recomendado / 100% Autônomo
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Crie carrosséis 4:5 profissionais diretamente no navegador, gere fundos com IA de melhor custo-benefício e enfileire direto no AutoSocial sem precisar do Canva Pro.
            </p>
          </div>
        </div>

        {onSwitchToCanva && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSwitchToCanva}
            className="gap-1.5 border-sky-800 bg-sky-950/40 text-sky-200 hover:bg-sky-900/50 hover:text-white shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-sky-400" />
            <span>Mudar para Modo com Canva</span>
          </Button>
        )}
      </div>

      {/* Seletor do Post/Dia da Semana */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full min-w-0">
        {posts.map((post, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                isSelected
                  ? "border-teal-500 bg-teal-950/60 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{DAY_LABELS[post.dayOfWeek]?.split("-")[0] || post.dayOfWeek}</span>
              <span className="text-slate-400 font-normal ml-1.5 truncate max-w-[120px] inline-block align-bottom">
                — {post.theme || "A definir"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Principal do Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (7 cols): Controles do Studio */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Template Determinístico 4:5 */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-3">
            <Label className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-400" />
              <span>1. Escolha o Template 4:5 (OpenDesign)</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEMPLATE_OPTIONS.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`text-left p-3 rounded-xl transition-colors cursor-pointer min-w-0 overflow-hidden ${
                      isSelected
                        ? "bg-teal-950 text-white border-2 border-teal-500"
                        : "bg-slate-950/70 text-slate-300 border border-slate-800/80 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold text-sm truncate">{tpl.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {tpl.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 2. Motor de Imagem IA Variável */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="studio-tab-provider" className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-teal-400" />
                <span>2. Motor de Imagem IA (Melhor Custo-Benefício)</span>
              </Label>
              <span className="text-xs text-teal-400 font-mono font-bold tabular-nums">
                {IMAGE_PROVIDER_OPTIONS.find((p) => p.id === selectedProvider)?.costLabel}
              </span>
            </div>

            <select
              id="studio-tab-provider"
              aria-label="Provedor de Imagem IA"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as StudioImageProvider)}
              className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
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
                placeholder="Descreva o fundo desejado (ex: clínica estética com luz natural)..."
                className="bg-slate-950 text-slate-100 border-slate-700"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateAiBackground}
                disabled={isGeneratingBg || !imagePrompt.trim()}
                className="shrink-0 gap-2 border-teal-800 bg-teal-950/60 text-teal-200 hover:bg-teal-900 hover:text-white cursor-pointer"
              >
                {isGeneratingBg ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-teal-400" />
                ) : (
                  <Wand2 className="h-4 w-4 text-teal-400" />
                )}
                <span>Gerar Fundo IA</span>
              </Button>
            </div>
          </Card>

          {/* Feedback e Links Gerados */}
          {statusMessage && (
            <div
              role="status"
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                statusMessage.startsWith("Erro")
                  ? "bg-rose-950/50 border-rose-800 text-rose-200"
                  : "bg-teal-950/50 border-teal-800 text-teal-200"
              }`}
            >
              {statusMessage.startsWith("Erro") ? (
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {renderedUrls.length > 0 && (
            <Card className="border-slate-800 bg-slate-900 p-4 space-y-2">
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
                    className="text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-teal-300 hover:bg-slate-800 tabular-nums"
                  >
                    Lâmina {idx + 1} (.PNG)
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Ações Finais Sem Canva */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isRendering || !activePost}
              onClick={() => handleRenderCarousel(false)}
              className="gap-2 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 cursor-pointer"
            >
              {isRendering ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Layers className="h-4 w-4 text-teal-400" />
              )}
              <span>Renderizar PNGs 4:5</span>
            </Button>

            <Button
              type="button"
              disabled={isRendering || !activePost}
              onClick={() => handleRenderCarousel(true)}
              className="gap-2 bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
            >
              {isRendering ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Renderizar & Enviar para AutoSocial (Sem Canva)</span>
            </Button>
          </div>
        </div>

        {/* Coluna Direita (5 cols): Palco 4:5 do Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="w-full flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-300 tabular-nums">
              Preview Lâmina {activeSlideIndex + 1} de {Math.max(1, slides.length)} (1080×1350)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={activeSlideIndex <= 0}
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Lâmina Anterior"
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={activeSlideIndex >= slides.length - 1}
                onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                aria-label="Próxima Lâmina"
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-full max-w-[320px] aspect-[4/5] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <canvas
              ref={canvasRef}
              width={1080}
              height={1350}
              data-testid="opendesign-canvas"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-full mt-4 pt-3 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Motor OpenDesign 4:5 · 100% Autônomo e sem Canva Pro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

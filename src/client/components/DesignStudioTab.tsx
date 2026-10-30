import React, { useState, useEffect, useRef } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import type { Post, PostSlide } from "@/client/types/schedule";
import type { PhotoAsset } from "@/client/types/photo";
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
  Clock,
  Plus,
  Minus,
  Copy,
  Check,
  Save,
  Calendar,
} from "lucide-react";
import type { StudioTemplateId, StudioImageProvider } from "./DesignStudioModal";

interface DesignStudioTabProps {
  onSwitchToCanva?: () => void;
  selectedDayIndex?: number;
  onSelectDayIndex?: (index: number) => void;
}

const TEMPLATE_OPTIONS: Array<{
  id: StudioTemplateId;
  label: string;
  subtitle: string;
}> = [
  {
    id: "modern-bold",
    label: "Modern Bold 4:5",
    subtitle: "Cores primárias vibrantes, tipografia de impacto para hooks",
  },
  {
    id: "editorial-clean",
    label: "Editorial Clean",
    subtitle: "Minimalismo premium, fundo claro e legibilidade máxima",
  },
  {
    id: "dark-neon",
    label: "Dark Obsidian",
    subtitle: "Contraste escuro cinematográfico, ideal para autoridade",
  },
  {
    id: "split-photo",
    label: "Split Photo 4:5",
    subtitle: "50% foto real da marca + 50% bloco tipográfico",
  },
];

const IMAGE_PROVIDER_OPTIONS: Array<{
  id: StudioImageProvider;
  label: string;
  costLabel: string;
}> = [
  {
    id: "pollinations",
    label: "Pollinations Zero-Key",
    costLabel: "$0.00 / img (Livre)",
  },
  {
    id: "comfyui-local",
    label: "ComfyUI / Krita Local (:8188)",
    costLabel: "Local GPU ($0.00)",
  },
  {
    id: "fal-flux",
    label: "Fal.ai (Flux Schnell)",
    costLabel: "$0.003 / img",
  },
];

const EDITORIAL_CATEGORIES = [
  "Dica Prática",
  "Quebra de Mito",
  "Prova Social",
  "Tutorial",
  "Bastidores",
  "Venda Direta",
  "Autoridade",
];

const TIME_PRESETS = ["09:00", "12:00", "15:00", "18:30", "20:00"];

const DAY_LABELS: Record<string, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
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
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word || "";
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }
  lines.push(currentLine);
  return lines;
}

export function DesignStudioTab({
  onSwitchToCanva,
  selectedDayIndex: externalDayIndex,
  onSelectDayIndex,
}: DesignStudioTabProps) {
  const { activeCompany } = useCompany();
  const [weekStartDate] = useState<string>(getMonday());
  const [posts, setPosts] = useState<Post[]>([]);
  const [localDayIndex, setLocalDayIndex] = useState(0);
  const selectedDayIndex = externalDayIndex !== undefined ? externalDayIndex : localDayIndex;
  const setSelectedDayIndex = (idx: number) => {
    setLocalDayIndex(idx);
    onSelectDayIndex?.(idx);
  };

  const [selectedTemplate, setSelectedTemplate] = useState<StudioTemplateId>("modern-bold");
  const [selectedProvider, setSelectedProvider] = useState<StudioImageProvider>("pollinations");
  const [imagePrompt, setImagePrompt] = useState("");
  const [aiBackgroundDataUrl, setAiBackgroundDataUrl] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [renderedUrls, setRenderedUrls] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Carregar cronograma da semana
  const loadSchedule = async () => {
    if (!activeCompany) return;
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

  // Carregar fotos do acervo da empresa (Isolamento Estrito de Tenants)
  const loadPhotos = async () => {
    if (!activeCompany) return;
    try {
      const res = await fetch(`/api/photos?companyId=${activeCompany.id}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPhotos(json.data);
      }
    } catch (err) {
      console.error("Erro ao carregar fotos do tenant:", err);
    }
  };

  useEffect(() => {
    loadSchedule();
    loadPhotos();
  }, [activeCompany?.id, weekStartDate]);

  const activePost = posts[selectedDayIndex];
  const slides = activePost?.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0];

  useEffect(() => {
    setActiveSlideIndex(0);
    setRenderedUrls([]);
    setStatusMessage(null);
  }, [selectedDayIndex]);

  // Alterar campo do post ativo
  const handleUpdateActivePost = (field: keyof Post, value: unknown) => {
    if (!activePost) return;
    const updated = [...posts];
    updated[selectedDayIndex] = { ...activePost, [field]: value };
    setPosts(updated);
  };

  // Alterar quantidade de lâminas (3 a 10)
  const handleSlideCountChange = (newCount: number) => {
    if (!activePost) return;
    if (newCount < 3 || newCount > 10) return;

    const updatedPosts = [...posts];
    const targetPost = { ...activePost, slideCount: newCount };

    if (newCount > targetPost.slides.length) {
      const currentLen = targetPost.slides.length;
      for (let i = currentLen + 1; i <= newCount; i++) {
        targetPost.slides.push({
          id: `temp_slide_${targetPost.id}_${i}`,
          postId: targetPost.id,
          slideNumber: i,
          title: i === newCount ? "Chamada para Ação" : `Passo ${i - 1}`,
          bodyText: `Explicação detalhada da lâmina ${i}`,
          ctaText: i === newCount ? "Entre em contato pelo WhatsApp!" : null,
          assignedPhotoId: null,
        });
      }
    } else if (newCount < targetPost.slides.length) {
      targetPost.slides = targetPost.slides.slice(0, newCount);
    }

    updatedPosts[selectedDayIndex] = targetPost;
    setPosts(updatedPosts);
    if (activeSlideIndex >= newCount) {
      setActiveSlideIndex(newCount - 1);
    }
  };

  // Alterar campo do slide ativo
  const handleUpdateSlide = (field: keyof PostSlide, value: unknown) => {
    if (!activePost || !currentSlide) return;
    const updatedSlides = [...activePost.slides];
    const targetIdx = updatedSlides.findIndex((s) => s.slideNumber === currentSlide.slideNumber);
    if (targetIdx !== -1) {
      updatedSlides[targetIdx] = { ...updatedSlides[targetIdx]!, [field]: value };
      const updatedPosts = [...posts];
      updatedPosts[selectedDayIndex] = { ...activePost, slides: updatedSlides };
      setPosts(updatedPosts);
    }
  };

  // Salvar post e lâminas
  const handleSavePost = async () => {
    if (!activePost) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const postRes = await fetch(`/api/posts/${activePost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: activePost.theme,
          category: activePost.category,
          slideCount: activePost.slideCount,
          status: activePost.status,
          caption: activePost.caption,
          scheduledTime: activePost.scheduledTime || "09:00",
        }),
      });
      const postJson = await postRes.json();
      if (!postJson.success) throw new Error(postJson.error || "Erro ao salvar post");

      const slidesRes = await fetch(`/api/posts/${activePost.id}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: activePost.slides }),
      });
      const slidesJson = await slidesRes.json();
      if (!slidesJson.success) throw new Error(slidesJson.error || "Erro ao salvar lâminas");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setStatusMessage("Post e lâminas salvos com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setStatusMessage(`Erro: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Geração completa com IA (multi-tenant com acervo de fotos da empresa)
  const handleGenerateAI = async () => {
    if (!activePost) return;
    setIsGeneratingAI(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: activePost.id,
          theme: activePost.theme,
          category: activePost.category,
          slideCount: activePost.slideCount,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "Erro ao gerar post com IA");
      }

      const updatedPost: Post = json.data;
      const updatedPosts = [...posts];
      updatedPosts[selectedDayIndex] = updatedPost;
      setPosts(updatedPosts);
      setStatusMessage("Post preenchido pela IA com sugestões calibradas e fotos da marca!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro na geração";
      setStatusMessage(`Erro: ${msg}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

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
        ctx.fillRect(0, 0, width, 220);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.name.toUpperCase(), 80, 120);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 72px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Modern Bold 4:5";
        const titleLines = wrapCanvasLines(ctx, titleText, 920, 3);
        let yPos = 360;
        for (const line of titleLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 86;
        }

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "normal 40px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Template determinístico sem Canva para criação rápida e autônoma de conteúdo.";
        const bodyLines = wrapCanvasLines(ctx, bodyText, 920, 5);
        yPos += 40;
        for (const line of bodyLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 58;
        }

        ctx.fillStyle = secondaryColor;
        ctx.fillRect(80, height - 160, width - 160, 4);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "500 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.instagramHandle || "@democorp", 80, height - 90);

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(width - 100, height - 98, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedTemplate === "editorial-clean") {
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#0F172A";
        ctx.font = "italic 32px 'Instrument Sans', serif";
        ctx.fillText(activeCompany.name, 90, 130);

        ctx.fillStyle = "#0F172A";
        ctx.font = "600 64px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Editorial Clean 4:5";
        const titleLines = wrapCanvasLines(ctx, titleText, 900, 3);
        let yPos = 320;
        for (const line of titleLines) {
          ctx.fillText(line, 90, yPos);
          yPos += 82;
        }

        ctx.fillStyle = "#334155";
        ctx.font = "normal 38px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Equilíbrio tipográfico refinado com proporções editoriais para maior autoridade.";
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
          prompt: imagePrompt,
          theme: activePost?.theme || "Instagram 4:5 Post",
          brandPrimaryColor: activeCompany?.primaryColor,
          brandSecondaryColor: activeCompany?.secondaryColor,
          offlineFallback: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Falha ao gerar background com IA");
      }

      setAiBackgroundDataUrl(json.imageUrl);
      setStatusMessage(
        `Background IA (${json.provider}) aplicado · Custo estimado: $${(json.costEstimateUsd || 0).toFixed(
          3
        )}${json.isFallback ? " (Modo Fallback Seguro)" : ""}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar background";
      setStatusMessage(`Erro: ${msg}`);
    } finally {
      setIsGeneratingBg(false);
    }
  };

  // Renderizar PNGs e enviar para o AutoSocial
  const handleRenderCarousel = async (enqueueDirectly: boolean) => {
    if (!activePost || !activeCompany) return;
    setIsRendering(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/design/render-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: activePost.id,
          templateId: selectedTemplate,
          backgroundImageUrl: aiBackgroundDataUrl,
          enqueueImmediately: enqueueDirectly,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Falha na renderização 4:5");
      }

      const slidesUrls = json.renderedSlides
        ? json.renderedSlides.map((s: { renderedImageUrl: string }) => s.renderedImageUrl)
        : json.renderedUrls || [];
      setRenderedUrls(slidesUrls);
      const count = json.renderedCount || slidesUrls.length;
      if (enqueueDirectly) {
        setStatusMessage(
          `Sucesso! ${count} lâminas renderizadas e enviadas diretamente para o AutoSocial (horário: ${activePost.scheduledTime || "09:00"}).`
        );
      } else {
        setStatusMessage(
          `Renderização 4:5 concluída! ${count} lâminas geradas no servidor.`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na renderização";
      setStatusMessage(`Erro: ${msg}`);
    } finally {
      setIsRendering(false);
    }
  };

  const handleCopyCaption = () => {
    if (!activePost?.caption) return;
    navigator.clipboard.writeText(activePost.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Estação de Criação 4:5 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Studio Visual 4:5 — Estação Completa de Criação
            </h2>
            <Badge variant="outline" className="text-xs border-teal-800 text-teal-300">
              Operate + Persuade
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Crie, redija, gere roteiros com IA, vincule fotos da marca e renderize carrosséis 1080×1350 autônomos.
          </p>
        </div>

        {onSwitchToCanva && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSwitchToCanva}
            className="border-slate-700 bg-slate-950 text-slate-300 hover:text-white cursor-pointer gap-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-pink-400" />
            <span>Mudar para Modo com Canva</span>
          </Button>
        )}
      </div>

      {/* Seletor Rápido de Dias da Semana com Horário e Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {posts.map((post, idx) => {
          const isSelected = selectedDayIndex === idx;
          const dayName = DAY_LABELS[post.dayOfWeek] || post.dayOfWeek;
          const time = post.scheduledTime || "09:00";
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-2.5 rounded-xl text-left border transition-colors cursor-pointer min-w-0 ${
                isSelected
                  ? "bg-teal-950/80 border-teal-500"
                  : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-white truncate">{dayName}</span>
                <span className="text-[11px] font-mono font-medium text-teal-400 tabular-nums">
                  {time}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-1">
                {post.theme || "Tema a definir"}
              </div>
              <div className="flex items-center justify-between gap-1 mt-1.5">
                <span className="text-[11px] text-slate-500 tabular-nums font-mono">
                  {post.slideCount} slides
                </span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    post.status === "queued"
                      ? "bg-emerald-400"
                      : post.status === "ready_canva"
                      ? "bg-teal-400"
                      : post.status === "ai_generated"
                      ? "bg-sky-400"
                      : "bg-amber-400"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid Principal: Split-Workstation 60 / 40 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (7 cols / ~58%): Roteiro, IA, Lâminas & Mídia */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Identificação Editorial & Horário de Publicação */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-400" />
                <span>1. Dados Editoriais & Horário de Publicação</span>
              </Label>
              <Button
                type="button"
                size="sm"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI || !activePost}
                className="gap-2 bg-teal-600 hover:bg-teal-500 text-white cursor-pointer active:scale-95"
              >
                {isGeneratingAI ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Preencher Tudo com IA</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="studio-post-category" className="text-xs text-slate-300">
                  Categoria Editorial
                </Label>
                <select
                  id="studio-post-category"
                  value={activePost?.category || "Dica Prática"}
                  onChange={(e) => handleUpdateActivePost("category", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
                >
                  {EDITORIAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studio-post-time" className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-teal-400" />
                  <span>Horário Programado (HH:MM)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="studio-post-time"
                    type="time"
                    value={activePost?.scheduledTime || "09:00"}
                    onChange={(e) => handleUpdateActivePost("scheduledTime", e.target.value)}
                    className="bg-slate-950 text-slate-100 border-slate-700 font-mono tabular-nums h-9"
                  />
                  <select
                    aria-label="Preset de Horário"
                    value={activePost?.scheduledTime || "09:00"}
                    onChange={(e) => handleUpdateActivePost("scheduledTime", e.target.value)}
                    className="flex h-9 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 font-mono tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
                  >
                    {TIME_PRESETS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studio-post-theme" className="text-xs text-slate-300">
                Tema Central do Post
              </Label>
              <Input
                id="studio-post-theme"
                value={activePost?.theme || ""}
                onChange={(e) => handleUpdateActivePost("theme", e.target.value)}
                placeholder="Ex: 5 Dicas para Reduzir Custos Operacionais"
                className="bg-slate-950 text-slate-100 border-slate-700"
              />
            </div>
          </Card>

          {/* 2. Stepper Dinâmico de Lâminas (3 a 10) */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <Label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-teal-400" />
                  <span>2. Estrutura do Carrossel (3 a 10 Lâminas)</span>
                </Label>
                <p className="text-xs text-slate-400 mt-0.5">
                  Variável dinâmica: Capa + Miolo educativo + CTA final
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Diminuir Lâminas"
                  onClick={() => handleSlideCountChange((activePost?.slideCount || 5) - 1)}
                  disabled={(activePost?.slideCount || 5) <= 3}
                  className="h-8 w-8 active:scale-95 cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>

                <div className="w-16 text-center h-8 flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-sm font-mono font-bold text-white tabular-nums">
                  {activePost?.slideCount || 5}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Aumentar Lâminas"
                  onClick={() => handleSlideCountChange((activePost?.slideCount || 5) + 1)}
                  disabled={(activePost?.slideCount || 5) >= 10}
                  className="h-8 w-8 active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Abas Horizontais das Lâminas */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
              {slides.map((s, idx) => {
                const isCurrent = activeSlideIndex === idx;
                const isCover = idx === 0;
                const isCTA = idx === slides.length - 1;
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-teal-600 text-white"
                        : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {isCover ? "1. Capa" : isCTA ? `${idx + 1}. CTA` : `${idx + 1}. Slide`}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 3. Editor da Lâmina Selecionada */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-400" />
                <span>
                  3. Lâmina {activeSlideIndex + 1} de {slides.length} —{" "}
                  {activeSlideIndex === 0
                    ? "Capa / Gancho"
                    : activeSlideIndex === slides.length - 1
                    ? "Chamada para Ação"
                    : "Conteúdo"}
                </span>
              </Label>
              <Badge variant="outline" className="text-xs font-mono tabular-nums border-slate-700 text-slate-300">
                Slide {activeSlideIndex + 1}/{slides.length}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studio-slide-title" className="text-xs text-slate-300">
                Título ou Gancho
              </Label>
              <Input
                id="studio-slide-title"
                value={currentSlide?.title || ""}
                onChange={(e) => handleUpdateSlide("title", e.target.value)}
                placeholder="Ex: Como Economizar 40% em Software"
                className="bg-slate-950 text-slate-100 border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studio-slide-body" className="text-xs text-slate-300">
                Corpo do Texto / Argumento
              </Label>
              <textarea
                id="studio-slide-body"
                rows={3}
                value={currentSlide?.bodyText || ""}
                onChange={(e) => handleUpdateSlide("bodyText", e.target.value)}
                placeholder="Explicação direta, dados ou argumento principal desta lâmina..."
                className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studio-slide-cta" className="text-xs text-slate-300">
                Chamada para Ação (CTA)
              </Label>
              <Input
                id="studio-slide-cta"
                value={currentSlide?.ctaText || ""}
                onChange={(e) => handleUpdateSlide("ctaText", e.target.value)}
                placeholder="Ex: Envie mensagem pelo WhatsApp!"
                className="bg-slate-950 text-slate-100 border-slate-700"
              />
            </div>

            {/* Vinculação de Foto do Acervo da Empresa */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <Label htmlFor="studio-slide-photo" className="text-xs text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-teal-400" />
                <span>Foto Vinculada do Acervo ({photos.length} disponíveis neste tenant)</span>
              </Label>
              <select
                id="studio-slide-photo"
                value={currentSlide?.assignedPhotoId || ""}
                onChange={(e) => handleUpdateSlide("assignedPhotoId", e.target.value || null)}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
              >
                <option value="">Nenhuma foto vinculada (Usar fundo puro/IA)</option>
                {photos.map((ph) => (
                  <option key={ph.id} value={ph.id}>
                    {ph.originalName} ({ph.category})
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* 4. Legenda do Instagram & Ação de Salvar */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="studio-post-caption" className="text-sm font-semibold text-white">
                4. Legenda do Post no Instagram
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCaption}
                disabled={!activePost?.caption}
                className="h-7 text-xs gap-1.5 border-slate-700 bg-slate-950 text-slate-300 hover:text-white cursor-pointer active:scale-95"
              >
                {copiedCaption ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCaption ? "Copiado!" : "Copiar Legenda"}</span>
              </Button>
            </div>

            <textarea
              id="studio-post-caption"
              rows={4}
              value={activePost?.caption || ""}
              onChange={(e) => handleUpdateActivePost("caption", e.target.value)}
              placeholder="Legenda completa do post gerada com IA ou personalizada..."
              className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 font-sans"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400">
                {activePost?.caption ? `${activePost.caption.length} caracteres` : "Sem legenda"}
              </div>
              <Button
                type="button"
                onClick={handleSavePost}
                disabled={isSaving || !activePost}
                className="gap-2 bg-teal-600 hover:bg-teal-500 text-white cursor-pointer active:scale-95"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saveSuccess ? "Salvo com Sucesso!" : "Salvar Alterações"}</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Coluna Direita (5 cols / ~42%): Canvas 1080×1350, Templates 4:5 & Exportação */}
        <div className="lg:col-span-5 space-y-5">
          {/* Seletor de Template 4:5 */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-3">
            <Label className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-400" />
              <span>Template 4:5 (OpenDesign)</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATE_OPTIONS.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`text-left p-2.5 rounded-xl transition-colors cursor-pointer min-w-0 ${
                      isSelected
                        ? "bg-teal-950 text-white border-2 border-teal-500"
                        : "bg-slate-950/70 text-slate-300 border border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold text-xs truncate">{tpl.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {tpl.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Motor de Imagem IA */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="studio-tab-provider" className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-teal-400" />
                <span>Motor de Imagem IA</span>
              </Label>
              <span className="text-[11px] text-teal-400 font-mono font-bold tabular-nums">
                {IMAGE_PROVIDER_OPTIONS.find((p) => p.id === selectedProvider)?.costLabel}
              </span>
            </div>

            <select
              id="studio-tab-provider"
              aria-label="Provedor de Imagem IA"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as StudioImageProvider)}
              className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
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
                placeholder="Descreva o fundo desejado (ex: consultório moderno)..."
                className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAiBackground}
                disabled={isGeneratingBg || !imagePrompt.trim()}
                className="shrink-0 gap-1.5 border-teal-800 bg-teal-950/60 text-teal-200 hover:bg-teal-900 hover:text-white cursor-pointer active:scale-95"
              >
                {isGeneratingBg ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-400" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5 text-teal-400" />
                )}
                <span>Gerar Fundo IA</span>
              </Button>
            </div>
          </Card>

          {/* Palco Canvas 1080×1350 com Proporção 4:5 */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-white">
                Palco Canvas 1080×1350 (4:5)
              </Label>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Lâmina {activeSlideIndex + 1} de {slides.length || 5}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="w-full max-w-[340px] aspect-[4/5] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative"
              >
                <canvas
                  ref={canvasRef}
                  data-testid="opendesign-canvas"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Controles de Navegação de Lâminas */}
              <div className="flex items-center gap-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={activeSlideIndex <= 0}
                  onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                  className="h-8 gap-1 border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Anterior</span>
                </Button>

                <span className="text-xs font-mono font-medium text-slate-300 tabular-nums">
                  {activeSlideIndex + 1} / {slides.length || 5}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={activeSlideIndex >= slides.length - 1}
                  onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                  className="h-8 gap-1 border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800 cursor-pointer active:scale-95"
                >
                  <span>Próxima</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Feedback & Status Message */}
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

          {/* Arquivos PNG Gerados */}
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

          {/* Ações Finais de Renderização & Envio */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isRendering || !activePost}
              onClick={() => handleRenderCarousel(false)}
              className="gap-2 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 cursor-pointer active:scale-95"
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
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95"
            >
              {isRendering ? (
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Renderizar & Enviar para o AutoSocial</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

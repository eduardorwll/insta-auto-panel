import React, { useState, useEffect } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import type { Post, PostSlide } from "@/client/types/schedule";
import type { PhotoAsset } from "@/client/types/photo";
import { SlidePreview } from "./SlidePreview";
import { DesignStudioModal } from "./DesignStudioModal";
import { seoChecks, parseKeywordCluster } from "@/shared/seo-quality";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Badge } from "@/client/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Save,
  CheckCircle,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Send,
  Layers,
  Clock,
  Eye,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

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

function getTimePeriod(timeStr?: string | null): string {
  if (!timeStr) return "Manhã";
  const hour = parseInt(timeStr.split(":")[0] || "9", 10);
  if (hour < 12) return "Manhã";
  if (hour < 18) return "Tarde";
  return "Noite";
}

const DAY_LABELS: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

const DAY_SHORT: Record<string, string> = {
  segunda: "SEG",
  terca: "TER",
  quarta: "QUA",
  quinta: "QUI",
  sexta: "SEX",
  sabado: "SÁB",
  domingo: "DOM",
};

// Obter a segunda-feira da semana atual em formato YYYY-MM-DD
function getMonday(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0] || "";
}

function getTimeSlotBadge(timeStr?: string | null): { label: string; badgeClass: string } {
  if (!timeStr) return { label: "Manhã", badgeClass: "bg-slate-950 text-slate-300 border-slate-800" };
  const hour = parseInt(timeStr.split(":")[0] || "9", 10);
  if (hour < 12) return { label: "Manhã", badgeClass: "bg-slate-950 text-amber-300 border-slate-800" };
  if (hour < 18) return { label: "Tarde", badgeClass: "bg-slate-950 text-sky-300 border-slate-800" };
  return { label: "Noite", badgeClass: "bg-slate-950 text-teal-300 border-slate-800" };
}

export function WeekPlanner({ onOpenStudio }: { onOpenStudio?: (dayIdx?: number) => void } = {}) {
  const { activeCompany } = useCompany();
  const [weekStartDate, setWeekStartDate] = useState<string>(getMonday());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeSlideNumber, setActiveSlideNumber] = useState(1);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isEnqueuingPost, setIsEnqueuingPost] = useState(false);
  const [enqueueSuccess, setEnqueueSuccess] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [showFeedMockup, setShowFeedMockup] = useState(true);

  // Carregar cronograma da semana
  const fetchSchedule = async () => {
    if (!activeCompany) return;
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/schedules?companyId=${activeCompany.id}&weekStartDate=${weekStartDate}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setPosts(json.data.posts);
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar cronograma:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar fotos da empresa para associação (Isolamento de Tenants)
  const fetchPhotos = async () => {
    if (!activeCompany) return;
    try {
      const res = await fetch(`/api/photos?companyId=${activeCompany.id}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPhotos(json.data);
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar fotos:", err);
    }
  };

  useEffect(() => {
    fetchSchedule();
    fetchPhotos();
  }, [activeCompany?.id, weekStartDate]);

  const activePost = posts[selectedDayIndex];

  // Métricas do Dashboard Executivo
  const totalCount = posts.length;
  const readyCount = posts.filter(
    (p) => p.status === "ready_canva" || p.status === "ai_generated"
  ).length;
  const queuedCount = posts.filter((p) => p.status === "queued" || p.status === "posted").length;
  const draftCount = posts.filter((p) => !p.status || p.status === "draft").length;

  // Ajustar slide ativo se o número de lâminas diminuir
  useEffect(() => {
    if (activePost && activeSlideNumber > activePost.slideCount) {
      setActiveSlideNumber(activePost.slideCount);
    }
  }, [activePost?.slideCount]);

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
  };

  // Atualizar campo do post ativo
  const handleUpdateActivePost = (field: keyof Post, value: unknown) => {
    if (!activePost) return;
    const updated = [...posts];
    updated[selectedDayIndex] = { ...activePost, [field]: value };
    setPosts(updated);
  };

  // Atualizar slide ativo
  const handleUpdateSlide = (field: keyof PostSlide, value: unknown) => {
    if (!activePost) return;
    const updatedSlides = [...activePost.slides];
    const targetIdx = updatedSlides.findIndex((s) => s.slideNumber === activeSlideNumber);
    if (targetIdx !== -1) {
      updatedSlides[targetIdx] = { ...updatedSlides[targetIdx]!, [field]: value };
      const updated = [...posts];
      updated[selectedDayIndex] = { ...activePost, slides: updatedSlides };
      setPosts(updated);
    }
  };

  // Salvar no backend SQLite
  const handleSave = async () => {
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
          selectedPhotoIds: activePost.selectedPhotoIds || [],
        }),
      });

      const slidesRes = await fetch(`/api/posts/${activePost.id}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: activePost.slides }),
      });

      if (postRes.ok && slidesRes.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: unknown) {
      console.error("Erro ao salvar:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Gerar post e lâminas com IA Generativa Agnóstica
  const handleGenerateWithAI = async () => {
    if (!activePost) return;
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      await fetch(`/api/posts/${activePost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: activePost.theme,
          category: activePost.category,
          slideCount: activePost.slideCount,
          scheduledTime: activePost.scheduledTime || "09:00",
        }),
      });

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
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao gerar post com IA");
      }

      const updatedPost: Post = json.data;
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido na geração";
      setAiError(msg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Copiar legenda para área de transferência
  const handleCopyCaption = async () => {
    if (!activePost?.caption) return;
    try {
      await navigator.clipboard.writeText(activePost.caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar legenda:", err);
    }
  };

  // Enfileirar post ativo no AutoSocial
  const handleEnqueueActivePost = async () => {
    if (!activePost) return;
    setIsEnqueuingPost(true);
    setEnqueueSuccess(false);

    try {
      await handleSave();
      const res = await fetch("/api/export/autosocial/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: activePost.id }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setEnqueueSuccess(true);
        handleUpdateActivePost("status", "queued");
        setTimeout(() => setEnqueueSuccess(false), 4000);
      } else {
        throw new Error(json.error || "Erro ao enfileirar no AutoSocial");
      }
    } catch (err: unknown) {
      console.error("Erro ao enfileirar no AutoSocial:", err);
    } finally {
      setIsEnqueuingPost(false);
    }
  };

  const activeSlide = activePost?.slides.find((s) => s.slideNumber === activeSlideNumber);
  const assignedPhoto = photos.find(
    (p) => p.id === (activeSlide?.assignedPhotoId || activePost?.selectedPhotoIds?.[0])
  );
  const photoUrl = assignedPhoto ? `/uploads/${assignedPhoto.filename}` : undefined;

  return (
    <div className="space-y-6">
      {/* 1. Header do Dashboard Executivo com Navegação Semanal e Métricas */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="h-5 w-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Planejamento Editorial Semanal
            </h2>
            <Badge variant="outline" className="text-xs border-teal-800 text-teal-300">
              Executive Dashboard (Operate Mode)
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitore o pipeline da semana, audite horários de publicação e abra posts no Studio Visual 4:5.
          </p>
        </div>

        {/* Resumo Executivo de Métricas em Tabular-Nums */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Total:</span>
            <span className="font-mono font-bold text-white tabular-nums">{totalCount} posts</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-teal-950/60 border border-teal-800 text-xs flex items-center gap-2">
            <span className="text-teal-300">Prontos:</span>
            <span className="font-mono font-bold text-teal-200 tabular-nums">{readyCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-xs flex items-center gap-2">
            <span className="text-amber-300">Rascunhos:</span>
            <span className="font-mono font-bold text-amber-200 tabular-nums">{draftCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs flex items-center gap-2">
            <span className="text-emerald-300">Na Fila:</span>
            <span className="font-mono font-bold text-emerald-200 tabular-nums">{queuedCount}</span>
          </div>
        </div>

        {/* Navegação de Semana */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Semana Anterior"
              onClick={() => {
                const d = new Date(weekStartDate || Date.now());
                d.setDate(d.getDate() - 7);
                setWeekStartDate(d.toISOString().split("T")[0] || "");
              }}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStartDate(getMonday())}
              className="h-8 text-xs font-mono font-medium border-slate-700 bg-slate-950 text-slate-300 hover:text-white tabular-nums"
            >
              Semana {weekStartDate}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Próxima Semana"
              onClick={() => {
                const d = new Date(weekStartDate || Date.now());
                d.setDate(d.getDate() + 7);
                setWeekStartDate(d.toISOString().split("T")[0] || "");
              }}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenStudio?.(selectedDayIndex)}
            className="w-full sm:w-auto gap-1.5 border-teal-800 bg-teal-950/40 text-teal-300 hover:bg-teal-900 hover:text-white active:scale-95 text-xs font-medium cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Studio Visual (Sem Canva)</span>
          </Button>
        </div>
      </div>

      {/* 2. Grid Executivo dos 7 Dias da Semana com Separação por Horário */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {posts.map((post, idx) => {
          const isSelected = idx === selectedDayIndex;
          const fullDayName = DAY_LABELS[post.dayOfWeek] || post.dayOfWeek;
          const shortDay = DAY_SHORT[post.dayOfWeek] || post.dayOfWeek.substring(0, 3).toUpperCase();
          const scheduledTime = post.scheduledTime || "09:00";
          const slot = getTimeSlotBadge(scheduledTime);

          return (
            <button
              key={post.id}
              type="button"
              onClick={() => {
                setSelectedDayIndex(idx);
                setActiveSlideNumber(1);
              }}
              className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer min-w-0 w-full flex flex-col justify-between gap-2.5 active:scale-95 ${
                isSelected
                  ? "border-teal-500 bg-teal-950/60 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              {/* Topo do Card: Dia & Horário Agendado */}
              <div className="w-full flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">{fullDayName}</span>
                  <Badge variant="outline" className="text-[11px] px-1 py-0 border-slate-700 font-mono">
                    {shortDay}
                  </Badge>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border tabular-nums ${slot.badgeClass}`}
                >
                  {scheduledTime}
                </span>
              </div>

              {/* Tema Central do Post */}
              <div className="w-full">
                <div
                  className="text-xs font-semibold text-slate-200 line-clamp-2 min-h-[32px]"
                  title={post.theme || "Tema a definir"}
                >
                  {post.theme || "Tema a definir"}
                </div>
              </div>

              {/* Indicador SEO (somente leitura): critérios do MATCH cumpridos */}
              {post.caption && (() => {
                const checks = seoChecks({
                  caption: post.caption,
                  altText: post.altText,
                  keywordCluster: parseKeywordCluster(post.keywordCluster),
                });
                const passed = checks.filter((c) => c.ok).length;
                return (
                  <span
                    data-testid={`seo-score-${post.dayOfWeek}`}
                    title={checks.filter((c) => !c.ok).map((c) => c.hint).join("\n") || "SEO completo"}
                    className={`text-[11px] font-mono tabular-nums ${
                      passed === checks.length ? "text-teal-300" : "text-amber-300"
                    }`}
                  >
                    SEO {passed}/{checks.length}
                  </span>
                );
              })()}

              {/* Mini-Carrossel Strip (Visualização Lâminas) */}
              <div className="w-full flex items-center gap-1 py-1">
                {Array.from({ length: Math.min(post.slideCount, 7) }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    className={`h-1.5 flex-1 rounded-full ${
                      sIdx === 0
                        ? "bg-teal-400"
                        : sIdx === post.slideCount - 1
                        ? "bg-emerald-400"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Rodapé do Card: Categoria, Lâminas e Status */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full gap-1">
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 tabular-nums shrink-0 font-mono">
                  {post.slideCount} slides
                </Badge>

                <span
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      post.status === "queued"
                        ? "bg-emerald-400"
                        : post.status === "ready_canva"
                        ? "bg-teal-400"
                        : post.status === "ai_generated"
                        ? "bg-sky-400"
                        : "bg-amber-400"
                    }`}
                  />
                  {post.status === "queued"
                    ? "Na Fila"
                    : post.status === "ready_canva"
                    ? "Pronto"
                    : post.status === "ai_generated"
                    ? "Com IA"
                    : "Rascunho"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Área de Pré-visualização do Post Agendado & Redirecionamento para o Studio */}
      {isLoading || !activePost ? (
        <div className="py-12 text-center text-slate-400">Carregando dados da semana...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda (6 cols): Resumo Executivo do Post Agendado */}
          <div className="lg:col-span-6">
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-5">
              {/* Topo do Card de Resumo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-teal-800 bg-teal-950/40 text-teal-300 font-semibold px-2.5 py-1 text-xs flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-teal-400" />
                      <span>{DAY_LABELS[activePost.dayOfWeek]} · {activePost.scheduledTime || "09:00"}</span>
                    </Badge>
                    <Badge variant="outline" className="text-slate-400 border-slate-800 text-xs font-mono">
                      {getTimePeriod(activePost.scheduledTime || "09:00")}
                    </Badge>
                  </div>

                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activePost.status === "queued"
                          ? "bg-emerald-400"
                          : activePost.status === "ready_canva"
                          ? "bg-teal-400"
                          : activePost.status === "ai_generated"
                          ? "bg-sky-400"
                          : "bg-amber-400"
                      }`}
                    />
                    {activePost.status === "queued"
                      ? "Na Fila do AutoSocial"
                      : activePost.status === "ready_canva"
                      ? "Pronto para Publicar"
                      : activePost.status === "ai_generated"
                      ? "Com IA"
                      : "Rascunho"}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activePost.theme || "Tema a definir"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="text-teal-400 font-medium">{activePost.category}</span>
                    <span>•</span>
                    <span className="font-mono tabular-nums">{activePost.slideCount} lâminas dinâmicas</span>
                  </div>
                </div>
              </div>

              {/* Roteiro Estruturado do Post */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Estrutura de Lâminas (4:5):</span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {activeSlideNumber} de {activePost.slides.length}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                  {activePost.slides.map((s) => {
                    const isSelected = s.slideNumber === activeSlideNumber;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveSlideNumber(s.slideNumber)}
                        className={`p-2 rounded-lg text-xs border flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-teal-950/70 border-teal-600 text-teal-200"
                            : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="truncate">
                          <span className="font-mono font-bold text-slate-400 mr-2">#{s.slideNumber}</span>
                          {s.title || (s.slideNumber === 1 ? "Capa / Gancho" : s.slideNumber === activePost.slideCount ? "CTA" : "Slide")}
                        </span>
                        {s.ctaText && (
                          <Badge variant="outline" className="text-[11px] border-emerald-800 text-emerald-400 shrink-0">
                            CTA
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legenda Resumida */}
              <div className="space-y-1.5 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Legenda Agendada:</span>
                  {activePost.caption && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {activePost.caption.length} caracteres
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-sans">
                  {activePost.caption || "Nenhuma legenda gerada ainda. Abra o Studio Visual para gerar com IA."}
                </p>
              </div>

              {/* REDIRECIONAMENTO DIRETO PARA O STUDIO VISUAL */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (onOpenStudio) {
                      onOpenStudio(selectedDayIndex);
                    } else {
                      setIsStudioOpen(true);
                    }
                  }}
                  className="w-full gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm cursor-pointer active:scale-95 transition-colors shadow-none"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Abrir e Editar no Studio Visual 4:5</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Coluna Direita (6 cols): Preview da Lâmina 4:5 */}
          <div className="lg:col-span-6">
            <Card className="border-slate-800 bg-slate-900">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">Preview da Lâmina</CardTitle>
                  <Badge variant="outline" className="text-xs font-mono tabular-nums">
                    {activeSlideNumber} / {activePost.slideCount}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Simulação do slide na proporção 4:5 (1080×1350)
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 flex flex-col items-center justify-center">
                <div className="w-full max-w-[300px]">
                  <SlidePreview
                    post={activePost}
                    slideNumber={activeSlideNumber}
                    photoUrl={photoUrl}
                    companyName={activeCompany?.name || "Demo Corp"}
                    brandColors={{
                      primary: activeCompany?.primaryColor || "#0D9488",
                      secondary: activeCompany?.secondaryColor || "#EC4899",
                      background: activeCompany?.backgroundColor || "#0F172A",
                      accent: activeCompany?.accentColor || "#10B981",
                    }}
                    instagramHandle={activeCompany?.instagramHandle || "@democorp"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 4. Mockup do Feed do Instagram 3x3 da Semana */}
      <Card className="border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-semibold text-white">
              Visualização Estética do Feed (Grade 3 Colunas)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFeedMockup(!showFeedMockup)}
            className="text-xs text-slate-400 hover:text-white"
          >
            {showFeedMockup ? "Recolher" : "Expandir Grade"}
          </Button>
        </div>

        {showFeedMockup && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
            {posts.map((p, idx) => {
              const coverSlide = p.slides.find((s) => s.slideNumber === 1);
              return (
                <div
                  key={p.id}
                  className="aspect-[4/5] rounded-xl border border-slate-800 bg-slate-950 p-2.5 flex flex-col justify-between text-left relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-teal-400 font-bold uppercase">
                      {DAY_SHORT[p.dayOfWeek] || p.dayOfWeek.substring(0, 3)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {p.scheduledTime || "09:00"}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-200 line-clamp-3 leading-snug">
                    {coverSlide?.title || p.theme}
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    {activeCompany?.instagramHandle || "@democorp"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal Legado Studio OpenDesign (se acionado internamente) */}
      {isStudioOpen && activePost && activeCompany && (
        <DesignStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          postId={activePost.id}
          postTheme={activePost.theme}
          slides={activePost.slides}
          company={activeCompany}
          onRenderedSuccess={() => {
            fetchSchedule();
          }}
        />
      )}
    </div>
  );
}

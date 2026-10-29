import React, { useState, useEffect } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import type { Post, PostSlide } from "@/client/types/schedule";
import type { PhotoAsset } from "@/client/types/photo";
import { SlidePreview } from "./SlidePreview";
import { DesignStudioModal } from "./DesignStudioModal";
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
} from "lucide-react";

const EDITORIAL_CATEGORIES = [
  "Dica Prática",
  "Quebra de Mito",
  "Prova Social",
  "Tutorial",
  "Bastidores",
  "Venda Direta",
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

// Obter a segunda-feira da semana atual em formato YYYY-MM-DD
function getMonday(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0] || "";
}

export function WeekPlanner() {
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

  // Carregar fotos da empresa para associação
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

    // Se aumentou lâminas
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
    const updatedSlides = activePost.slides.map((s) => {
      if (s.slideNumber === activeSlideNumber) {
        return { ...s, [field]: value };
      }
      return s;
    });
    handleUpdateActivePost("slides", updatedSlides);
  };

  // Salvar no backend SQLite
  const handleSave = async () => {
    if (!activePost) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Salvar dados gerais do post (tema, categoria, slideCount)
      const postRes = await fetch(`/api/posts/${activePost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: activePost.theme,
          category: activePost.category,
          slideCount: activePost.slideCount,
          selectedPhotoIds: activePost.selectedPhotoIds || [],
        }),
      });

      // 2. Salvar lâminas
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
      // Salvar primeiro caso o tema tenha sido recém-alterado
      await fetch(`/api/posts/${activePost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: activePost.theme,
          category: activePost.category,
          slideCount: activePost.slideCount,
        }),
      });

      const res = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: activePost.id }),
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
      // Salva post primeiro para persistir textos atuais
      await handleSave();

      const res = await fetch("/api/export/autosocial/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: activePost.id }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao enfileirar no AutoSocial");
      }

      setEnqueueSuccess(true);
      setPosts((prev) =>
        prev.map((p) => (p.id === activePost.id ? { ...p, status: "queued" } : p))
      );
      setTimeout(() => setEnqueueSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no enfileiramento";
      setAiError(msg);
    } finally {
      setIsEnqueuingPost(false);
    }
  };

  // Buscar foto associada ao slide ativo ou capa
  const activeSlide = activePost?.slides.find((s) => s.slideNumber === activeSlideNumber);
  const assignedPhoto = photos.find(
    (p) => p.id === (activeSlide?.assignedPhotoId || activePost?.selectedPhotoIds?.[0])
  );
  const photoUrl = assignedPhoto ? `/uploads/${assignedPhoto.filename}` : null;

  if (!activeCompany) {
    return <div className="text-slate-400 text-center py-10">Nenhuma empresa selecionada.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Semana */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-teal-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Planejamento Editorial Semanal</h3>
            <p className="text-xs text-slate-400 font-mono tabular-nums">Semana de {weekStartDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Semana Anterior"
            onClick={() => {
              const d = new Date(weekStartDate || Date.now());
              d.setDate(d.getDate() - 7);
              setWeekStartDate(d.toISOString().split("T")[0] || "");
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStartDate(getMonday())}
          >
            Semana Atual
          </Button>

          <Button
            variant="outline"
            size="sm"
            aria-label="Próxima Semana"
            onClick={() => {
              const d = new Date(weekStartDate || Date.now());
              d.setDate(d.getDate() + 7);
              setWeekStartDate(d.toISOString().split("T")[0] || "");
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid de Dias da Semana (Segunda a Domingo) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {posts.map((post, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => {
                setSelectedDayIndex(idx);
                setActiveSlideNumber(1);
              }}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                isSelected
                  ? "border-teal-500 bg-teal-950/60 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              <div className="text-sm font-semibold text-slate-200">
                {DAY_LABELS[post.dayOfWeek]?.split("-")[0]}
              </div>
              <div className="text-sm font-bold text-white truncate mt-1">
                {post.theme || "A definir"}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                <Badge variant="outline" className="text-xs px-1.5 py-0 tabular-nums">
                  {post.slideCount} slides
                </Badge>
                <span className="text-xs text-slate-300 truncate max-w-[74px]">
                  {post.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Área de Edição do Post Selecionado + Preview 4:5 (Alinhamento Simétrico items-stretch) */}
      {isLoading || !activePost ? (
        <div className="py-12 text-center text-slate-400">Carregando dados da semana...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Coluna de Configuração e Slides (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <Card className="border-slate-800 bg-slate-900 h-full flex flex-col justify-between">
              <CardHeader className="pb-4 border-b border-slate-800 space-y-3">
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base text-white">
                      Editar Post — {DAY_LABELS[activePost.dayOfWeek]}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Configure a categoria editorial, tema central e a variável dinâmica de lâminas (3 a 10).
                    </CardDescription>
                  </div>

                  {/* Barra de Ações Dedicada (evita esmagamento do título em colunas estreitas) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateWithAI}
                      disabled={isGeneratingAI || !activePost.theme}
                      className="gap-1.5 border-teal-800 bg-teal-950/40 text-teal-200 hover:bg-teal-900/60 hover:text-white"
                      title={!activePost.theme ? "Defina um tema primeiro" : "Gerar slides e legenda com IA"}
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-400" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                          <span>Gerar com IA</span>
                        </>
                      )}
                    </Button>

                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-1.5">
                      {saveSuccess ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Salvo!</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span>{isSaving ? "Salvando..." : "Salvar Post"}</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsStudioOpen(true)}
                      className="gap-1.5 border-teal-700 bg-teal-950/60 text-teal-200 hover:bg-teal-900 hover:text-white"
                      title="Abrir Studio Visual OpenDesign 4:5 Sem Canva"
                    >
                      <Layers className="h-3.5 w-3.5 text-teal-400" />
                      <span>Studio Visual (Sem Canva)</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleEnqueueActivePost}
                      disabled={isEnqueuingPost}
                      className="gap-1.5 border-amber-800 bg-amber-950/30 text-amber-200 hover:bg-amber-900/50 hover:text-white"
                      title="Enviar post para fila do AutoSocial"
                    >
                      {isEnqueuingPost ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                          <span>Enfileirando...</span>
                        </>
                      ) : enqueueSuccess || activePost.status === "queued" ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Enfileirado!</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 text-amber-400" />
                          <span>AutoSocial</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  {aiError && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  {/* 1. Categoria & Tema */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="post-category">Categoria Editorial</Label>
                      <select
                        id="post-category"
                        value={activePost.category}
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
                      <Label htmlFor="post-theme">Tema Central do Post</Label>
                      <Input
                        id="post-theme"
                        value={activePost.theme}
                        onChange={(e) => handleUpdateActivePost("theme", e.target.value)}
                        placeholder="Ex: 5 Hábitos para Dentes Mais Claros"
                      />
                    </div>
                  </div>

                  {/* 2. Seletor Dinâmico de Lâminas (Stepper 3 a 10) */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <Label htmlFor="slide-count-stepper" className="text-sm font-semibold text-white">
                          Quantidade de Lâminas do Carrossel
                        </Label>
                        <p className="text-xs text-slate-400">
                          Variável dinâmica de 3 a 10 slides (Capa + Miolo + CTA)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Diminuir Lâminas"
                          onClick={() => handleSlideCountChange(activePost.slideCount - 1)}
                          disabled={activePost.slideCount <= 3}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>

                        <input
                          id="slide-count-stepper"
                          role="spinbutton"
                          aria-label="Quantidade de Lâminas"
                          type="number"
                          min={3}
                          max={10}
                          value={activePost.slideCount}
                          onChange={(e) => handleSlideCountChange(Number(e.target.value))}
                          className="w-14 text-center h-8 rounded-md border border-slate-700 bg-slate-900 text-sm font-mono font-bold text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Aumentar Lâminas"
                          onClick={() => handleSlideCountChange(activePost.slideCount + 1)}
                          disabled={activePost.slideCount >= 10}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Seleção de Foto Base do Acervo */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-300">Vincular Foto Base da Empresa ao Slide</Label>
                    {photos.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        Nenhuma foto cadastrada no banco. Acesse a aba "Fotos Base" para fazer upload.
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateSlide("assignedPhotoId", null);
                            handleUpdateActivePost("selectedPhotoIds", []);
                          }}
                          className={`h-12 px-3 rounded-lg border flex items-center justify-center text-xs text-slate-300 shrink-0 cursor-pointer ${
                            !assignedPhoto ? "border-teal-500 bg-teal-950/40 text-white" : "border-slate-800"
                          }`}
                        >
                          Sem foto
                        </button>

                        {photos.map((p) => {
                          const isAssigned = (activeSlide?.assignedPhotoId || activePost?.selectedPhotoIds?.[0]) === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handleUpdateSlide("assignedPhotoId", p.id);
                                handleUpdateActivePost("selectedPhotoIds", [p.id]);
                              }}
                              className={`h-12 w-12 rounded-lg overflow-hidden border shrink-0 relative cursor-pointer ${
                                isAssigned ? "border-teal-500 ring-2 ring-teal-500" : "border-slate-800 opacity-70"
                              }`}
                            >
                              <img
                                src={`/uploads/${p.filename}`}
                                alt={p.originalName}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 4. Navegador de Lâminas e Editor de Conteúdo */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                      {activePost.slides.map((s) => {
                        const isSlideActive = s.slideNumber === activeSlideNumber;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveSlideNumber(s.slideNumber)}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                              isSlideActive
                                ? "bg-teal-700 text-white"
                                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                            }`}
                          >
                            {s.slideNumber === 1
                              ? "Slide 1 (Capa)"
                              : s.slideNumber === activePost.slideCount
                              ? `Slide ${s.slideNumber} (CTA)`
                              : `Slide ${s.slideNumber}`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Campos do Slide Ativo */}
                    {activeSlide && (
                      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="space-y-1.5">
                          <Label htmlFor="slide-title">Título / Gancho da Lâmina {activeSlideNumber}</Label>
                          <Input
                            id="slide-title"
                            value={activeSlide.title || ""}
                            onChange={(e) => handleUpdateSlide("title", e.target.value)}
                            placeholder="Título chamativo da lâmina"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="slide-body">Conteúdo Textual (Desenvolvimento)</Label>
                          <textarea
                            id="slide-body"
                            rows={3}
                            value={activeSlide.bodyText || ""}
                            onChange={(e) => handleUpdateSlide("bodyText", e.target.value)}
                            placeholder="Explicação do insight ou passo"
                            className="flex w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
                          />
                        </div>

                        {activeSlideNumber === activePost.slideCount && (
                          <div className="space-y-1.5">
                            <Label htmlFor="slide-cta">Chamada para Ação (CTA Final)</Label>
                            <Input
                              id="slide-cta"
                              value={activeSlide.ctaText || ""}
                              onChange={(e) => handleUpdateSlide("ctaText", e.target.value)}
                              placeholder="Ex: Envie uma mensagem pelo WhatsApp!"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 5. Legenda do Post (Gerada por IA com botão Copiar) */}
                  {activePost.caption && (
                    <div className="space-y-2.5 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="post-caption" className="text-xs font-semibold text-slate-200">
                            Legenda Estruturada do Instagram
                          </Label>
                          <Badge variant="outline" className="text-xs text-teal-300 border-teal-800">
                            {activePost.status === "ai_generated" ? "Gerada com IA" : "Legenda Manual"}
                          </Badge>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyCaption}
                          className="h-7 text-xs gap-1.5 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                        >
                          {copiedCaption ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar Legenda</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <textarea
                        id="post-caption"
                        rows={5}
                        value={activePost.caption}
                        onChange={(e) => handleUpdateActivePost("caption", e.target.value)}
                        placeholder="Legenda para publicação com hashtags e CTA..."
                        className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna do Mockup 4:5 (5 cols — h-full simétrico com Resumo Editorial) */}
          <div className="lg:col-span-5 flex flex-col">
            <Card className="w-full h-full border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Preview Interativo 4:5</span>
                  <Badge variant="outline" className="text-xs text-teal-300 border-teal-800 tabular-nums">
                    Lâmina {activeSlideNumber} de {activePost.slideCount}
                  </Badge>
                </div>

                <SlidePreview
                  post={activePost}
                  slideNumber={activeSlideNumber}
                  photoUrl={photoUrl}
                  brandColors={{
                    primary: activeCompany.primaryColor,
                    secondary: activeCompany.secondaryColor,
                    background: activeCompany.backgroundColor,
                    accent: activeCompany.accentColor,
                  }}
                  companyName={activeCompany.name}
                  instagramHandle={activeCompany.instagramHandle}
                />
              </div>

              {/* Resumo Editorial & Checklist de Publicação (equilibra a altura da coluna direita) */}
              <div className="w-full mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Resumo Técnico do Carrossel</span>
                  <span className="font-mono text-teal-400 tabular-nums">1080×1350px (4:5)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Status Editorial</span>
                    <span className="font-semibold text-white">
                      {activePost.status === "queued"
                        ? "Na Fila AutoSocial"
                        : activePost.status === "ai_generated"
                        ? "Roteiro IA Pronto"
                        : "Em Edição"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Motor de Arte</span>
                    <span className="font-semibold text-teal-300">OpenDesign SVG/PNG</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStudioOpen(true)}
                  className="w-full gap-2 border-teal-800 bg-slate-950 text-teal-200 hover:bg-teal-950 hover:text-white"
                >
                  <Layers className="h-4 w-4 text-teal-400" />
                  <span>Abrir no Studio Visual 4:5 (Sem Canva)</span>
                </Button>
              </div>
            </Card>
          </div>

          <DesignStudioModal
            isOpen={isStudioOpen}
            onClose={() => setIsStudioOpen(false)}
            postId={activePost.id}
            postTheme={activePost.theme}
            slides={activePost.slides || []}
            company={activeCompany}
            onRenderedSuccess={(queued) => {
              if (queued) {
                setEnqueueSuccess(true);
              }
              handleUpdateActivePost("status", queued ? "queued" : "ready_canva");
            }}
          />
        </div>
      )}
    </div>
  );
}

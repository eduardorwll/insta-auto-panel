import React, { useState } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import { SlidePreview } from "./SlidePreview";
import { DesignStudioModal } from "./DesignStudioModal";
import { seoChecks, parseKeywordCluster } from "@/shared/seo-quality";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useWeekSchedule } from "@/client/hooks/useWeekSchedule";

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

function getTimeSlotBadge(timeStr?: string | null): { label: string; badgeClass: string } {
  const period = getTimePeriod(timeStr);
  if (period === "Manhã") {
    return { label: timeStr || "09:00", badgeClass: "bg-amber-950/40 border-amber-800/60 text-amber-300" };
  }
  if (period === "Tarde") {
    return { label: timeStr || "14:00", badgeClass: "bg-sky-950/40 border-sky-800/60 text-sky-300" };
  }
  return { label: timeStr || "19:00", badgeClass: "bg-slate-950 border-slate-700 text-slate-300" };
}

export function WeekPlanner({ onOpenStudio }: { onOpenStudio?: (dayIdx?: number) => void } = {}) {
  const { activeCompany } = useCompany();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const {
    weekStartDate,
    posts,
    selectedDayIndex,
    setSelectedDayIndex,
    activeSlideNumber,
    setActiveSlideNumber,
    isLoading,
    activePost,
    photoUrl,
    metrics,
    navigation,
    fetchSchedule,
  } = useWeekSchedule(activeCompany);

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
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitore o pipeline da semana, audite horários de publicação e abra posts no Studio Visual 4:5.
          </p>
        </div>

        {/* Resumo Executivo de Métricas em Tabular-Nums com Centralização Vertical Óptica */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-7 px-3 pt-[1.5px] rounded-lg bg-slate-950 border border-slate-800 text-xs inline-flex items-center justify-center gap-1.5 leading-none">
            <span className="text-slate-400 leading-none">Total:</span>
            <span className="font-bold text-white tabular-nums leading-none">{metrics.totalCount} posts</span>
          </div>

          <div className="h-7 px-3 pt-[1.5px] rounded-lg bg-teal-950/60 border border-teal-800 text-xs inline-flex items-center justify-center gap-1.5 leading-none">
            <span className="text-teal-300 leading-none">Prontos:</span>
            <span className="font-bold text-teal-200 tabular-nums leading-none">{metrics.readyCount}</span>
          </div>

          <div className="h-7 px-3 pt-[1.5px] rounded-lg bg-amber-950/60 border border-amber-800 text-xs inline-flex items-center justify-center gap-1.5 leading-none">
            <span className="text-amber-300 leading-none">Rascunhos:</span>
            <span className="font-bold text-amber-200 tabular-nums leading-none">{metrics.draftCount}</span>
          </div>

          <div className="h-7 px-3 pt-[1.5px] rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs inline-flex items-center justify-center gap-1.5 leading-none">
            <span className="text-emerald-300 leading-none">Na Fila:</span>
            <span className="font-bold text-emerald-200 tabular-nums leading-none">{metrics.queuedCount}</span>
          </div>
        </div>

        {/* Navegação de Semana Alinhada à Direita */}
        <div className="flex items-center gap-1.5 lg:ml-auto">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Semana Anterior"
            onClick={navigation.prevWeek}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 inline-flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={navigation.currentWeek}
            className="h-8 px-3 pt-[1px] text-xs font-sans font-medium border-slate-700 bg-slate-950 text-slate-300 hover:text-white tabular-nums inline-flex items-center justify-center text-center leading-none cursor-pointer"
          >
            Semana {weekStartDate}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Próxima Semana"
            onClick={navigation.nextWeek}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 inline-flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
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
              {/* Topo do Card: Dia & Horário Agendado com Centralização Vertical */}
              <div className="w-full flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">{fullDayName}</span>
                  <div className="h-5 px-1.5 pt-[1px] rounded border border-slate-700 text-[11px] font-sans font-medium text-slate-300 inline-flex items-center justify-center leading-none">
                    {shortDay}
                  </div>
                </div>
                <div
                  className={`h-5 px-2 pt-[1px] rounded border text-[11px] font-sans font-bold tabular-nums inline-flex items-center justify-center leading-none ${slot.badgeClass}`}
                >
                  {scheduledTime}
                </div>
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
                  <div
                    data-testid={`seo-score-${post.dayOfWeek}`}
                    title={checks.filter((c) => !c.ok).map((c) => c.hint).join("\n") || "SEO completo"}
                    className={`h-5 px-1.5 pt-[1px] rounded border text-[11px] font-sans tabular-nums inline-flex items-center justify-center leading-none ${
                      passed === checks.length
                        ? "text-teal-300 border-teal-800/60 bg-teal-950/40"
                        : "text-amber-300 border-amber-800/60 bg-amber-950/40"
                    }`}
                  >
                    SEO {passed}/{checks.length}
                  </div>
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

              {/* Rodapé do Card: Categoria, Lâminas e Status Centralizados Verticalmente */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full gap-1">
                <div className="h-5 px-1.5 pt-[1px] rounded border border-slate-800 bg-slate-950 text-[11px] font-sans tabular-nums shrink-0 text-slate-300 inline-flex items-center justify-center leading-none">
                  {post.slideCount} slides
                </div>

                <div
                  className="h-5 px-2 pt-[1px] rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-medium inline-flex items-center justify-center leading-none gap-1.5"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      post.status === "queued"
                        ? "bg-emerald-400"
                        : post.status === "ready_canva"
                        ? "bg-teal-400"
                        : post.status === "ai_generated"
                        ? "bg-sky-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <span className="leading-none">
                    {post.status === "queued"
                      ? "Na Fila"
                      : post.status === "ready_canva"
                      ? "Pronto"
                      : post.status === "ai_generated"
                      ? "Com IA"
                      : "Rascunho"}
                  </span>
                </div>
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
              {/* Topo do Card de Resumo com Alinhamento Vertical Perfeito */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 px-3 pt-[1px] rounded-lg border border-teal-800 bg-teal-950/40 text-teal-300 font-semibold text-xs inline-flex items-center justify-center gap-1.5 leading-none">
                      <Clock className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                      <span className="leading-none">{DAY_LABELS[activePost.dayOfWeek]} · {activePost.scheduledTime || "09:00"}</span>
                    </div>
                    <div className="h-7 px-2.5 pt-[1px] rounded-lg border border-slate-800 bg-slate-950 text-slate-300 text-xs font-medium inline-flex items-center justify-center leading-none">
                      {getTimePeriod(activePost.scheduledTime || "09:00")}
                    </div>
                  </div>

                  <div
                    className="h-7 px-2.5 pt-[1px] rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium inline-flex items-center justify-center leading-none gap-1.5"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        activePost.status === "queued"
                          ? "bg-emerald-400"
                          : activePost.status === "ready_canva"
                          ? "bg-teal-400"
                          : activePost.status === "ai_generated"
                          ? "bg-sky-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="leading-none">
                      {activePost.status === "queued"
                        ? "Na Fila do AutoSocial"
                        : activePost.status === "ready_canva"
                        ? "Pronto para Publicar"
                        : activePost.status === "ai_generated"
                        ? "Com IA"
                        : "Rascunho"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activePost.theme || "Tema a definir"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="text-teal-400 font-medium">{activePost.category}</span>
                    <span>•</span>
                    <span className="font-sans tabular-nums">{activePost.slideCount} lâminas dinâmicas</span>
                  </div>
                </div>
              </div>

              {/* Roteiro Estruturado do Post */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Estrutura de Lâminas (4:5):</span>
                  <div className="h-5 px-2 pt-[1px] rounded bg-slate-950 border border-slate-800 text-[11px] font-sans text-slate-400 tabular-nums inline-flex items-center justify-center leading-none">
                    {activeSlideNumber} de {activePost.slides.length}
                  </div>
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
                        <span className="truncate flex items-center">
                          <span className="h-5 px-1.5 pt-[1px] rounded bg-slate-900 border border-slate-800 font-sans font-bold text-slate-300 mr-2 inline-flex items-center justify-center text-center leading-none min-w-[24px]">
                            #{s.slideNumber}
                          </span>
                          <span className="truncate">
                            {s.title || (s.slideNumber === 1 ? "Capa / Gancho" : s.slideNumber === activePost.slideCount ? "CTA" : "Slide")}
                          </span>
                        </span>
                        {s.ctaText && (
                          <div className="h-5 px-1.5 pt-[1px] rounded border border-emerald-800 text-[11px] font-sans text-emerald-400 shrink-0 inline-flex items-center justify-center leading-none">
                            CTA
                          </div>
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
                    <div className="h-5 px-2 pt-[1px] rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-sans tabular-nums inline-flex items-center justify-center leading-none">
                      {activePost.caption.length} caracteres
                    </div>
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
                  <div className="h-6 px-2.5 pt-[1px] rounded-md border border-slate-700 bg-slate-950 text-xs font-semibold font-sans tabular-nums inline-flex items-center justify-center leading-none text-slate-200">
                    {activeSlideNumber} / {activePost.slideCount}
                  </div>
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

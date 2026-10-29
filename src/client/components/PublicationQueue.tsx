import React, { useState, useEffect } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import type { AutoSocialQueueStatus } from "@/client/types/publication";
import type { Post } from "@/client/types/schedule";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import {
  FileSpreadsheet,
  Send,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderSync,
  Layers,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const DAY_LABELS: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

const DEFAULT_STATUS = { label: "Rascunho", color: "bg-slate-800 text-slate-300 border-slate-700" };

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: DEFAULT_STATUS,
  ai_generated: { label: "Gerado com IA", color: "bg-indigo-950/60 text-indigo-400 border-indigo-800" },
  ready_canva: { label: "Pronto Canva", color: "bg-purple-950/60 text-purple-400 border-purple-800" },
  queued: { label: "Enfileirado AutoSocial", color: "bg-amber-950/60 text-amber-400 border-amber-800" },
  posted: { label: "Publicado no Instagram", color: "bg-emerald-950/60 text-emerald-400 border-emerald-800" },
};

function getMonday(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0] || "";
}

export function PublicationQueue() {
  const { activeCompany } = useCompany();
  const [weekStartDate] = useState<string>(getMonday());
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduleId, setScheduleId] = useState<string>("");
  const [queueStatus, setQueueStatus] = useState<AutoSocialQueueStatus>({
    pendingCount: 0,
    publishedCount: 0,
    failedCount: 0,
    pendingFiles: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingCanva, setIsExportingCanva] = useState(false);
  const [isEnqueueingAll, setIsEnqueueingAll] = useState(false);
  const [enqueueingPostId, setEnqueueingPostId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Carregar posts da semana atual
  const fetchSchedule = async () => {
    if (!activeCompany) return;
    try {
      const res = await fetch(
        `/api/schedules?companyId=${activeCompany.id}&weekStartDate=${weekStartDate}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setPosts(json.data.posts);
        const schedId = json.data.schedule?.id || json.data.posts?.[0]?.scheduleId || "";
        setScheduleId(schedId);
      }
    } catch (err) {
      console.error("Erro ao carregar cronograma:", err);
    }
  };

  // Carregar status da fila AutoSocial
  const fetchQueueStatus = async () => {
    if (!activeCompany) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/export/autosocial/status?companyId=${activeCompany.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setQueueStatus(json.data);
      }
    } catch (err) {
      console.error("Erro ao carregar status da fila:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    fetchQueueStatus();
  }, [activeCompany?.id, weekStartDate]);

  // Exportar Canva Bulk Create CSV
  const handleExportCanva = async () => {
    const targetSchedId = scheduleId || posts[0]?.scheduleId || `sched_${activeCompany?.id}_${weekStartDate.replace(/-/g, "")}`;
    if (!activeCompany || !targetSchedId) return;
    setIsExportingCanva(true);
    setMessage(null);

    try {
      const downloadUrl = `/api/export/canva?scheduleId=${targetSchedId}&companyId=${activeCompany.id}`;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.setAttribute("download", `canva_bulk_create_${activeCompany.id}_${weekStartDate}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setMessage({ text: "Arquivo CSV para Canva Bulk Create gerado e baixado com sucesso!", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha na exportação para o Canva";
      setMessage({ text: msg, type: "error" });
    } finally {
      setIsExportingCanva(false);
    }
  };

  // Enfileirar semana completa no AutoSocial
  const handleEnqueueAll = async () => {
    const targetSchedId = scheduleId || posts[0]?.scheduleId || `sched_${activeCompany?.id}_${weekStartDate.replace(/-/g, "")}`;
    if (!targetSchedId) return;
    setIsEnqueueingAll(true);
    setMessage(null);

    try {
      const res = await fetch("/api/export/autosocial/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: targetSchedId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao enfileirar semana no AutoSocial");
      }

      setMessage({
        text: `Semana enfileirada com sucesso! ${json.queuedCount} posts preparados para publicação autônoma.`,
        type: "success",
      });
      fetchSchedule();
      fetchQueueStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enfileirar posts";
      setMessage({ text: msg, type: "error" });
    } finally {
      setIsEnqueueingAll(false);
    }
  };

  // Enfileirar post individual no AutoSocial
  const handleEnqueuePost = async (postId: string) => {
    setEnqueueingPostId(postId);
    setMessage(null);

    try {
      const res = await fetch("/api/export/autosocial/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao enfileirar post");
      }

      setMessage({ text: "Post enfileirado com sucesso na pasta pending/ do AutoSocial!", type: "success" });
      fetchSchedule();
      fetchQueueStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enfileirar post";
      setMessage({ text: msg, type: "error" });
    } finally {
      setEnqueueingPostId(null);
    }
  };

  if (!activeCompany) {
    return <div className="text-slate-400 text-center py-10">Nenhuma empresa selecionada.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessage(null)}
            className="h-6 text-xs text-slate-400 hover:text-white"
          >
            Fechar
          </Button>
        </div>
      )}

      {/* Grid de Ações Principais e Status do AutoSocial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Canva Pro */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4" />
                Canva Pro (Bulk Create)
              </span>
              <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-800/50">
                UTF-8 BOM
              </Badge>
            </div>
            <h3 className="text-base font-bold text-white">Criar em Lote no Canva</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exporte todos os textos, lâminas e cores do Brand Kit em formato CSV compatível com o aplicativo Bulk Create do Canva Pro.
            </p>
          </div>

          <Button
            onClick={handleExportCanva}
            disabled={isExportingCanva}
            className="w-full gap-2 bg-purple-600 hover:bg-purple-500 text-white"
          >
            {isExportingCanva ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Gerando CSV...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                <span>Baixar CSV Canva Pro</span>
              </>
            )}
          </Button>
        </Card>

        {/* Card Fila AutoSocial Status */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FolderSync className="h-4 w-4" />
                Fila AutoSocial
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchQueueStatus}
                disabled={isLoading}
                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                title="Atualizar status"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <h3 className="text-base font-bold text-white">Fila no Sistema de Arquivos</h3>
            <p className="text-xs text-slate-400 font-mono truncate" title={`queue/${activeCompany.id}/instagram/pending/`}>
              📁 queue/{activeCompany.id}/instagram/pending/
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <div className="text-lg font-mono font-bold text-amber-400">{queueStatus.pendingCount}</div>
                <div className="text-[10px] text-slate-400">Pendentes</div>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <div className="text-lg font-mono font-bold text-emerald-400">{queueStatus.publishedCount}</div>
                <div className="text-[10px] text-slate-400">Publicados</div>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <div className="text-lg font-mono font-bold text-rose-400">{queueStatus.failedCount}</div>
                <div className="text-[10px] text-slate-400">Falhas</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Processado pelo motor Katzca/AutoSocial</span>
          </div>
        </Card>

        {/* Card Disparo Autônomo */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Send className="h-4 w-4" />
                Automação Semanal
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-800/50">
                Pronto
              </Badge>
            </div>
            <h3 className="text-base font-bold text-white">Publicação Autônoma</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enfileire todos os posts da semana na pasta de execução do AutoSocial com arquivos sidecar .description e imagens.
            </p>
          </div>

          <Button
            onClick={handleEnqueueAll}
            disabled={isEnqueueingAll || posts.length === 0}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isEnqueueingAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Enfileirando...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Enfileirar Semana Completa</span>
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Tabela de Posts da Semana e Status de Publicação */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Grade Semanal de Publicações (Semana de {weekStartDate})</span>
              </CardTitle>
              <CardDescription>
                Controle de publicação e disparo para a fila do AutoSocial por post.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-800">
            {posts.map((post) => {
              const statusCfg = STATUS_CONFIG[post.status] || DEFAULT_STATUS;
              const isEnqueuing = enqueueingPostId === post.id;

              return (
                <div key={post.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {DAY_LABELS[post.dayOfWeek] || post.dayOfWeek}
                      </span>
                      <Badge variant="outline" className={`text-[10px] border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-800">
                        {post.slideCount} slides
                      </Badge>
                    </div>

                    <h4 className="text-sm font-semibold text-white">
                      {post.theme || "Tema ainda não definido"}
                    </h4>

                    {post.caption ? (
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xl font-mono">
                        {post.caption}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600 italic">
                        Legenda não gerada. Acesse o Calendário para gerar com IA.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnqueuePost(post.id)}
                      disabled={isEnqueuing}
                      className="gap-1.5 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
                    >
                      {isEnqueuing ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Enfileirando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 text-amber-400" />
                          <span>Enfileirar Post</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

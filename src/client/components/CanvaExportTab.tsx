import React, { useState, useEffect } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import type { Post } from "@/client/types/schedule";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";
import {
  FileSpreadsheet,
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

interface CanvaExportTabProps {
  onSwitchToStudio?: () => void;
}

function getMonday(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0] || "";
}

export function CanvaExportTab({ onSwitchToStudio }: CanvaExportTabProps) {
  const { activeCompany } = useCompany();
  const [weekStartDate] = useState<string>(getMonday());
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
          setScheduleId(json.data.schedule?.id || null);
        }
      } catch (err) {
        console.error("Erro ao carregar dados para exportação Canva:", err);
      }
    };
    loadSchedule();
  }, [activeCompany?.id, weekStartDate]);

  const handleDownloadCsv = async () => {
    if (!scheduleId || !activeCompany) {
      setFeedback({
        type: "error",
        text: "Cronograma semanal não localizado para esta empresa.",
      });
      return;
    }

    try {
      setIsExporting(true);
      setFeedback(null);
      const res = await fetch(
        `/api/export/canva?scheduleId=${scheduleId}&companyId=${activeCompany.id}`
      );
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Falha ao gerar CSV para o Canva Pro");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `canva_bulk_create_${activeCompany.id}_${weekStartDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setFeedback({
        type: "success",
        text: "Planilha CSV com UTF-8 BOM baixada com sucesso! Pronta para o Canva Pro Bulk Create.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na exportação";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeCompany) {
    return (
      <div className="py-12 text-center text-slate-400">
        Selecione uma empresa no topo para acessar a exportação Canva Pro.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Transição de Modo */}
      <div className="p-4 rounded-xl border border-sky-800/80 bg-sky-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-900/60 border border-sky-700/80 text-sky-300 shrink-0">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">
                Modo com Canva (Exportação em Lote CSV)
              </h3>
              <Badge variant="outline" className="text-[11px] text-sky-300 border-sky-700">
                Fluxo Manual / Legado
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Exporte todos os roteiros, lâminas e cores do Brand Kit em formato CSV padronizado (RFC 4180 com UTF-8 BOM) para preenchimento em lote no Canva Pro.
            </p>
          </div>
        </div>

        {onSwitchToStudio && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSwitchToStudio}
            className="gap-1.5 border-teal-700 bg-teal-950/60 text-teal-200 hover:bg-teal-900 hover:text-white shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Mudar para Modo Sem Canva</span>
          </Button>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-950/50 border-emerald-800 text-emerald-200"
              : "bg-rose-950/50 border-rose-800 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFeedback(null)}
            className="h-6 text-xs text-slate-400 hover:text-white"
          >
            Fechar
          </Button>
        </div>
      )}

      {/* Grid Principal: Ação de Download + Checklist do Canva */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna de Download e Dados da Semana (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Download className="h-4 w-4 text-sky-400" />
                  <span>Gerador de Planilha CSV para Bulk Create</span>
                </CardTitle>
                <Badge variant="outline" className="text-xs text-slate-300 font-mono tabular-nums">
                  Semana {weekStartDate}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Compatibilidade nativa com Excel, Google Sheets e aplicativo Criar em Lote do Canva Pro.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 block">Canva Template ID da Empresa:</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {activeCompany.canvaTemplateId || "Não configurado (opcional)"}
                  </span>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-xs text-slate-400 block">Total de Posts Prontos:</span>
                  <span className="text-xs font-bold text-teal-400 tabular-nums">
                    {posts.length} carrosséis
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Colunas Incluídas na Planilha:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">id_post</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">dia_semana</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">tema_post</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">categoria</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">total_laminas</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">titulo_lamina_1..10</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">texto_lamina_1..10</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">cor_primaria</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">cor_secundaria</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">legenda_post</span>
                </div>
              </div>

              <Button
                onClick={handleDownloadCsv}
                disabled={isExporting || posts.length === 0}
                className="w-full gap-2 bg-sky-600 hover:bg-sky-500 text-white cursor-pointer h-10 text-sm font-semibold"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processando e Codificando UTF-8 BOM...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Baixar Planilha CSV Canva Pro (Bulk Create)</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna do Passo a Passo Visual do Canva (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Info className="h-4 w-4 text-sky-400" />
              <h4 className="text-sm font-bold text-white">Como Importar no Canva Pro</h4>
            </div>

            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex gap-2.5">
                <span className="h-5 w-5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-bold flex items-center justify-center shrink-0 tabular-nums">
                  1
                </span>
                <span>
                  <strong className="text-white">Baixe o CSV:</strong> Clique no botão de download acima para obter o arquivo formatado.
                </span>
              </li>

              <li className="flex gap-2.5">
                <span className="h-5 w-5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-bold flex items-center justify-center shrink-0 tabular-nums">
                  2
                </span>
                <span>
                  <strong className="text-white">Abra seu Template no Canva:</strong> Acesse seu design 4:5 (1080×1350) no Canva Pro.
                </span>
              </li>

              <li className="flex gap-2.5">
                <span className="h-5 w-5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-bold flex items-center justify-center shrink-0 tabular-nums">
                  3
                </span>
                <span>
                  <strong className="text-white">Aplicativo Criar em Lote:</strong> No menu lateral esquerdo do Canva, selecione <em>Apps</em> &gt; <em>Criar em Lote (Bulk Create)</em> e faça o upload do CSV.
                </span>
              </li>

              <li className="flex gap-2.5">
                <span className="h-5 w-5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-bold flex items-center justify-center shrink-0 tabular-nums">
                  4
                </span>
                <span>
                  <strong className="text-white">Conecte os Campos:</strong> Clique com o botão direito nas caixas de texto do template e escolha <em>Conectar Dados</em> para vincular cada coluna.
                </span>
              </li>

              <li className="flex gap-2.5">
                <span className="h-5 w-5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-bold flex items-center justify-center shrink-0 tabular-nums">
                  5
                </span>
                <span>
                  <strong className="text-white">Exportar Imagens:</strong> Gere as páginas, faça download do arquivo ZIP de PNGs e envie para a pasta de publicação do AutoSocial.
                </span>
              </li>
            </ol>

            <div className="pt-2 border-t border-slate-800">
              <a
                href="https://www.canva.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>Acessar Canva Pro</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

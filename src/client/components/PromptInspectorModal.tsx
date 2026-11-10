import React, { useState, useEffect } from "react";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";
import {
  Eye,
  Sparkles,
  Image as ImageIcon,
  Layers,
  X,
  RefreshCw,
  Send,
  DollarSign,
} from "lucide-react";

export interface PromptInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  companyId?: string;
  slideNumber?: number;
  templateId?: string;
  imageProvider?: string;
  imageModel?: string;
  userImagePrompt?: string;
  headline?: string;
  bodyText?: string;
  ctaText?: string | null;
  onConfirmGenerateText?: (customPrompt: string) => void;
  onConfirmGenerateImage?: (editedImagePrompt: string) => void;
}

interface PreviewPayloadsResponse {
  textPromptPreview: string;
  imageApiPayload: {
    provider: string;
    model: string;
    endpoint: string;
    compiledPrompt: string;
    aspectRatio: string;
    width: number;
    height: number;
    estimatedCostUsd: number;
  };
  openDesignEnginePayload: Record<string, unknown>;
  svgPreview: string;
}

export function PromptInspectorModal({
  isOpen,
  onClose,
  postId,
  companyId,
  slideNumber = 1,
  templateId = "modern-bold",
  imageProvider = "openrouter-image",
  imageModel = "black-forest-labs/flux.2-klein-4b",
  userImagePrompt,
  headline,
  bodyText,
  ctaText,
  onConfirmGenerateText,
  onConfirmGenerateImage,
}: PromptInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "opendesign">("text");
  const [isLoading, setIsLoading] = useState(false);
  const [payloads, setPayloads] = useState<PreviewPayloadsResponse | null>(null);
  const [editableTextPrompt, setEditableTextPrompt] = useState("");
  const [editableImagePrompt, setEditableImagePrompt] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);

    fetch("/api/design/preview-payloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        companyId,
        slideNumber,
        templateId,
        imageProvider,
        imageModel,
        userImagePrompt,
        headline,
        bodyText,
        ctaText,
      }),
    })
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: PreviewPayloadsResponse }) => {
        if (cancelled || !json.success || !json.data) return;
        setPayloads(json.data);
        setEditableTextPrompt(json.data.textPromptPreview);
        setEditableImagePrompt(json.data.imageApiPayload.compiledPrompt);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    postId,
    companyId,
    slideNumber,
    templateId,
    imageProvider,
    imageModel,
    userImagePrompt,
    headline,
    bodyText,
    ctaText,
  ]);

  if (!isOpen) return null;

  return (
    <div
      data-ui="prompt-inspector-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Prompt Inspector — Preview Editável de Prompts e Payloads"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
    >
      <div className="craft-modal-enter w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-teal-400">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Prompt Inspector — Preview Editável antes do Disparo
              </h2>
              <p className="text-[11px] text-slate-400">
                Inspecione e edite os prompts enriquecidos com os dados da empresa ativa (Dry-Run US$ 0,00)
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar Prompt Inspector"
            className="text-slate-400 hover:text-white active:scale-[0.97]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Seletor de Camadas */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-[0.97] ${
              activeTab === "text"
                ? "bg-teal-950/80 text-teal-300 border border-teal-700"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>1. Roteiro & Copy SEO (LLM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-[0.97] ${
              activeTab === "image"
                ? "bg-teal-950/80 text-teal-300 border border-teal-700"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>2. Prompt da API de Imagem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("opendesign")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-[0.97] ${
              activeTab === "opendesign"
                ? "bg-teal-950/80 text-teal-300 border border-teal-700"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>3. Payload Motor OpenDesign</span>
          </button>
        </div>

        {/* Corpo do Inspector */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-4 w-4 animate-spin text-teal-400" />
              <span>Montando payloads reais da empresa (Dry-Run US$ 0,00)...</span>
            </div>
          ) : activeTab === "text" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Prompt Completo de Engenharia (Framework MATCH + Dados do Tenant + Fotos Base)
                </span>
                <Badge variant="outline" className="text-[11px] border-teal-800 text-teal-300 tabular-nums">
                  Custo est.: ~US$ 0,0028
                </Badge>
              </div>
              <textarea
                value={editableTextPrompt}
                onChange={(e) => setEditableTextPrompt(e.target.value)}
                rows={15}
                aria-label="Prompt Editável de Roteiro IA"
                className="w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              {onConfirmGenerateText && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      onConfirmGenerateText(editableTextPrompt);
                      onClose();
                    }}
                    className="gap-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold active:scale-[0.97]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Confirmar & Disparar Roteiro IA</span>
                  </Button>
                </div>
              )}
            </div>
          ) : activeTab === "image" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-slate-300 space-x-2">
                  <span className="font-semibold text-white">
                    Provedor: {payloads?.imageApiPayload.provider}
                  </span>
                  <span>•</span>
                  <span>Modelo: {payloads?.imageApiPayload.model}</span>
                  <span>•</span>
                  <span className="tabular-nums">
                    {payloads?.imageApiPayload.width}×{payloads?.imageApiPayload.height}px ({payloads?.imageApiPayload.aspectRatio})
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] border-amber-800 text-amber-300 tabular-nums gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>
                    US$ {(payloads?.imageApiPayload.estimatedCostUsd ?? 0).toFixed(4)} / imagem
                  </span>
                </Badge>
              </div>
              <textarea
                value={editableImagePrompt}
                onChange={(e) => setEditableImagePrompt(e.target.value)}
                rows={8}
                aria-label="Prompt Editável da API de Imagem"
                className="w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              {onConfirmGenerateImage && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      onConfirmGenerateImage(editableImagePrompt);
                      onClose();
                    }}
                    className="gap-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold active:scale-[0.97]"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Confirmar & Gerar Fundo com Este Prompt</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Payload Estruturado `OpenDesignSlideFields` (Renderização Determinística US$ 0,00)
                </span>
                <Badge variant="outline" className="text-[11px] border-emerald-800 text-emerald-300">
                  Zero Gasto de Tokens
                </Badge>
              </div>
              <textarea
                readOnly
                value={JSON.stringify(payloads?.openDesignEnginePayload ?? {}, null, 2)}
                rows={14}
                aria-label="Payload JSON do Motor OpenDesign"
                className="w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

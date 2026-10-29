import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/client/components/ui/dialog";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { useCompany } from "@/client/context/CompanyContext";
import type { AISettingsFormData, ConnectionTestResult, AIProvider } from "@/client/types/ai";
import {
  Bot,
  CheckCircle,
  AlertCircle,
  Cpu,
  Sparkles,
  RefreshCw,
  Server,
  Key,
} from "lucide-react";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_OPTIONS: {
  value: AIProvider;
  label: string;
  defaultModel: string;
  defaultBaseUrl?: string;
}[] = [
  {
    value: "mlstudio",
    label: "ML Studio API (LM Studio / Local / Azure)",
    defaultModel: "llama-3.1-8b-instruct",
    defaultBaseUrl: "http://localhost:1234/v1",
  },
  {
    value: "gemini",
    label: "Google Gemini (Gemini 2.5 Flash / Pro)",
    defaultModel: "gemini-2.5-flash",
  },
  {
    value: "openai",
    label: "OpenAI (GPT-4o / GPT-4o-mini)",
    defaultModel: "gpt-4o-mini",
  },
  {
    value: "claude",
    label: "Anthropic Claude (Claude 3.5 Sonnet)",
    defaultModel: "claude-3-5-sonnet-latest",
  },
  {
    value: "groq",
    label: "Groq (Llama 3.3 70B Fast)",
    defaultModel: "llama-3.3-70b-versatile",
  },
  {
    value: "ollama",
    label: "Ollama (Local LLMs)",
    defaultModel: "llama3.1",
    defaultBaseUrl: "http://localhost:11434/v1",
  },
  {
    value: "openrouter",
    label: "OpenRouter (Acesso Unificado)",
    defaultModel: "meta-llama/llama-3.1-70b-instruct",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
  },
];

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { activeCompany } = useCompany();
  const [scope, setScope] = useState<"global" | "company">("global");
  const [formData, setFormData] = useState<AISettingsFormData>({
    id: "global",
    provider: "mlstudio",
    apiKey: "",
    modelName: "llama-3.1-8b-instruct",
    baseUrl: "http://localhost:1234/v1",
    temperature: 0.7,
    isActive: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carregar configurações da API
  const fetchSettings = async (targetScope: "global" | "company") => {
    setIsLoading(true);
    setErrorMessage(null);
    setTestResult(null);

    const queryParam =
      targetScope === "company" && activeCompany ? `?companyId=${activeCompany.id}` : "";

    try {
      const res = await fetch(`/api/ai/settings${queryParam}`);
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        setFormData({
          id: targetScope === "company" && activeCompany ? activeCompany.id : "global",
          provider: data.provider || "mlstudio",
          apiKey: data.apiKey || "",
          modelName: data.modelName || "llama-3.1-8b-instruct",
          baseUrl:
            data.baseUrl || (data.provider === "mlstudio" ? "http://localhost:1234/v1" : ""),
          temperature: typeof data.temperature === "number" ? data.temperature : 0.7,
          isActive: data.isActive ?? 1,
        });
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar configurações de IA:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings(scope);
    }
  }, [isOpen, scope, activeCompany?.id]);

  const handleProviderChange = (newProvider: AIProvider) => {
    const option = PROVIDER_OPTIONS.find((opt) => opt.value === newProvider);
    setFormData((prev) => ({
      ...prev,
      provider: newProvider,
      modelName: option?.defaultModel || prev.modelName,
      baseUrl: option?.defaultBaseUrl || "",
    }));
    setTestResult(null);
  };

  const handleScopeChange = (newScope: "global" | "company") => {
    setScope(newScope);
    setFormData((prev) => ({
      ...prev,
      id: newScope === "company" && activeCompany ? activeCompany.id : "global",
    }));
    fetchSettings(newScope);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      setTestResult(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao testar conexão";
      setTestResult({ success: false, message: msg });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const payload = {
        ...formData,
        id: scope === "company" && activeCompany ? activeCompany.id : "global",
        temperature: Number(formData.temperature),
        baseUrl: formData.baseUrl?.trim() || null,
        apiKey: formData.apiKey?.trim() || null,
      };

      const res = await fetch("/api/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao salvar configurações");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 text-slate-100 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Configurações de IA Generativa Agnóstica
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Suporte nativo a ML Studio API, Google Gemini, OpenAI, Claude, Groq e Ollama com Adapter Pattern.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-teal-500" />
            <span className="text-xs">Carregando parâmetros de IA...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 pt-2">
            {/* Seletor de Escopo */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold text-white">Escopo da Configuração</Label>
                <p className="text-xs text-slate-400">
                  {scope === "global"
                    ? "Configuração padrão para todas as empresas sem override próprio."
                    : `Configuração específica e isolada para ${activeCompany?.name || "a empresa atual"}.`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleScopeChange("global")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    scope === "global"
                      ? "bg-teal-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Global
                </button>
                <button
                  type="button"
                  disabled={!activeCompany}
                  onClick={() => handleScopeChange("company")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    scope === "company"
                      ? "bg-teal-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Esta Empresa
                </button>
              </div>
            </div>

            {/* Provedor de IA */}
            <div className="space-y-1.5">
              <Label
                htmlFor="ai-provider"
                className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <Cpu className="h-3.5 w-3.5 text-teal-400" />
                Provedor de Inteligência Artificial
              </Label>
              <select
                id="ai-provider"
                value={formData.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
              >
                {PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Modelo & Base URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ai-model" className="text-xs font-semibold text-slate-200">
                  Nome do Modelo (ID)
                </Label>
                <Input
                  id="ai-model"
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  placeholder="Ex: llama-3.1-8b-instruct"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="ai-baseurl"
                  className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  <Server className="h-3.5 w-3.5 text-slate-400" />
                  Base URL (Endpoint REST / Local)
                </Label>
                <Input
                  id="ai-baseurl"
                  value={formData.baseUrl || ""}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder={
                    formData.provider === "mlstudio"
                      ? "http://localhost:1234/v1"
                      : "Padrão oficial da nuvem"
                  }
                />
              </div>
            </div>

            {/* API Key & Temperatura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="ai-apikey"
                  className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  API Key
                </Label>
                <Input
                  id="ai-apikey"
                  type="password"
                  value={formData.apiKey || ""}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder={
                    formData.provider === "mlstudio"
                      ? "Não obrigatória para LM Studio local"
                      : "sk-..."
                  }
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-temp" className="text-xs font-semibold text-slate-200">
                    Temperatura Criativa
                  </Label>
                  <span className="text-xs font-mono text-teal-400 tabular-nums">
                    {formData.temperature}
                  </span>
                </div>
                <input
                  id="ai-temp"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Status / Teste de Conexão */}
            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                    : "bg-rose-950/40 border-rose-800 text-rose-200"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <div className="space-y-0.5">
                  <p className="font-semibold">
                    {testResult.success
                      ? "Conexão Estabelecida com Sucesso!"
                      : "Falha na Conexão"}
                  </p>
                  <p className="opacity-90">{testResult.message}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="gap-2 border-slate-700 text-slate-300 hover:text-white"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Testando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                      <span>Testar Conexão</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white"
                  >
                    Fechar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="gap-2 bg-teal-600 hover:bg-teal-500 text-white"
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-300" />
                        <span>Salvo!</span>
                      </>
                    ) : (
                      <span>{isSaving ? "Salvando..." : "Salvar Configuração"}</span>
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

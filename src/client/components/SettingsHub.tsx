import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Badge } from "@/client/components/ui/badge";
import { useCompany } from "@/client/context/CompanyContext";
import type { AISettingsFormData, ConnectionTestResult, AIProvider } from "@/client/types/ai";
import {
  Bot,
  Key,
  ShieldCheck,
  Cookie,
  Image as ImageIcon,
  Server,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Terminal,
  Settings,
} from "lucide-react";

interface SettingsHubProps {
  onOpenLegacyAIModal?: () => void;
}

interface CompanySettingsData {
  companyId: string;
  instagramSessionId?: string | null;
  instagramSessionIdMasked?: string | null;
  instagramCsrfToken?: string | null;
  instagramDsUserId?: string | null;
  instagramCookiesJson?: string | null;
  instagramSessionStatus: "unconfigured" | "active" | "expired";
  hasSessionCookie: boolean;
  preferredImageProvider: string;
  imageProviderApiKey?: string | null;
  hasImageApiKey: boolean;
  imageProviderBaseUrl: string;
  autosocialQueuePath: string;
  defaultTemplateId: string;
  profileDir: string;
}

const LLM_PROVIDER_OPTIONS: {
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
    label: "Ollama (Local LLMs :11434)",
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

const IMAGE_PROVIDER_OPTIONS = [
  {
    value: "pollinations",
    label: "Pollinations Flux ($0.00 / Zero-Key Instantâneo)",
  },
  {
    value: "fal-flux",
    label: "Fal.ai FLUX.1 Schnell (~$0.003 / Ultra-Rápido)",
  },
  {
    value: "openrouter-image",
    label: "OpenRouter Image (Chave Unificada)",
  },
  {
    value: "comfyui-local",
    label: "ComfyUI / Krita AI Diffusion Local (localhost:8188)",
  },
  {
    value: "gemini-imagen",
    label: "Google Imagen 3 (Mesma chave Gemini)",
  },
  {
    value: "openai-image",
    label: "OpenAI GPT-Image-1 (Alta Fidelidade)",
  },
];

const TEMPLATE_OPTIONS = [
  { value: "modern-bold", label: "Modern Bold (Editorial Impact)" },
  { value: "editorial-clean", label: "Editorial Clean (Minimalista)" },
  { value: "dark-neon", label: "Dark Obsidian (Alto Contraste)" },
  { value: "split-photo", label: "Split Photo 4:5 (Foto + Card)" },
];

export function SettingsHub({ onOpenLegacyAIModal }: SettingsHubProps) {
  const { activeCompany } = useCompany();

  // 1. Estado de Cookies / Sessão Instagram por Empresa
  const [companySettings, setCompanySettings] = useState<CompanySettingsData | null>(null);
  const [cookiesJsonInput, setCookiesJsonInput] = useState("");
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [csrfTokenInput, setCsrfTokenInput] = useState("");
  const [dsUserIdInput, setDsUserIdInput] = useState("");
  const [isSavingCookies, setIsSavingCookies] = useState(false);
  const [isInitializingProfile, setIsInitializingProfile] = useState(false);
  const [cookieFeedback, setCookieFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 2. Estado de IA de Texto (LLM)
  const [llmScope, setLlmScope] = useState<"global" | "company">("global");
  const [llmForm, setLlmForm] = useState<AISettingsFormData>({
    id: "global",
    provider: "mlstudio",
    apiKey: "",
    modelName: "llama-3.1-8b-instruct",
    baseUrl: "http://localhost:1234/v1",
    temperature: 0.7,
    isActive: 1,
  });
  const [isSavingLlm, setIsSavingLlm] = useState(false);
  const [isTestingLlm, setIsTestingLlm] = useState(false);
  const [llmTestResult, setLlmTestResult] = useState<ConnectionTestResult | null>(null);
  const [llmSavedMsg, setLlmSavedMsg] = useState<string | null>(null);

  // 3. Estado de IA de Imagem + App Geral
  const [preferredImageProvider, setPreferredImageProvider] = useState("pollinations");
  const [imageProviderApiKey, setImageProviderApiKey] = useState("");
  const [imageProviderBaseUrl, setImageProviderBaseUrl] = useState("http://localhost:8188");
  const [defaultTemplateId, setDefaultTemplateId] = useState("modern-bold");
  const [autosocialQueuePath, setAutosocialQueuePath] = useState("data/autosocial/queue");
  const [isSavingApp, setIsSavingApp] = useState(false);
  const [appSavedMsg, setAppSavedMsg] = useState<string | null>(null);

  const loadCompanySettings = async () => {
    if (!activeCompany) return;
    try {
      const res = await fetch(`/api/settings?companyId=${activeCompany.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d: CompanySettingsData = json.data;
        setCompanySettings(d);
        setPreferredImageProvider(d.preferredImageProvider || "pollinations");
        setImageProviderBaseUrl(d.imageProviderBaseUrl || "http://localhost:8188");
        setDefaultTemplateId(d.defaultTemplateId || "modern-bold");
        setAutosocialQueuePath(d.autosocialQueuePath || "data/autosocial/queue");
        setCsrfTokenInput(d.instagramCsrfToken || "");
        setDsUserIdInput(d.instagramDsUserId || "");
      }
    } catch (err) {
      console.error("Erro ao carregar configurações da empresa:", err);
    }
  };

  const loadLlmSettings = async (targetScope: "global" | "company") => {
    const queryParam =
      targetScope === "company" && activeCompany ? `?companyId=${activeCompany.id}` : "";
    try {
      const res = await fetch(`/api/ai/settings${queryParam}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setLlmForm({
          id: targetScope === "company" && activeCompany ? activeCompany.id : "global",
          provider: d.provider || "mlstudio",
          apiKey: d.apiKey || "",
          modelName: d.modelName || "llama-3.1-8b-instruct",
          baseUrl: d.baseUrl || (d.provider === "mlstudio" ? "http://localhost:1234/v1" : ""),
          temperature: typeof d.temperature === "number" ? d.temperature : 0.7,
          isActive: d.isActive ?? 1,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar configurações de LLM:", err);
    }
  };

  useEffect(() => {
    loadCompanySettings();
    loadLlmSettings(llmScope);
  }, [activeCompany?.id, llmScope]);

  const handleSaveInstagramCookies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;

    setIsSavingCookies(true);
    setCookieFeedback(null);

    try {
      const res = await fetch("/api/settings/instagram-cookies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          cookiesJson: cookiesJsonInput.trim() || undefined,
          sessionId: sessionIdInput.trim() || undefined,
          csrfToken: csrfTokenInput.trim() || undefined,
          dsUserId: dsUserIdInput.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao salvar cookies do Instagram");
      }

      setCookieFeedback({
        type: "success",
        text: `Cookies e storageState.json gravados com sucesso em .profiles/${activeCompany.id}/instagram/ (User ID: ${json.dsUserId || "detectado"}).`,
      });
      setSessionIdInput("");
      await loadCompanySettings();
    } catch (err) {
      setCookieFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao salvar cookies",
      });
    } finally {
      setIsSavingCookies(false);
    }
  };

  const handleInitBrowserProfile = async () => {
    if (!activeCompany) return;
    setIsInitializingProfile(true);
    setCookieFeedback(null);

    try {
      const res = await fetch("/api/settings/instagram-browser-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: activeCompany.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao inicializar perfil Chromium");
      }
      setCookieFeedback({
        type: "success",
        text: `Perfil Chromium persistente preparado em ${json.profileDir}`,
      });
      await loadCompanySettings();
    } catch (err) {
      setCookieFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Falha ao criar perfil Chromium",
      });
    } finally {
      setIsInitializingProfile(false);
    }
  };

  const handleSaveLlm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLlm(true);
    setLlmSavedMsg(null);

    try {
      const res = await fetch("/api/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...llmForm,
          id: llmScope === "company" && activeCompany ? activeCompany.id : "global",
          temperature: Number(llmForm.temperature),
          baseUrl: llmForm.baseUrl?.trim() || null,
          apiKey: llmForm.apiKey?.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao salvar LLM");
      }
      setLlmSavedMsg("Configuração de LLM salva com sucesso!");
      setTimeout(() => setLlmSavedMsg(null), 4000);
    } catch (err) {
      setLlmSavedMsg(err instanceof Error ? err.message : "Erro ao salvar LLM");
    } finally {
      setIsSavingLlm(false);
    }
  };

  const handleTestLlm = async () => {
    setIsTestingLlm(true);
    setLlmTestResult(null);
    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(llmForm),
      });
      const json = await res.json();
      setLlmTestResult(json);
    } catch (err) {
      setLlmTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Erro ao testar conexão",
      });
    } finally {
      setIsTestingLlm(false);
    }
  };

  const handleSaveAppConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    setIsSavingApp(true);
    setAppSavedMsg(null);

    try {
      const res = await fetch("/api/settings/app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          preferredImageProvider,
          imageProviderApiKey: imageProviderApiKey.trim() || undefined,
          imageProviderBaseUrl: imageProviderBaseUrl.trim(),
          defaultTemplateId,
          autosocialQueuePath: autosocialQueuePath.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao salvar parâmetros");
      }
      setAppSavedMsg("Preferências de Imagem IA e Aplicação salvas!");
      await loadCompanySettings();
      setTimeout(() => setAppSavedMsg(null), 4000);
    } catch (err) {
      setAppSavedMsg(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setIsSavingApp(false);
    }
  };

  if (!activeCompany) return null;

  const isSessionActive = companySettings?.instagramSessionStatus === "active";

  return (
    <div className="space-y-6" data-testid="settings-hub">
      {/* Banner Superior de Acesso Rápido e Compatibilidade */}
      <Card className="border-slate-800 bg-slate-900">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Settings className="h-5 w-5 text-teal-400" />
              <h3 className="text-lg font-bold text-white">
                Central de Configurações, Chaves de API & Sessões ({activeCompany.name})
              </h3>
              <Badge
                variant={isSessionActive ? "success" : "warning"}
                className="text-xs"
              >
                {isSessionActive ? "Sessão Instagram Ativa" : "Sessão Instagram Pendente"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              IA Generativa Agnóstica com Adapter Pattern, coleta isolada de cookies do Instagram por empresa para o Katzca/AutoSocial e provedores variáveis de imagem 4:5.
            </p>
          </div>

          {onOpenLegacyAIModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenLegacyAIModal}
              className="gap-2 border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800 hover:text-white shrink-0"
            >
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Gerenciar Provedores & Modelos</span>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* COLUNA 1: Coleta de Cookies de Login do Instagram por Empresa (Katzca/AutoSocial) */}
        <Card className="lg:col-span-6 border-slate-800 bg-slate-900 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Cookie className="h-4 w-4 text-amber-400" />
                <span>Sessão & Cookies do Instagram ({activeCompany.instagramHandle})</span>
              </CardTitle>
              <Badge variant={isSessionActive ? "success" : "secondary"} className="text-xs">
                {isSessionActive
                  ? `Cookie Ativo (${companySettings?.instagramSessionIdMasked || "OK"})`
                  : "Não Configurado"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Cole o array JSON de cookies do navegador (Cookie-Editor / EditThisCookie) ou insira o cookie{" "}
              <code className="text-teal-300 font-mono">sessionid</code> para autenticar o worker Playwright em{" "}
              <code className="text-slate-300 font-mono">.profiles/{activeCompany.id}/instagram/</code>.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <form onSubmit={handleSaveInstagramCookies} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ig-cookies-json" className="text-xs font-medium text-slate-200">
                  Colar JSON de Cookies (Array exportado do Navegador / Playwright)
                </Label>
                <textarea
                  id="ig-cookies-json"
                  rows={4}
                  value={cookiesJsonInput}
                  onChange={(e) => setCookiesJsonInput(e.target.value)}
                  placeholder='[{"name": "sessionid", "value": "123456%3A...", "domain": ".instagram.com"}]'
                  className="w-full rounded-md border border-slate-800 bg-slate-950 p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ig-sessionid" className="text-xs font-medium text-slate-300">
                    Cookie sessionid (Direto)
                  </Label>
                  <Input
                    id="ig-sessionid"
                    type="password"
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                    placeholder={companySettings?.instagramSessionIdMasked || "Ex: 654321%3A..."}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ig-csrftoken" className="text-xs font-medium text-slate-300">
                    Cookie csrftoken
                  </Label>
                  <Input
                    id="ig-csrftoken"
                    value={csrfTokenInput}
                    onChange={(e) => setCsrfTokenInput(e.target.value)}
                    placeholder="Opcional (auto-extraído)"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ig-dsuserid" className="text-xs font-medium text-slate-300">
                    Instagram User ID (ds_user_id)
                  </Label>
                  <Input
                    id="ig-dsuserid"
                    value={dsUserIdInput}
                    onChange={(e) => setDsUserIdInput(e.target.value)}
                    placeholder="Ex: 654321"
                    className="h-9 text-xs font-mono tabular-nums"
                  />
                </div>
              </div>

              {cookieFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    cookieFeedback.type === "success"
                      ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                      : "bg-rose-950/40 border-rose-800 text-rose-200"
                  }`}
                >
                  {cookieFeedback.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{cookieFeedback.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isInitializingProfile}
                  onClick={handleInitBrowserProfile}
                  className="gap-1.5 border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
                >
                  <Terminal className="h-3.5 w-3.5 text-teal-400" />
                  <span>
                    {isInitializingProfile
                      ? "Inicializando..."
                      : "Inicializar Perfil Chromium Local"}
                  </span>
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingCookies}
                  className="gap-1.5 bg-teal-600 hover:bg-teal-500 text-white"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {isSavingCookies
                      ? "Gravando Sessão..."
                      : "Validar & Salvar Cookies Instagram"}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* COLUNA 2: Chaves de API & Modelos de Texto (LLM) */}
        <Card className="lg:col-span-6 border-slate-800 bg-slate-900 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-teal-400" />
                <span>Chaves de API & Modelos de Texto (LLM)</span>
              </CardTitle>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLlmScope("global")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    llmScope === "global"
                      ? "bg-teal-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => setLlmScope("company")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    llmScope === "company"
                      ? "bg-teal-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {activeCompany.name}
                </button>
              </div>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Configure o motor que gera os roteiros de 3 a 10 lâminas e legendas com CTA para WhatsApp/Bio.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <form onSubmit={handleSaveLlm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="hub-llm-provider" className="text-xs font-medium text-slate-200">
                    Provedor LLM
                  </Label>
                  <select
                    id="hub-llm-provider"
                    value={llmForm.provider}
                    onChange={(e) => {
                      const next = e.target.value as AIProvider;
                      const opt = LLM_PROVIDER_OPTIONS.find((o) => o.value === next);
                      setLlmForm((prev) => ({
                        ...prev,
                        provider: next,
                        modelName: opt?.defaultModel || prev.modelName,
                        baseUrl: opt?.defaultBaseUrl || "",
                      }));
                    }}
                    className="flex h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100"
                  >
                    {LLM_PROVIDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="hub-llm-model" className="text-xs font-medium text-slate-200">
                    Modelo (Model ID)
                  </Label>
                  <Input
                    id="hub-llm-model"
                    value={llmForm.modelName}
                    onChange={(e) => setLlmForm({ ...llmForm, modelName: e.target.value })}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="hub-llm-apikey" className="text-xs font-medium text-slate-200 flex items-center gap-1">
                    <Key className="h-3.5 w-3.5 text-amber-400" />
                    <span>API Key do Provedor</span>
                  </Label>
                  <Input
                    id="hub-llm-apikey"
                    type="password"
                    value={llmForm.apiKey || ""}
                    onChange={(e) => setLlmForm({ ...llmForm, apiKey: e.target.value })}
                    placeholder={
                      llmForm.provider === "mlstudio"
                        ? "Opcional para LM Studio Local"
                        : "sk-..."
                    }
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="hub-llm-baseurl" className="text-xs font-medium text-slate-200 flex items-center gap-1">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span>Base URL (Endpoint REST)</span>
                  </Label>
                  <Input
                    id="hub-llm-baseurl"
                    value={llmForm.baseUrl || ""}
                    onChange={(e) => setLlmForm({ ...llmForm, baseUrl: e.target.value })}
                    placeholder="http://localhost:1234/v1"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {llmTestResult && (
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    llmTestResult.success
                      ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                      : "bg-rose-950/40 border-rose-800 text-rose-200"
                  }`}
                >
                  {llmTestResult.success ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <span>{llmTestResult.message}</span>
                </div>
              )}

              {llmSavedMsg && (
                <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-800 text-xs text-teal-200 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>{llmSavedMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isTestingLlm}
                  onClick={handleTestLlm}
                  className="gap-1.5 border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTestingLlm ? "animate-spin" : ""}`} />
                  <span>{isTestingLlm ? "Testando..." : "Testar Endpoint LLM"}</span>
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingLlm}
                  className="gap-1.5 bg-teal-600 hover:bg-teal-500 text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isSavingLlm ? "Salvando..." : "Salvar Motor LLM"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 3 & 4: Provedores de Imagem IA (Studio 4:5 Sem Canva) & Parâmetros Gerais */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-teal-400" />
            <span>Motor de Imagem IA Variável (Studio 4:5 Sem Canva) & Fila AutoSocial</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Defina o gerador de imagem padrão da empresa (Pollinations $0.00, Fal.ai FLUX, OpenRouter, ComfyUI/Krita Local :8188) e o caminho da fila local.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <form onSubmit={handleSaveAppConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="app-img-provider" className="text-xs font-medium text-slate-200">
                  Provedor de Imagem IA Padrão
                </Label>
                <select
                  id="app-img-provider"
                  value={preferredImageProvider}
                  onChange={(e) => setPreferredImageProvider(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100"
                >
                  {IMAGE_PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-template-id" className="text-xs font-medium text-slate-200">
                  Template 4:5 Padrão (1080×1350)
                </Label>
                <select
                  id="app-template-id"
                  value={defaultTemplateId}
                  onChange={(e) => setDefaultTemplateId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100"
                >
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-img-baseurl" className="text-xs font-medium text-slate-200">
                  URL ComfyUI / Krita Local
                </Label>
                <Input
                  id="app-img-baseurl"
                  value={imageProviderBaseUrl}
                  onChange={(e) => setImageProviderBaseUrl(e.target.value)}
                  placeholder="http://localhost:8188"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-img-apikey" className="text-xs font-medium text-slate-200">
                  API Key de Imagem (Fal.ai / OpenRouter)
                </Label>
                <Input
                  id="app-img-apikey"
                  type="password"
                  value={imageProviderApiKey}
                  onChange={(e) => setImageProviderApiKey(e.target.value)}
                  placeholder={
                    companySettings?.hasImageApiKey
                      ? "Chave configurada (digite para alterar)"
                      : "Zero-Key para Pollinations / Local"
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="app-queue-path" className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                  <span>Diretório da Fila AutoSocial (pending / posted)</span>
                </Label>
                <Input
                  id="app-queue-path"
                  value={autosocialQueuePath}
                  onChange={(e) => setAutosocialQueuePath(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="text-xs text-slate-400 space-y-0.5">
                  <p className="font-medium text-slate-300">Perfil Persistente da Empresa:</p>
                  <p className="font-mono text-slate-400 truncate max-w-md">
                    {companySettings?.profileDir || `data/autosocial/.profiles/${activeCompany.id}/instagram`}
                  </p>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingApp}
                  className="gap-1.5 bg-teal-600 hover:bg-teal-500 text-white shrink-0"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isSavingApp ? "Salvando..." : "Salvar Preferências do Studio"}</span>
                </Button>
              </div>
            </div>

            {appSavedMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{appSavedMsg}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

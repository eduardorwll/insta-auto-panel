import React, { useState, useEffect } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Badge } from "@/client/components/ui/badge";
import {
  Building2,
  Palette,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  AtSign,
  Briefcase,
  Megaphone,
  Search,
  Hash,
} from "lucide-react";
import type { Company, CompanyFormData } from "@/client/types/company";

/** Converte a empresa ativa no estado do formulário, aplicando os defaults do Brand Kit. */
function companyToFormData(company: Company): CompanyFormData {
  return {
    id: company.id,
    name: company.name,
    instagramHandle: company.instagramHandle,
    niche: company.niche,
    toneOfVoice: company.toneOfVoice,
    primaryColor: company.primaryColor || "#0D9488",
    secondaryColor: company.secondaryColor || "#0284C7",
    backgroundColor: company.backgroundColor || "#0F172A",
    accentColor: company.accentColor || "#10B981",
    whatsappNumber: company.whatsappNumber || "",
    whatsappDefaultMessage: company.whatsappDefaultMessage || "",
    websiteUrl: company.websiteUrl || "",
    canvaTemplateId: company.canvaTemplateId || "",
    seoDisplayName: company.seoDisplayName || "",
    bioText: company.bioText || "",
    targetKeywords: company.targetKeywords || "",
  };
}

const COLOR_PRESETS = [
  { name: "Teal Moderno", primary: "#0D9488", secondary: "#0284C7", bg: "#0F172A", accent: "#10B981" },
  { name: "Obsidian Cyan", primary: "#06B6D4", secondary: "#0EA5E9", bg: "#020617", accent: "#22C55E" },
  { name: "Editorial Âmbar", primary: "#D97706", secondary: "#B45309", bg: "#18181B", accent: "#F59E0B" },
  { name: "Rose Chic", primary: "#E11D48", secondary: "#BE123C", bg: "#1C1917", accent: "#FB7185" },
];

export function CompanyTab() {
  const { activeCompany, updateCompany } = useCompany();

  const [formData, setFormData] = useState<CompanyFormData>({
    id: "",
    name: "",
    instagramHandle: "",
    niche: "",
    toneOfVoice: "",
    primaryColor: "#0D9488",
    secondaryColor: "#0284C7",
    backgroundColor: "#0F172A",
    accentColor: "#10B981",
    whatsappNumber: "",
    whatsappDefaultMessage: "",
    websiteUrl: "",
    canvaTemplateId: "",
    seoDisplayName: "",
    bioText: "",
    targetKeywords: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincronizar dados ao alternar de empresa ou carregar
  useEffect(() => {
    if (activeCompany) {
      setFormData(companyToFormData(activeCompany));
      setErrorMessage(null);
      setSaveSuccess(false);
    }
  }, [activeCompany?.id]);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleApplyPreset = (preset: (typeof COLOR_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.bg,
      accentColor: preset.accent,
    }));
    setSaveSuccess(false);
  };

  const handleReset = () => {
    if (activeCompany) {
      setFormData(companyToFormData(activeCompany));
      setErrorMessage(null);
      setSaveSuccess(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeCompany) return;

    if (!formData.name.trim()) {
      setErrorMessage("O nome da empresa é obrigatório.");
      return;
    }
    if (!formData.instagramHandle.trim()) {
      setErrorMessage("O perfil do Instagram (@arroba) é obrigatório.");
      return;
    }
    if (!formData.niche.trim()) {
      setErrorMessage("O nicho de mercado é obrigatório.");
      return;
    }
    if (!formData.toneOfVoice.trim()) {
      setErrorMessage("O tom de voz editorial é obrigatório.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res = await updateCompany(activeCompany.id, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Erro ao salvar os dados da empresa.");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeCompany) {
    return (
      <div className="p-8 text-center text-slate-400">
        Nenhuma empresa selecionada. Selecione ou cadastre uma empresa no topo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header do Painel da Empresa (Operate Mode) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Dados da Empresa & Brand Kit
            </h2>
            <Badge variant="outline" className="text-xs border-teal-800 text-teal-300 font-mono">
              Tenant: {activeCompany.id}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure o perfil da marca, nicho, tom de voz editorial, paleta visual e canais de conversão da empresa ativa.
          </p>
        </div>

        {/* Ações Rápidas no Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="gap-1.5 border-slate-700 bg-slate-950 text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-colors text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Descartar</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSaving}
            id="btn-save-company-data-top"
            className="gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer active:scale-95 transition-colors shadow-none"
          >
            {isSaving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="h-3.5 w-3.5 text-slate-950" />
            ) : (
              <Save className="h-3.5 w-3.5 text-slate-950" />
            )}
            <span>{saveSuccess ? "Salvo com Sucesso!" : isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </Button>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {errorMessage && (
        <div role="alert" className="p-3.5 rounded-xl border border-rose-800 bg-rose-950/50 text-rose-200 text-xs flex items-center gap-2">
          <span className="font-bold">Atenção:</span> {errorMessage}
        </div>
      )}

      {saveSuccess && (
        <div role="status" className="p-3.5 rounded-xl border border-teal-800 bg-teal-950/50 text-teal-200 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
          <span>Dados da empresa e Brand Kit atualizados e propagados para todo o sistema!</span>
        </div>
      )}

      {/* Grid Principal: Formulário de Edição (7 cols) + Live Preview da Marca (5 cols) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Campos Editáveis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Identificação & Perfil Editorial */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Label className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-teal-400" />
                <span>1. Identificação & Posicionamento</span>
              </Label>
              <Badge variant="outline" className="text-[11px] text-slate-400 border-slate-700">
                Obrigatórios
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-name" className="text-xs text-slate-300">
                  Nome Fantasia da Empresa *
                </Label>
                <Input
                  id="company-name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: TechCorp Inovações"
                  className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-slug" className="text-xs text-slate-300 flex items-center justify-between">
                  <span>Slug do Tenant (ID)</span>
                  <span className="text-[11px] text-slate-500">Chave Primária</span>
                </Label>
                <Input
                  id="company-slug"
                  value={formData.id}
                  disabled
                  title="O slug identificador é imutável após a criação para proteger a integridade dos dados e filas"
                  className="bg-slate-950/60 text-slate-400 border-slate-800 text-xs h-9 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-instagram" className="text-xs text-slate-300 flex items-center gap-1">
                  <AtSign className="h-3.5 w-3.5 text-teal-400" />
                  <span>Perfil do Instagram (@arroba) *</span>
                </Label>
                <Input
                  id="company-instagram"
                  value={formData.instagramHandle}
                  onChange={(e) => {
                    let val = e.target.value.trim();
                    if (val && !val.startsWith("@")) val = "@" + val;
                    handleChange("instagramHandle", val);
                  }}
                  placeholder="@suaempresa"
                  className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-niche" className="text-xs text-slate-300">
                  Nicho de Mercado / Atuação *
                </Label>
                <Input
                  id="company-niche"
                  value={formData.niche}
                  onChange={(e) => handleChange("niche", e.target.value)}
                  placeholder="Ex: Odontologia Estética, SaaS B2B, Moda"
                  className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-tone-of-voice" className="text-xs text-slate-300 flex items-center gap-1">
                <Megaphone className="h-3.5 w-3.5 text-teal-400" />
                <span>Tom de Voz Editorial da Marca *</span>
              </Label>
              <textarea
                id="company-tone-of-voice"
                rows={2}
                value={formData.toneOfVoice}
                onChange={(e) => handleChange("toneOfVoice", e.target.value)}
                placeholder="Ex: Especialista, humanizado, acolhedor e focado em clareza técnica..."
                className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 font-sans"
                required
              />
              <p className="text-[11px] text-slate-400">
                Este tom de voz guia a geração autônoma de títulos, argumentos e ganchos no módulo de IA.
              </p>
            </div>
          </Card>

          {/* Card 2: Brand Kit Visual (Cores) */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Label className="text-sm font-semibold text-white flex items-center gap-2">
                <Palette className="h-4 w-4 text-teal-400" />
                <span>2. Brand Kit Visual (Cores da Marca)</span>
              </Label>
              <div className="flex items-center gap-1.5">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    title={`Aplicar preset: ${p.name}`}
                    className="p-1 rounded-md border border-slate-800 hover:border-teal-500 bg-slate-950 flex items-center gap-1 cursor-pointer active:scale-95 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accent }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cor Primária */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="company-primary-color" className="text-xs text-slate-300 font-medium">
                    Cor Primária
                  </Label>
                  <span className="text-[11px] text-slate-500">Títulos & Destaques</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="company-primary-color-picker"
                    value={formData.primaryColor || "#0D9488"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="h-8 w-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <Input
                    id="company-primary-color"
                    value={formData.primaryColor || ""}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    placeholder="#0D9488"
                    className="bg-slate-900 text-slate-100 border-slate-700 text-xs h-8 font-mono uppercase tabular-nums"
                  />
                </div>
              </div>

              {/* Cor Secundária */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="company-secondary-color" className="text-xs text-slate-300 font-medium">
                    Cor Secundária
                  </Label>
                  <span className="text-[11px] text-slate-500">Subtítulos & Badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="company-secondary-color-picker"
                    value={formData.secondaryColor || "#0284C7"}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="h-8 w-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <Input
                    id="company-secondary-color"
                    value={formData.secondaryColor || ""}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    placeholder="#0284C7"
                    className="bg-slate-900 text-slate-100 border-slate-700 text-xs h-8 font-mono uppercase tabular-nums"
                  />
                </div>
              </div>

              {/* Cor de Fundo */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="company-background-color" className="text-xs text-slate-300 font-medium">
                    Cor de Fundo (Canvas)
                  </Label>
                  <span className="text-[11px] text-slate-500">Superfície 4:5</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="company-background-color-picker"
                    value={formData.backgroundColor || "#0F172A"}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="h-8 w-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <Input
                    id="company-background-color"
                    value={formData.backgroundColor || ""}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    placeholder="#0F172A"
                    className="bg-slate-900 text-slate-100 border-slate-700 text-xs h-8 font-mono uppercase tabular-nums"
                  />
                </div>
              </div>

              {/* Cor de Destaque / Accent */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="company-accent-color" className="text-xs text-slate-300 font-medium">
                    Cor de Destaque (Accent)
                  </Label>
                  <span className="text-[11px] text-slate-500">CTAs & Conversão</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="company-accent-color-picker"
                    value={formData.accentColor || "#10B981"}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="h-8 w-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <Input
                    id="company-accent-color"
                    value={formData.accentColor || ""}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    placeholder="#10B981"
                    className="bg-slate-900 text-slate-100 border-slate-700 text-xs h-8 font-mono uppercase tabular-nums"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Canais de Conversão & Links */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Label className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-teal-400" />
                <span>3. Canais de Conversão & Links Externos</span>
              </Label>
              <Badge variant="outline" className="text-[11px] text-slate-400 border-slate-700">
                Opcional
              </Badge>
            </div>

            {/* Dica de boas práticas de Instagram (Links não clicáveis em legendas) */}
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-slate-200">Boas Práticas de Conversão no Instagram:</span> Links no corpo da legenda não são clicáveis. Estes canais e mensagens são utilizados pela IA <strong className="text-teal-300 font-medium">exclusivamente para redigir os CTAs</strong> da última lâmina e da legenda (ex.: <em>"Marque uma consulta pelo direct ou nos canais do link na bio!"</em>), evitando URLs cruas inoperantes.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-whatsapp" className="text-xs text-slate-300">
                  WhatsApp Comercial (DDI + DDD + Número)
                </Label>
                <Input
                  id="company-whatsapp"
                  value={formData.whatsappNumber || ""}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  placeholder="5511999998888"
                  className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9 font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-website" className="text-xs text-slate-300 flex items-center justify-between">
                  <span>Website Oficial / Link na Bio</span>
                  {formData.websiteUrl && (
                    <a
                      href={formData.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-teal-400 hover:underline flex items-center gap-0.5"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Testar
                    </a>
                  )}
                </Label>
                <Input
                  id="company-website"
                  value={formData.websiteUrl || ""}
                  onChange={(e) => handleChange("websiteUrl", e.target.value)}
                  placeholder="https://suaempresa.com.br"
                  className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-whatsapp-msg" className="text-xs text-slate-300">
                Mensagem Padrão de WhatsApp para CTAs
              </Label>
              <Input
                id="company-whatsapp-msg"
                value={formData.whatsappDefaultMessage || ""}
                onChange={(e) => handleChange("whatsappDefaultMessage", e.target.value)}
                placeholder="Ex: Olá! Vi o post no Instagram e gostaria de saber mais."
                className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9"
              />
              <p className="text-[11px] text-slate-400">
                A IA usa este texto para orientar o gancho e o objetivo da chamada de ação no post e na legenda.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-canva-id" className="text-xs text-slate-300 flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-sky-400" />
                <span>Canva Template ID (Bulk Create CSV)</span>
              </Label>
              <Input
                id="company-canva-id"
                value={formData.canvaTemplateId || ""}
                onChange={(e) => handleChange("canvaTemplateId", e.target.value)}
                placeholder="CANVA-CORP-4X5-V1"
                className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9 font-mono uppercase"
              />
            </div>
          </Card>

          {/* Card 4: Instagram SEO & Otimização do Perfil (Framework MATCH) */}
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Label className="text-sm font-semibold text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-teal-400" />
                <span>4. Instagram SEO & Perfil de Busca (Framework MATCH)</span>
              </Label>
              <Badge variant="outline" className="text-[11px] text-teal-300 border-teal-800">
                SEO 2026
              </Badge>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-slate-200">Instagram é um Motor de Busca:</span> O algoritmo prioriza palavras-chave no <strong>Name Field</strong>, <strong>Bio</strong> e <strong>Legendas</strong> (hashtags foram despriorizadas para 3-5 rótulos). Estes parâmetros ancoram todas as criações da IA em clusters de busca reais.
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-seo-display-name" className="text-xs text-slate-300 flex items-center justify-between">
                <span>Display Name SEO (Nome de Exibição no Perfil)</span>
                <span className="text-[11px] text-teal-400 font-medium">Peso Máximo na Busca</span>
              </Label>
              <Input
                id="company-seo-display-name"
                value={formData.seoDisplayName || ""}
                onChange={(e) => handleChange("seoDisplayName", e.target.value)}
                placeholder="Ex: Dental Pro | Odontologia e Estética"
                className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9"
              />
              <p className="text-[11px] text-slate-400">
                Formato ideal: "Nome da Marca | Nicho / Especialidade". É a superfície com maior peso de ranqueamento no Instagram.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-target-keywords" className="text-xs text-slate-300 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-teal-400" />
                <span>Cluster de Palavras-Chave Prioritárias (separadas por vírgula)</span>
              </Label>
              <Input
                id="company-target-keywords"
                value={formData.targetKeywords || ""}
                onChange={(e) => handleChange("targetKeywords", e.target.value)}
                placeholder="Ex: clareamento dental, facetas em resina, implante sem dor"
                className="bg-slate-950 text-slate-100 border-slate-700 text-xs h-9"
              />
              <p className="text-[11px] text-slate-400">
                A IA distribui este cluster naturalmente no texto da legenda (150-300 palavras) e na capa para Computer Vision.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-bio-text" className="text-xs text-slate-300">
                Bio Indexável do Perfil (Nicho + Oferta + Localização + CTA)
              </Label>
              <textarea
                id="company-bio-text"
                rows={3}
                value={formData.bioText || ""}
                onChange={(e) => handleChange("bioText", e.target.value)}
                placeholder="Ex: Odontologia Estética de Alta Performance&#10;Transformamos sorrisos com tecnologia e precisão&#10;São Paulo - SP&#10;Agende sua avaliação no link:"
                className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-md p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Indexada pelo Instagram e buscadores externos (Google/Bing). Alimenta a contextualização de tom da IA.
              </p>
            </div>
          </Card>

          {/* Botão de Salvar Rodapé */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              id="btn-save-company-data"
              className="w-full gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm cursor-pointer active:scale-95 transition-colors shadow-none"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle className="h-4 w-4 text-slate-950" />
              ) : (
                <Save className="h-4 w-4 text-slate-950" />
              )}
              <span>{saveSuccess ? "Salvo com Sucesso!" : isSaving ? "Salvando..." : "Salvar Dados da Empresa"}</span>
            </Button>
          </div>
        </div>

        {/* Coluna Direita: Live Brand Kit Preview & Resumo da Identidade (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Label className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span>Live Brand Kit Preview</span>
              </Label>
              <Badge variant="outline" className="text-[11px] text-teal-300 border-teal-800 font-mono">
                Visualização Real
              </Badge>
            </div>

            {/* Mock Card da Identidade Visual Composta */}
            <div
              className="p-5 rounded-2xl border transition-colors relative overflow-hidden"
              style={{
                backgroundColor: formData.backgroundColor || "#0F172A",
                borderColor: formData.primaryColor || "#0D9488",
              }}
            >
              {/* Header do Card Preview */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ backgroundColor: formData.primaryColor || "#0D9488" }}
                  >
                    {formData.name.charAt(0) || "E"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {formData.name || "Nome da Empresa"}
                    </h3>
                    <div
                      className="text-xs font-mono font-medium truncate"
                      style={{ color: formData.secondaryColor || "#0284C7" }}
                    >
                      {formData.instagramHandle || "@arroba"}
                    </div>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="text-[11px] shrink-0 border-white/20 text-white font-sans"
                >
                  {formData.niche || "Nicho"}
                </Badge>
              </div>

              {/* Linha Divisória com Cor Secundária */}
              <div
                className="h-0.5 w-full my-4 rounded-full"
                style={{ backgroundColor: formData.secondaryColor || "#0284C7", opacity: 0.3 }}
              />

              {/* Tom de Voz Preview */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">Tom de Voz Editorial:</div>
                <p className="text-xs text-slate-200 line-clamp-2 italic">
                  &ldquo;{formData.toneOfVoice || "Defina o tom de voz editorial da marca para orientar a IA..."}&rdquo;
                </p>
              </div>

              {/* Botão de Chamada com Cor de Destaque & WhatsApp */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {formData.whatsappNumber ? (
                    <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{formData.whatsappNumber}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">WhatsApp não configurado</span>
                  )}
                </div>
                <span
                  className="px-3 py-1 rounded-md text-xs font-bold text-slate-950 inline-flex items-center gap-1.5"
                  style={{ backgroundColor: formData.accentColor || "#10B981" }}
                >
                  <MessageCircle className="h-3.5 w-3.5 text-slate-950" />
                  <span>Chamar no WhatsApp</span>
                </span>
              </div>
            </div>

            {/* Mostrador de Amostras (Color Swatches) */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-300">Amostras Ativas da Paleta:</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div
                    className="w-full h-7 rounded-lg mb-1.5 border border-white/10"
                    style={{ backgroundColor: formData.primaryColor || "#0D9488" }}
                  />
                  <div className="text-[11px] text-slate-400">Primária</div>
                  <div className="text-[11px] font-mono font-bold text-slate-200 tabular-nums uppercase">
                    {formData.primaryColor || "#0D9488"}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div
                    className="w-full h-7 rounded-lg mb-1.5 border border-white/10"
                    style={{ backgroundColor: formData.secondaryColor || "#0284C7" }}
                  />
                  <div className="text-[11px] text-slate-400">Secundária</div>
                  <div className="text-[11px] font-mono font-bold text-slate-200 tabular-nums uppercase">
                    {formData.secondaryColor || "#0284C7"}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div
                    className="w-full h-7 rounded-lg mb-1.5 border border-white/10"
                    style={{ backgroundColor: formData.backgroundColor || "#0F172A" }}
                  />
                  <div className="text-[11px] text-slate-400">Fundo</div>
                  <div className="text-[11px] font-mono font-bold text-slate-200 tabular-nums uppercase">
                    {formData.backgroundColor || "#0F172A"}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div
                    className="w-full h-7 rounded-lg mb-1.5 border border-white/10"
                    style={{ backgroundColor: formData.accentColor || "#10B981" }}
                  />
                  <div className="text-[11px] text-slate-400">Destaque</div>
                  <div className="text-[11px] font-mono font-bold text-slate-200 tabular-nums uppercase">
                    {formData.accentColor || "#10B981"}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo de Conversão & Propagação */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-teal-400" />
                <span>Propagação Automática & Instagram SEO:</span>
              </div>
              <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                <li>O nome e @ são impressos nas lâminas 4:5 do Studio Visual.</li>
                <li>As cores aplicam-se aos 4 templates determinísticos e Canva.</li>
                <li>O WhatsApp e canais subsidiam os CTAs para Direct e link na bio gerados pela IA.</li>
                <li>O Display Name e o cluster de keywords ancoram o ranqueamento de busca no Instagram.</li>
              </ul>
            </div>

            {/* Simulação do Perfil no Instagram (Instagram Search Preview) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-teal-400" />
                  <span>Instagram Search Preview</span>
                </span>
                <Badge variant="outline" className="text-[10px] text-teal-300 border-teal-800">
                  Como o público encontra
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 border border-white/10"
                    style={{ backgroundColor: formData.primaryColor || "#0D9488" }}
                  >
                    {formData.name.charAt(0) || "I"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {formData.seoDisplayName || `${formData.name || "Nome da Empresa"} | ${formData.niche || "Nicho"}`}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {formData.instagramHandle || "@arroba"}
                    </div>
                  </div>
                </div>

                {formData.bioText ? (
                  <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-800">
                    {formData.bioText}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-800">
                    Nenhuma bio indexável configurada. A bio ajuda o algoritmo do Instagram a indexar seu perfil.
                  </p>
                )}

                {formData.targetKeywords && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                    {formData.targetKeywords
                      .split(",")
                      .map((kw) => kw.trim())
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((kw) => (
                        <span
                          key={kw}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-teal-300 border border-teal-900/50"
                        >
                          #{kw}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}

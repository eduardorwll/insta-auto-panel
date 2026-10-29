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
import type { Company, CompanyFormData } from "@/client/types/company";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyToEdit?: Company | null;
}

const defaultForm: CompanyFormData = {
  id: "",
  name: "",
  instagramHandle: "",
  niche: "",
  toneOfVoice: "",
  primaryColor: "#6366F1",
  secondaryColor: "#EC4899",
  backgroundColor: "#0F172A",
  accentColor: "#10B981",
  whatsappNumber: "",
  whatsappDefaultMessage: "",
  websiteUrl: "",
  canvaTemplateId: "",
};

export function CompanyModal({ isOpen, onClose, companyToEdit }: CompanyModalProps) {
  const { createCompany, updateCompany } = useCompany();
  const [formData, setFormData] = useState<CompanyFormData>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (companyToEdit) {
      setFormData({
        id: companyToEdit.id,
        name: companyToEdit.name,
        instagramHandle: companyToEdit.instagramHandle,
        niche: companyToEdit.niche,
        toneOfVoice: companyToEdit.toneOfVoice,
        primaryColor: companyToEdit.primaryColor || "#6366F1",
        secondaryColor: companyToEdit.secondaryColor || "#EC4899",
        backgroundColor: companyToEdit.backgroundColor || "#0F172A",
        accentColor: companyToEdit.accentColor || "#10B981",
        whatsappNumber: companyToEdit.whatsappNumber || "",
        whatsappDefaultMessage: companyToEdit.whatsappDefaultMessage || "",
        websiteUrl: companyToEdit.websiteUrl || "",
        canvaTemplateId: companyToEdit.canvaTemplateId || "",
      });
    } else {
      setFormData(defaultForm);
    }
    setFormError(null);
  }, [companyToEdit, isOpen]);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlugAutoFill = (name: string) => {
    if (!companyToEdit) {
      const generatedSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setFormData((prev) => ({ ...prev, name, id: prev.id || generatedSlug }));
    } else {
      handleChange("name", name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("O nome da empresa é obrigatório.");
      return;
    }
    if (!formData.id.trim()) {
      setFormError("O slug identificador é obrigatório.");
      return;
    }
    if (!formData.instagramHandle.trim()) {
      setFormError("O perfil do Instagram (@arroba) é obrigatório.");
      return;
    }
    if (!formData.niche.trim()) {
      setFormError("O nicho de atuação é obrigatório.");
      return;
    }
    if (!formData.toneOfVoice.trim()) {
      setFormError("O tom de voz editorial é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (companyToEdit) {
        const res = await updateCompany(companyToEdit.id, formData);
        if (!res.success) {
          setFormError(res.error || "Erro ao atualizar empresa.");
          return;
        }
      } else {
        const res = await createCompany(formData);
        if (!res.success) {
          setFormError(res.error || "Erro ao cadastrar empresa.");
          return;
        }
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{companyToEdit ? "Editar Empresa" : "Cadastrar Nova Empresa"}</DialogTitle>
          <DialogDescription>
            Configure os dados cadastrais, Brand Kit visual e links de conversão para geração autônoma de conteúdo.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md bg-red-950/50 border border-red-800 p-3 text-sm text-red-200">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Seção 1: Dados Gerais */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dados Principais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-name">Nome Fantasia / Razão Social *</Label>
                <Input
                  id="company-name"
                  value={formData.name}
                  onChange={(e) => handleSlugAutoFill(e.target.value)}
                  placeholder="Ex: Clínica Sorriso"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-slug">Slug do Identificador *</Label>
                <Input
                  id="company-slug"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  placeholder="clinica_sorriso"
                  disabled={!!companyToEdit}
                  required
                />
                <p className="text-[11px] text-slate-500">Mapeado para .profiles e pastas de fila no AutoSocial</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-handle">Instagram (@arroba) *</Label>
                <Input
                  id="company-handle"
                  value={formData.instagramHandle}
                  onChange={(e) => handleChange("instagramHandle", e.target.value)}
                  placeholder="@clinicasorriso"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-niche">Nicho de Mercado *</Label>
                <Input
                  id="company-niche"
                  value={formData.niche}
                  onChange={(e) => handleChange("niche", e.target.value)}
                  placeholder="Odontologia Estética"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-tone">Tom de Voz Editorial *</Label>
              <Input
                id="company-tone"
                value={formData.toneOfVoice}
                onChange={(e) => handleChange("toneOfVoice", e.target.value)}
                placeholder="Ex: Acolhedor, Especialista, Provocativo e Focado em Saúde"
                required
              />
            </div>
          </div>

          {/* Seção 2: Brand Kit (Cores) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Identidade Visual (Brand Kit)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Cor Primária"
                    value={formData.primaryColor || "#6366F1"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                  />
                  <Input
                    value={formData.primaryColor || ""}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="h-8 text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cor Secundária</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Cor Secundária"
                    value={formData.secondaryColor || "#EC4899"}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                  />
                  <Input
                    value={formData.secondaryColor || ""}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="h-8 text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cor de Fundo</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Cor de Fundo"
                    value={formData.backgroundColor || "#0F172A"}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                  />
                  <Input
                    value={formData.backgroundColor || ""}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="h-8 text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cor de Destaque</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Cor de Destaque"
                    value={formData.accentColor || "#10B981"}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                  />
                  <Input
                    value={formData.accentColor || ""}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="h-8 text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Canais de Conversão & Canva */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conversão e Integrações
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-whatsapp">WhatsApp (com DDI/DDD)</Label>
                <Input
                  id="company-whatsapp"
                  value={formData.whatsappNumber || ""}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  placeholder="5511999999999"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-site">Link da Bio / Website</Label>
                <Input
                  id="company-site"
                  value={formData.websiteUrl || ""}
                  onChange={(e) => handleChange("websiteUrl", e.target.value)}
                  placeholder="https://suaempresa.com.br"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-canva-id">Canva Template ID (Bulk Create)</Label>
              <Input
                id="company-canva-id"
                value={formData.canvaTemplateId || ""}
                onChange={(e) => handleChange("canvaTemplateId", e.target.value)}
                placeholder="Ex: DAGF-7281ab (ID do template mestre de carrossel)"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : companyToEdit ? "Salvar Alterações" : "Cadastrar Empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import { CompanyProvider, useCompany } from "@/client/context/CompanyContext";
import { CompanySwitcher } from "@/client/components/CompanySwitcher";
import { CompanyModal } from "@/client/components/CompanyModal";
import { PhotoBank } from "@/client/components/PhotoBank";
import { WeekPlanner } from "@/client/components/WeekPlanner";
import { AISettingsModal } from "@/client/components/AISettingsModal";
import { PublicationQueue } from "@/client/components/PublicationQueue";
import { SettingsHub } from "@/client/components/SettingsHub";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/client/components/ui/tabs";
import {
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Bot,
  ExternalLink,
  MessageCircle,
  Palette,
  Layers,
  PlusCircle,
  Settings,
  Cpu,
  Send,
  X,
} from "lucide-react";

function DashboardContent() {
  const { activeCompany, isLoading } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Topbar Fixa (Operate Mode — Superfície Tonal Plana) */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Social Panel{" "}
                <span className="text-xs bg-teal-950 text-teal-300 border border-teal-800 px-1.5 py-0.5 rounded font-mono">
                  PRO
                </span>
              </h1>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          {/* Company Switcher */}
          <CompanySwitcher />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsArchModalOpen(true)}
            className="gap-1.5 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Abrir Diagrama Único de Arquitetura (Archify)"
          >
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Arquitetura</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAIModalOpen(true)}
            className="gap-2 border-teal-800 bg-teal-950/40 text-teal-200 hover:bg-teal-900/50 hover:text-white"
          >
            <Bot className="h-4 w-4 text-teal-400" />
            <span>Configurar IA</span>
          </Button>

          <Badge variant="outline" className="text-xs border-slate-700 text-slate-300 gap-1.5 hidden sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Bun + SQLite WAL
          </Badge>
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {!activeCompany ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              <Layers className="h-10 w-10 text-teal-400" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-semibold text-white">Nenhuma Empresa Selecionada</h2>
              <p className="text-sm text-slate-400">
                Cadastre sua primeira empresa ou selecione uma conta no menu superior para gerenciar os cronogramas semanais e Brand Kit.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Cadastrar Primeira Empresa
            </Button>
            <CompanyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </div>
        ) : (
          <>
            {/* Resumo da Empresa Ativa & Brand Kit */}
            <Card className="border-slate-800 bg-slate-900">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{activeCompany.name}</h2>
                      <Badge variant="secondary" className="font-mono text-teal-300 border border-teal-900">
                        {activeCompany.instagramHandle}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-slate-300 border-slate-700">
                        {activeCompany.niche}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 max-w-2xl">
                      <span className="text-slate-200 font-medium">Tom de Voz:</span> {activeCompany.toneOfVoice}
                    </p>
                  </div>

                  {/* Visual Brand Kit Swatches */}
                  <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-teal-400" />
                      <span>Brand Kit:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        title={`Primária: ${activeCompany.primaryColor}`}
                        className="h-6 w-6 rounded-md border border-white/15"
                        style={{ backgroundColor: activeCompany.primaryColor || "#0D9488" }}
                      />
                      <div
                        title={`Secundária: ${activeCompany.secondaryColor}`}
                        className="h-6 w-6 rounded-md border border-white/15"
                        style={{ backgroundColor: activeCompany.secondaryColor || "#EC4899" }}
                      />
                      <div
                        title={`Fundo: ${activeCompany.backgroundColor}`}
                        className="h-6 w-6 rounded-md border border-white/15"
                        style={{ backgroundColor: activeCompany.backgroundColor || "#0F172A" }}
                      />
                      <div
                        title={`Destaque: ${activeCompany.accentColor}`}
                        className="h-6 w-6 rounded-md border border-white/15"
                        style={{ backgroundColor: activeCompany.accentColor || "#10B981" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Badges de Links & Conversão */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  {activeCompany.whatsappNumber && (
                    <span className="flex items-center gap-1.5 text-emerald-400 tabular-nums">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {activeCompany.whatsappNumber}
                    </span>
                  )}
                  {activeCompany.websiteUrl && (
                    <a
                      href={activeCompany.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-teal-400 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Bio/Site
                    </a>
                  )}
                  {activeCompany.canvaTemplateId && (
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      Canva ID: {activeCompany.canvaTemplateId}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Módulos do Sistema (Navegação em Abas — Operate Mode) */}
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid grid-cols-1 sm:grid-cols-4 max-w-3xl w-full">
                <TabsTrigger value="calendar" className="gap-2 w-full">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Calendário</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="gap-2 w-full">
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  <span>Fotos Base</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2 w-full">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Configurações & Módulo IA</span>
                </TabsTrigger>
                <TabsTrigger value="queue" className="gap-2 w-full">
                  <Send className="h-4 w-4 shrink-0" />
                  <span>Publicação & Fila</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="mt-4">
                <WeekPlanner />
              </TabsContent>

              <TabsContent value="photos" className="mt-4">
                <PhotoBank />
              </TabsContent>

              <TabsContent value="ai" className="mt-4">
                <SettingsHub onOpenLegacyAIModal={() => setIsAIModalOpen(true)} />
              </TabsContent>

              <TabsContent value="queue" className="mt-4">
                <PublicationQueue />
              </TabsContent>
            </Tabs>

            <AISettingsModal
              isOpen={isAIModalOpen}
              onClose={() => setIsAIModalOpen(false)}
            />
          </>
        )}

        {isArchModalOpen && (
          <div
            data-ui="archify-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Diagrama Único de Arquitetura Archify"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          >
            <div className="craft-modal-enter w-full max-w-7xl h-[88vh] flex flex-col rounded-2xl bg-slate-900 text-slate-100 overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white">
                    Diagrama Único de Arquitetura Interativo (Archify — M1 a M7)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/architecture.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Abrir em Nova Guia</span>
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsArchModalOpen(false)}
                    aria-label="Fechar Diagrama de Arquitetura"
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <iframe
                src="/architecture.html"
                title="Diagrama de Arquitetura Social Panel PRO"
                className="w-full flex-1 border-0 bg-slate-950"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CompanyProvider>
      <DashboardContent />
    </CompanyProvider>
  );
}

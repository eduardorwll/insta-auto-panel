import React, { useState } from "react";
import { CompanyProvider, useCompany } from "@/client/context/CompanyContext";
import { CompanySwitcher } from "@/client/components/CompanySwitcher";
import { CompanyModal } from "@/client/components/CompanyModal";
import { PhotoBank } from "@/client/components/PhotoBank";
import { WeekPlanner } from "@/client/components/WeekPlanner";
import { AISettingsModal } from "@/client/components/AISettingsModal";
import { PublicationQueue } from "@/client/components/PublicationQueue";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
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
} from "lucide-react";

function DashboardContent() {
  const { activeCompany, isLoading } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Topbar Fixa */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Social Panel <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">PRO</span>
              </h1>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          {/* Company Switcher */}
          <CompanySwitcher />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAIModalOpen(true)}
            className="gap-2 border-indigo-500/30 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-950/40 hover:text-white"
          >
            <Bot className="h-4 w-4 text-indigo-400" />
            <span>Configurar IA</span>
          </Button>

          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 gap-1.5 hidden sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Bun + SQLite WAL
          </Badge>
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {!activeCompany ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              <Layers className="h-10 w-10 text-indigo-400" />
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
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{activeCompany.name}</h2>
                      <Badge variant="secondary" className="font-mono text-indigo-400 border border-indigo-900/50">
                        {activeCompany.instagramHandle}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-slate-400 border-slate-700">
                        {activeCompany.niche}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 max-w-2xl">
                      <span className="text-slate-300 font-medium">Tom de Voz:</span> {activeCompany.toneOfVoice}
                    </p>
                  </div>

                  {/* Visual Brand Kit Swatches */}
                  <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Brand Kit:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        title={`Primária: ${activeCompany.primaryColor}`}
                        className="h-6 w-6 rounded-md shadow border border-white/10"
                        style={{ backgroundColor: activeCompany.primaryColor || "#6366F1" }}
                      />
                      <div
                        title={`Secundária: ${activeCompany.secondaryColor}`}
                        className="h-6 w-6 rounded-md shadow border border-white/10"
                        style={{ backgroundColor: activeCompany.secondaryColor || "#EC4899" }}
                      />
                      <div
                        title={`Fundo: ${activeCompany.backgroundColor}`}
                        className="h-6 w-6 rounded-md shadow border border-white/10"
                        style={{ backgroundColor: activeCompany.backgroundColor || "#0F172A" }}
                      />
                      <div
                        title={`Destaque: ${activeCompany.accentColor}`}
                        className="h-6 w-6 rounded-md shadow border border-white/10"
                        style={{ backgroundColor: activeCompany.accentColor || "#10B981" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Badges de Links & Conversão */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  {activeCompany.whatsappNumber && (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {activeCompany.whatsappNumber}
                    </span>
                  )}
                  {activeCompany.websiteUrl && (
                    <a
                      href={activeCompany.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Bio/Site
                    </a>
                  )}
                  {activeCompany.canvaTemplateId && (
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                      Canva ID: {activeCompany.canvaTemplateId}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Módulos do Sistema (Navegação em Abas) */}
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-xl">
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Calendário</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Fotos Base</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                  <Bot className="h-4 w-4" />
                  <span>Módulo IA</span>
                </TabsTrigger>
                <TabsTrigger value="queue" className="gap-2">
                  <Send className="h-4 w-4" />
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
                <Card className="border-slate-800 bg-slate-900/40 p-8 text-center space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-white">IA Generativa Agnóstica com Adapter Pattern</CardTitle>
                    <CardDescription className="max-w-xl mx-auto text-sm text-slate-400">
                      Integração transparente com ML Studio API (LM Studio local/nuvem), Google Gemini, OpenAI, Claude, Groq e Ollama com saídas JSON estruturadas para carrosséis dinâmicos de 3 a 10 lâminas.
                    </CardDescription>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      onClick={() => setIsAIModalOpen(true)}
                      className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Gerenciar Provedores & Modelos</span>
                    </Button>
                  </div>
                </Card>
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

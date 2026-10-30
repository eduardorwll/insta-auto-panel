import React, { useState } from "react";
import { CompanyProvider, useCompany } from "@/client/context/CompanyContext";
import { CompanySwitcher } from "@/client/components/CompanySwitcher";
import { CompanyModal } from "@/client/components/CompanyModal";
import { PhotoBank } from "@/client/components/PhotoBank";
import { WeekPlanner } from "@/client/components/WeekPlanner";
import { DesignStudioTab } from "@/client/components/DesignStudioTab";
import { CanvaExportTab } from "@/client/components/CanvaExportTab";
import { AISettingsModal } from "@/client/components/AISettingsModal";
import { PublicationQueue } from "@/client/components/PublicationQueue";
import { SettingsHub } from "@/client/components/SettingsHub";
import { CompanyTab } from "@/client/components/CompanyTab";
import { SidebarNavigation, NavTabId } from "@/client/components/SidebarNavigation";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Tabs, TabsContent } from "@/client/components/ui/tabs";
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
  Menu,
  FileSpreadsheet,
} from "lucide-react";

function DashboardContent() {
  const { activeCompany, isLoading } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTabId>("calendar");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("insta-panel-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedStudioDay, setSelectedStudioDay] = useState<number>(0);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("insta-panel-sidebar-collapsed", String(next));
      } catch {}
      return next;
    });
  };

  if (isLoading && !activeCompany) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Topbar Fixa (Operate Mode — Superfície Tonal Plana) */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden h-8 w-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-white active:scale-[0.97]"
            title="Abrir navegação lateral"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-teal-400">
              <Sparkles className="h-4 w-4" />
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
          <CompanySwitcher onNavigateToCompanyTab={() => setCurrentTab("company")} />
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

      {/* Layout Principal com Sidebar Lateral Recolhível e Área de Conteúdo */}
      <div className="flex-1 flex min-h-0">
        <SidebarNavigation
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Área Principal */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
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
            {/* Módulos do Sistema (Navegação via Barra Lateral Categorizada — Operate Mode) */}
            <Tabs value={currentTab} onValueChange={(val) => setCurrentTab(val as NavTabId)} className="w-full">
              <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
                <WeekPlanner
                  onOpenStudio={(dayIdx?: number) => {
                    if (dayIdx !== undefined) setSelectedStudioDay(dayIdx);
                    setCurrentTab("studio");
                  }}
                />
              </TabsContent>

              <TabsContent value="studio" className="mt-0 focus-visible:outline-none">
                <DesignStudioTab
                  selectedDayIndex={selectedStudioDay}
                  onSelectDayIndex={setSelectedStudioDay}
                  onSwitchToCanva={() => setCurrentTab("canva")}
                />
              </TabsContent>

              <TabsContent value="canva" className="mt-0 focus-visible:outline-none">
                <CanvaExportTab onSwitchToStudio={() => setCurrentTab("studio")} />
              </TabsContent>

              <TabsContent value="photos" className="mt-0 focus-visible:outline-none">
                <PhotoBank />
              </TabsContent>

              <TabsContent value="queue" className="mt-0 focus-visible:outline-none">
                <PublicationQueue />
              </TabsContent>

              <TabsContent value="ai" className="mt-0 focus-visible:outline-none">
                <SettingsHub onOpenLegacyAIModal={() => setIsAIModalOpen(true)} />
              </TabsContent>

              <TabsContent value="company" className="mt-0 focus-visible:outline-none">
                <CompanyTab />
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

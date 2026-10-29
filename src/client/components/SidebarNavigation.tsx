import React from "react";
import {
  Calendar,
  Layers,
  FileSpreadsheet,
  Image as ImageIcon,
  Send,
  Settings,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
} from "lucide-react";

export type NavTabId = "calendar" | "studio" | "canva" | "photos" | "queue" | "ai";

export interface NavItem {
  id: NavTabId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export interface NavGroup {
  name: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    name: "Criação & Editorial",
    items: [
      {
        id: "calendar",
        label: "Calendário Semanal",
        shortLabel: "Calendário",
        icon: Calendar,
      },
      {
        id: "studio",
        label: "Studio Visual 4:5",
        shortLabel: "Studio",
        icon: Layers,
        badge: "100% IA",
        badgeColor: "bg-teal-950 text-teal-300 border-teal-800",
      },
      {
        id: "canva",
        label: "Exportar Canva Pro",
        shortLabel: "Canva CSV",
        icon: FileSpreadsheet,
        badge: "CSV",
        badgeColor: "bg-sky-950 text-sky-300 border-sky-800",
      },
    ],
  },
  {
    name: "Acervo de Mídia",
    items: [
      {
        id: "photos",
        label: "Fotos Base da Marca",
        shortLabel: "Fotos",
        icon: ImageIcon,
      },
    ],
  },
  {
    name: "Automação Social",
    items: [
      {
        id: "queue",
        label: "Publicação & Fila",
        shortLabel: "Fila",
        icon: Send,
      },
    ],
  },
  {
    name: "Sistema & Ajustes",
    items: [
      {
        id: "ai",
        label: "Configurações & Módulo IA",
        shortLabel: "Ajustes",
        icon: Settings,
      },
    ],
  },
];

interface SidebarNavigationProps {
  currentTab: string;
  onSelectTab: (tabId: NavTabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function SidebarNavigation({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarNavigationProps) {
  const renderNavGroup = (group: NavGroup, isDrawer = false) => {
    const showHeader = !isCollapsed || isDrawer;

    return (
      <div key={group.name} className="space-y-1">
        {showHeader && (
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400">
            {group.name}
          </div>
        )}

        <div className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isDrawer) onCloseMobile();
                }}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 active:scale-[0.98] ${
                  isActive
                    ? "bg-teal-950/60 text-white border border-teal-800/80"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                } ${!showHeader ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-teal-400" : "text-slate-400"
                  }`}
                />

                {showHeader && (
                  <div className="flex-1 flex items-center justify-between text-left truncate min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded font-mono border shrink-0 ${item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          <aside className="relative flex w-72 max-w-[80vw] flex-col bg-slate-950 border-r border-slate-800 p-4 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-sm text-white">Navegação</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                title="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav role="tablist" aria-label="Navegação do Sistema" className="flex-1 space-y-5 overflow-y-auto pr-1">
              {NAV_GROUPS.map((group) => renderNavGroup(group, true))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800 bg-slate-950 transition-[width] duration-200 ease-out select-none shrink-0 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Navigation Groups */}
        <nav role="tablist" aria-label="Navegação Principal" className="flex-1 p-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => renderNavGroup(group, false))}
        </nav>

        {/* Footer: Collapse / Expand Toggle Button */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors duration-150 active:scale-[0.97]"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-slate-300" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 text-slate-300" />
                <span className="truncate">Recolher Barra Lateral</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { Button } from "@/client/components/ui/button";
import { useCompany } from "@/client/context/CompanyContext";
import { CompanyModal } from "./CompanyModal";
import { ChevronsUpDown, Plus, Settings2, Check, Building2 } from "lucide-react";
import type { Company } from "@/client/types/company";

export function CompanySwitcher() {
  const { companies, activeCompany, setActiveCompanyId } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

  const handleOpenCreate = () => {
    setCompanyToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (activeCompany) {
      setCompanyToEdit(activeCompany);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label="Empresa"
            className="w-[240px] justify-between border-slate-700 bg-slate-900/80 hover:bg-slate-800"
          >
            <div className="flex items-center gap-2 truncate">
              {activeCompany ? (
                <>
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activeCompany.primaryColor || "#6366F1" }}
                  />
                  <span className="truncate font-medium text-slate-100">{activeCompany.name}</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Building2 className="h-4 w-4" />
                  <span>Selecionar Empresa</span>
                </div>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[260px] border-slate-800 bg-slate-900" align="start">
          <DropdownMenuLabel>Empresas Cadastradas</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {companies.length === 0 ? (
            <div className="py-2 px-3 text-xs text-slate-500 text-center">Nenhuma empresa encontrada</div>
          ) : (
            companies.map((comp) => {
              const isSelected = activeCompany?.id === comp.id;
              return (
                <DropdownMenuItem
                  key={comp.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => setActiveCompanyId(comp.id)}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: comp.primaryColor || "#6366F1" }}
                    />
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-medium leading-tight truncate">{comp.name}</span>
                      <span className="text-[11px] text-slate-400 leading-tight">{comp.instagramHandle}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-indigo-400 shrink-0 ml-2" />}
                </DropdownMenuItem>
              );
            })
          )}

          <DropdownMenuSeparator />

          {activeCompany && (
            <DropdownMenuItem onClick={handleOpenEdit} className="cursor-pointer gap-2 text-slate-300">
              <Settings2 className="h-4 w-4" />
              <span>Configurar Brand Kit</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleOpenCreate} className="cursor-pointer gap-2 text-indigo-400 font-medium">
            <Plus className="h-4 w-4" />
            <span>Cadastrar Nova Empresa</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyToEdit={companyToEdit}
      />
    </>
  );
}

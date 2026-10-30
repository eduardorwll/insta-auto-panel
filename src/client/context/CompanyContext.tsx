import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Company, CompanyFormData } from "@/client/types/company";

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  setActiveCompanyId: (id: string) => void;
  refreshCompanies: () => Promise<void>;
  createCompany: (data: CompanyFormData) => Promise<{ success: boolean; error?: string }>;
  updateCompany: (id: string, data: Partial<CompanyFormData>) => Promise<{ success: boolean; error?: string }>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("insta_auto_active_company") : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Erro ao carregar empresas");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCompanies(json.data);

        // Se não tiver empresa ativa ou a empresa ativa não existir mais, seleciona a primeira
        const currentActive = json.data.find((c: Company) => c.id === activeCompanyId);
        if (!currentActive && json.data.length > 0) {
          const firstId = json.data[0].id;
          setActiveCompanyIdState(firstId);
          localStorage.setItem("insta_auto_active_company", firstId);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const setActiveCompanyId = (id: string) => {
    setActiveCompanyIdState(id);
    localStorage.setItem("insta_auto_active_company", id);
  };

  const createCompany = async (data: CompanyFormData) => {
    try {
      const sanitized = {
        ...data,
        websiteUrl: data.websiteUrl?.trim() || null,
        whatsappNumber: data.whatsappNumber?.trim() || null,
        whatsappDefaultMessage: data.whatsappDefaultMessage?.trim() || null,
        canvaTemplateId: data.canvaTemplateId?.trim() || null,
      };
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || "Erro ao criar empresa" };
      }
      await fetchCompanies();
      setActiveCompanyId(data.id);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro de conexão";
      return { success: false, error: message };
    }
  };

  const updateCompany = async (id: string, data: Partial<CompanyFormData>) => {
    try {
      const sanitized = {
        ...data,
        websiteUrl: data.websiteUrl !== undefined ? data.websiteUrl?.trim() || null : undefined,
        whatsappNumber: data.whatsappNumber !== undefined ? data.whatsappNumber?.trim() || null : undefined,
        whatsappDefaultMessage:
          data.whatsappDefaultMessage !== undefined ? data.whatsappDefaultMessage?.trim() || null : undefined,
        canvaTemplateId: data.canvaTemplateId !== undefined ? data.canvaTemplateId?.trim() || null : undefined,
      };
      const res = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || "Erro ao atualizar empresa" };
      }
      await fetchCompanies(true);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro de conexão";
      return { success: false, error: message };
    }
  };

  const activeCompany = companies.find((c) => c.id === activeCompanyId) || null;

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        isLoading,
        error,
        setActiveCompanyId,
        refreshCompanies: fetchCompanies,
        createCompany,
        updateCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany deve ser utilizado dentro de um CompanyProvider");
  }
  return context;
}

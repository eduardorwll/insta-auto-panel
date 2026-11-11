import React, { createContext, useContext, useMemo, useState } from "react";
import { getMondayLocal, addDaysLocal } from "@/shared/calendar-dates";

interface WeekContextValue {
  weekStartDate: string;
  setWeekStartDate: (ymd: string) => void;
  prevWeek: () => void;
  nextWeek: () => void;
  currentWeek: () => void;
}

const WeekContext = createContext<WeekContextValue | null>(null);

/** Fonte única de verdade de `weekStartDate`, compartilhada por Planner, Studio e Fila. */
export function WeekProvider({ children }: { children: React.ReactNode }) {
  const [weekStartDate, setWeekStartDate] = useState<string>(getMondayLocal());
  const value = useMemo<WeekContextValue>(
    () => ({
      weekStartDate,
      setWeekStartDate,
      prevWeek: () => setWeekStartDate((w) => addDaysLocal(w, -7)),
      nextWeek: () => setWeekStartDate((w) => addDaysLocal(w, 7)),
      currentWeek: () => setWeekStartDate(getMondayLocal()),
    }),
    [weekStartDate]
  );
  return <WeekContext.Provider value={value}>{children}</WeekContext.Provider>;
}

export function useWeek(): WeekContextValue {
  const ctx = useContext(WeekContext);
  if (!ctx) throw new Error("useWeek deve ser usado dentro de <WeekProvider>");
  return ctx;
}

/**
 * Datas de calendário LOCAIS (YYYY-MM-DD) sem desvio UTC.
 * Por quê: `toISOString()` converte para UTC e deslocava a segunda-feira em
 * fusos negativos (ex.: BRT à noite). Todo cálculo usa componentes locais.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Converte 'YYYY-MM-DD' em Date local ao meio-dia (imune a DST). */
export function parseLocalYmd(ymd: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) throw new Error(`Data inválida (esperado YYYY-MM-DD): ${ymd}`);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
}

export function addDaysLocal(ymd: string, days: number): string {
  const d = parseLocalYmd(ymd);
  d.setDate(d.getDate() + days);
  return formatLocalYmd(d);
}

/** Segunda-feira da semana de referência (local). */
export function getMondayLocal(ref: Date | string = new Date()): string {
  const d = typeof ref === "string" ? parseLocalYmd(ref) : new Date(ref);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return formatLocalYmd(d);
}

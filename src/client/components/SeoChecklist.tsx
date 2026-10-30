import { CheckCircle, AlertCircle } from "lucide-react";
import { seoChecks, parseKeywordCluster } from "@/shared/seo-quality";

interface SeoChecklistProps {
  caption?: string | null;
  altText?: string | null;
  /** JSON serializado vindo do banco ou array já parseado. */
  keywordCluster?: string | string[] | null;
}

/**
 * Checklist compacto do Framework MATCH (Instagram SEO) para a superfície Operate:
 * mostra, em tempo real, quais critérios a legenda/alt text já cumprem e o que ajustar.
 */
export function SeoChecklist({ caption, altText, keywordCluster }: SeoChecklistProps) {
  const checks = seoChecks({
    caption: caption ?? "",
    altText,
    keywordCluster: parseKeywordCluster(keywordCluster),
  });
  const passed = checks.filter((c) => c.ok).length;
  const allOk = passed === checks.length;

  return (
    <div
      data-testid="seo-checklist"
      className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">SEO do Instagram (MATCH)</span>
        <span
          className={`text-xs font-mono tabular-nums ${allOk ? "text-teal-300" : "text-amber-300"}`}
        >
          {passed}/{checks.length}
        </span>
      </div>
      <ul className="space-y-1">
        {checks.map((check) => (
          <li
            key={check.id}
            title={check.ok ? undefined : check.hint}
            className="flex items-start gap-1.5 text-[11px] leading-snug"
          >
            {check.ok ? (
              <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-px text-teal-400" aria-label="ok" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px text-amber-400" aria-label="atenção" />
            )}
            <span className={check.ok ? "text-slate-400" : "text-slate-200"}>
              {check.ok ? check.label : check.hint}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

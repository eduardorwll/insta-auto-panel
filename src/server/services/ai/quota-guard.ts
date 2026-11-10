import { db, sqlite } from "../../db/client";
import { api_usage_rules, api_usage_logs } from "../../db/schema";
import { eq } from "drizzle-orm";

export type ApiOperationType = "text_generation" | "image_generation" | "vision_blueprint";

export interface ApiUsageRuleConfig {
  companyId: string;
  maxRpm: number;
  maxDailyTextRequests: number;
  maxDailyImageRequests: number;
  maxMonthlyBudgetUsd: number;
  maxOutputTokens: number;
  fallbackToSvgWhenExceeded: boolean;
}

export interface ApiUsageSummary {
  companyId: string;
  dailyTextCount: number;
  dailyImageCount: number;
  monthlySpentUsd: number;
  budgetUtilizationPercent: number;
}

const rpmSlidingWindow = new Map<string, number[]>();

function ensureQuotaTablesExist(): void {
  try {
    sqlite.run(`CREATE TABLE IF NOT EXISTS api_usage_rules (
      company_id text PRIMARY KEY NOT NULL,
      max_rpm integer NOT NULL DEFAULT 15,
      max_daily_text_requests integer NOT NULL DEFAULT 100,
      max_daily_image_requests integer NOT NULL DEFAULT 50,
      max_monthly_budget_usd real NOT NULL DEFAULT 10.0,
      max_output_tokens integer NOT NULL DEFAULT 2500,
      fallback_to_svg_when_exceeded integer NOT NULL DEFAULT 1,
      updated_at integer DEFAULT (unixepoch())
    );`);
    sqlite.run(`CREATE TABLE IF NOT EXISTS api_usage_logs (
      id text PRIMARY KEY NOT NULL,
      company_id text NOT NULL,
      operation_type text NOT NULL,
      provider text NOT NULL,
      model_name text NOT NULL,
      prompt_tokens integer NOT NULL DEFAULT 0,
      completion_tokens integer NOT NULL DEFAULT 0,
      estimated_cost_usd real NOT NULL DEFAULT 0,
      created_at integer DEFAULT (unixepoch())
    );`);
  } catch {}
}

export async function getApiUsageRules(companyId: string): Promise<ApiUsageRuleConfig> {
  ensureQuotaTablesExist();
  const [row] = await db
    .select()
    .from(api_usage_rules)
    .where(eq(api_usage_rules.companyId, companyId));

  if (row) {
    return {
      companyId: row.companyId,
      maxRpm: row.maxRpm,
      maxDailyTextRequests: row.maxDailyTextRequests,
      maxDailyImageRequests: row.maxDailyImageRequests,
      maxMonthlyBudgetUsd: row.maxMonthlyBudgetUsd,
      maxOutputTokens: row.maxOutputTokens,
      fallbackToSvgWhenExceeded: Boolean(row.fallbackToSvgWhenExceeded),
    };
  }

  return {
    companyId,
    maxRpm: 15,
    maxDailyTextRequests: 100,
    maxDailyImageRequests: 50,
    maxMonthlyBudgetUsd: 10.0,
    maxOutputTokens: 2500,
    fallbackToSvgWhenExceeded: true,
  };
}

export async function upsertApiUsageRules(
  input: Partial<ApiUsageRuleConfig> & { companyId: string }
): Promise<ApiUsageRuleConfig> {
  ensureQuotaTablesExist();
  const current = await getApiUsageRules(input.companyId);
  const next: ApiUsageRuleConfig = {
    companyId: input.companyId,
    maxRpm: input.maxRpm ?? current.maxRpm,
    maxDailyTextRequests: input.maxDailyTextRequests ?? current.maxDailyTextRequests,
    maxDailyImageRequests: input.maxDailyImageRequests ?? current.maxDailyImageRequests,
    maxMonthlyBudgetUsd: input.maxMonthlyBudgetUsd ?? current.maxMonthlyBudgetUsd,
    maxOutputTokens: input.maxOutputTokens ?? current.maxOutputTokens,
    fallbackToSvgWhenExceeded:
      input.fallbackToSvgWhenExceeded !== undefined
        ? input.fallbackToSvgWhenExceeded
        : current.fallbackToSvgWhenExceeded,
  };

  const [existing] = await db
    .select()
    .from(api_usage_rules)
    .where(eq(api_usage_rules.companyId, input.companyId));

  const dbPayload = {
    companyId: next.companyId,
    maxRpm: next.maxRpm,
    maxDailyTextRequests: next.maxDailyTextRequests,
    maxDailyImageRequests: next.maxDailyImageRequests,
    maxMonthlyBudgetUsd: next.maxMonthlyBudgetUsd,
    maxOutputTokens: next.maxOutputTokens,
    fallbackToSvgWhenExceeded: next.fallbackToSvgWhenExceeded ? 1 : 0,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(api_usage_rules)
      .set(dbPayload)
      .where(eq(api_usage_rules.companyId, input.companyId));
  } else {
    await db.insert(api_usage_rules).values(dbPayload);
  }

  return next;
}

export async function getApiUsageSummary(companyId: string): Promise<ApiUsageSummary> {
  ensureQuotaTablesExist();
  const rules = await getApiUsageRules(companyId);
  const logs = await db
    .select()
    .from(api_usage_logs)
    .where(eq(api_usage_logs.companyId, companyId));

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let dailyTextCount = 0;
  let dailyImageCount = 0;
  let monthlySpentUsd = 0;

  for (const log of logs) {
    const ts = log.createdAt ? new Date(log.createdAt).getTime() : now;
    if (ts >= oneDayAgo) {
      if (log.operationType === "image_generation") {
        dailyImageCount += 1;
      } else {
        dailyTextCount += 1;
      }
    }
    if (ts >= thirtyDaysAgo) {
      monthlySpentUsd += log.estimatedCostUsd || 0;
    }
  }

  const budgetUtilizationPercent =
    rules.maxMonthlyBudgetUsd > 0
      ? Math.min(100, Number(((monthlySpentUsd / rules.maxMonthlyBudgetUsd) * 100).toFixed(1)))
      : 0;

  return {
    companyId,
    dailyTextCount,
    dailyImageCount,
    monthlySpentUsd: Number(monthlySpentUsd.toFixed(4)),
    budgetUtilizationPercent,
  };
}

export async function recordApiUsage(params: {
  companyId: string;
  operationType: ApiOperationType;
  provider: string;
  modelName: string;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCostUsd: number;
}): Promise<void> {
  ensureQuotaTablesExist();
  await db.insert(api_usage_logs).values({
    id: `usage_${params.companyId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    companyId: params.companyId,
    operationType: params.operationType,
    provider: params.provider,
    modelName: params.modelName,
    promptTokens: params.promptTokens ?? 0,
    completionTokens: params.completionTokens ?? 0,
    estimatedCostUsd: params.estimatedCostUsd,
  });
}

export async function enforceApiQuotaAndRateLimit(
  companyId: string,
  operationType: ApiOperationType
): Promise<{
  allowed: boolean;
  reason?: string;
  fallbackToSvg: boolean;
  rules: ApiUsageRuleConfig;
  summary: ApiUsageSummary;
}> {
  const rules = await getApiUsageRules(companyId);
  const summary = await getApiUsageSummary(companyId);

  // 1. Sliding window RPM
  const now = Date.now();
  const timestamps = (rpmSlidingWindow.get(companyId) || []).filter((t) => now - t < 60_000);
  if (timestamps.length >= rules.maxRpm) {
    return {
      allowed: false,
      reason: `Rate-limit de ${rules.maxRpm} requisições/minuto atingido para a empresa ${companyId}.`,
      fallbackToSvg: rules.fallbackToSvgWhenExceeded,
      rules,
      summary,
    };
  }

  // 2. Orçamento Mensal em USD
  if (summary.monthlySpentUsd >= rules.maxMonthlyBudgetUsd) {
    return {
      allowed: false,
      reason: `Teto mensal de orçamento da API (US$ ${rules.maxMonthlyBudgetUsd.toFixed(2)}) atingido.`,
      fallbackToSvg: rules.fallbackToSvgWhenExceeded,
      rules,
      summary,
    };
  }

  // 3. Quota diária por tipo de operação
  if (
    operationType === "image_generation" &&
    summary.dailyImageCount >= rules.maxDailyImageRequests
  ) {
    return {
      allowed: false,
      reason: `Quota diária de imagens (${rules.maxDailyImageRequests}/dia) atingida.`,
      fallbackToSvg: rules.fallbackToSvgWhenExceeded,
      rules,
      summary,
    };
  }

  if (
    operationType !== "image_generation" &&
    summary.dailyTextCount >= rules.maxDailyTextRequests
  ) {
    return {
      allowed: false,
      reason: `Quota diária de gerações de texto (${rules.maxDailyTextRequests}/dia) atingida.`,
      fallbackToSvg: rules.fallbackToSvgWhenExceeded,
      rules,
      summary,
    };
  }

  timestamps.push(now);
  rpmSlidingWindow.set(companyId, timestamps);

  return {
    allowed: true,
    fallbackToSvg: rules.fallbackToSvgWhenExceeded,
    rules,
    summary,
  };
}

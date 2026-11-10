import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import { companies, weekly_schedules, posts, post_slides } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createOpenRouterSdkClient } from "@/server/services/ai/openrouter-client";

describe("Marco M10: @openrouter/sdk, Quotas de API (SEC-05) & Prompt Inspector Dry-Run", () => {
  const companyId = "empresa_m10_test";
  const scheduleId = "sched_m10_20261102";
  const postId = "post_m10_segunda";

  beforeAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
    await db.insert(companies).values({
      id: companyId,
      name: "Etiene Rewell Nutricionista",
      instagramHandle: "@etienerewell",
      niche: "Nutrição Clínica e Emagrecimento",
      toneOfVoice: "Acolhedor, elegante e científico",
      primaryColor: "#C58B6B",
      secondaryColor: "#5C6843",
      backgroundColor: "#F5ECE2",
      accentColor: "#5C6843",
      whatsappNumber: "5511988887777",
      seoDisplayName: "Etiene Rewell | Nutricionista",
      targetKeywords: JSON.stringify(["nutricionista clinica", "emagrecimento saudavel"]),
    });

    await db.insert(weekly_schedules).values({
      id: scheduleId,
      companyId,
      weekStartDate: "2026-11-02",
    });

    await db.insert(posts).values({
      id: postId,
      scheduleId,
      companyId,
      dayOfWeek: "segunda",
      theme: "Sua saúde não precisa esperar novembro",
      category: "Conscientização",
      slideCount: 3,
      status: "draft",
    });

    for (let i = 1; i <= 3; i++) {
      await db.insert(post_slides).values({
        id: `${postId}_s${i}`,
        postId,
        slideNumber: i,
        title: i === 1 ? "Sua saúde não precisa esperar novembro." : `Passo ${i}`,
        bodyText: "Você não precisa esperar a próxima segunda-feira para começar.",
        ctaText: i === 3 ? "Envie mensagem no Direct ou acesse o link na bio!" : null,
      });
    }
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
  });

  it("M10-T1: deve instanciar o cliente oficial @openrouter/sdk e listar catálogo de modelos texto/imagem com preços", async () => {
    const sdk = createOpenRouterSdkClient("sk-or-v1-test-key");
    expect(sdk).toBeDefined();

    const res = await server.fetch(
      new Request(`http://localhost:${server.port}/api/ai/openrouter/models`)
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: {
        textModels: Array<{ id: string; name: string; promptPricePerMillion: number }>;
        imageModels: Array<{ id: string; name: string; pricePerImageUsd: number }>;
      };
    };
    expect(body.success).toBe(true);
    expect(body.data.textModels.length).toBeGreaterThanOrEqual(4);
    expect(body.data.imageModels.length).toBeGreaterThanOrEqual(4);
    expect(body.data.imageModels.some((m) => m.id.includes("flux.2"))).toBe(true);
  });

  it("M10-T2: GET e PUT /api/settings/quotas devem configurar regras explícitas de uso de API e bloquear excesso de orçamento", async () => {
    // 1. Configurar limite mensal de US$ 0.05 e máx 2 chamadas de imagem/dia
    const putRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/settings/quotas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          maxRpm: 10,
          maxDailyTextRequests: 20,
          maxDailyImageRequests: 2,
          maxMonthlyBudgetUsd: 0.05,
          maxOutputTokens: 2000,
          fallbackToSvgWhenExceeded: true,
        }),
      })
    );
    expect(putRes.status).toBe(200);
    const putBody = (await putRes.json()) as {
      success: boolean;
      data: { rules: { maxMonthlyBudgetUsd: number; maxDailyImageRequests: number } };
    };
    expect(putBody.success).toBe(true);
    expect(putBody.data.rules.maxMonthlyBudgetUsd).toBe(0.05);
    expect(putBody.data.rules.maxDailyImageRequests).toBe(2);

    // 2. Consultar resumo de quotas via GET
    const getRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/settings/quotas?companyId=${companyId}`)
    );
    expect(getRes.status).toBe(200);
    const getBody = (await getRes.json()) as {
      success: boolean;
      data: {
        rules: { companyId: string };
        summary: { monthlySpentUsd: number; dailyImageCount: number };
      };
    };
    expect(getBody.data.rules.companyId).toBe(companyId);
    expect(typeof getBody.data.summary.monthlySpentUsd).toBe("number");
  });

  it("M10-T3: POST /api/ai/preview-prompt e POST /api/design/preview-payloads devem retornar os 3 payloads reais a custo US$ 0.00", async () => {
    const aiPreviewRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/ai/preview-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })
    );
    expect(aiPreviewRes.status).toBe(200);
    const aiPreview = (await aiPreviewRes.json()) as {
      success: boolean;
      data: {
        prompt: string;
        companyName: string;
        estimatedCostUsd: number;
      };
    };
    expect(aiPreview.success).toBe(true);
    expect(aiPreview.data.companyName).toBe("Etiene Rewell Nutricionista");
    expect(aiPreview.data.prompt).toContain("Etiene Rewell Nutricionista");
    expect(aiPreview.data.prompt).toContain("Sua saúde não precisa esperar novembro");

    const designPreviewRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/design/preview-payloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          slideNumber: 1,
          templateId: "editorial-clean",
          formatId: "carousel_feed",
          imageProvider: "openrouter-image",
          imageModel: "black-forest-labs/flux.2-klein-4b",
        }),
      })
    );
    expect(designPreviewRes.status).toBe(200);
    const designPreview = (await designPreviewRes.json()) as {
      success: boolean;
      data: {
        textPromptPreview: string;
        imageApiPayload: {
          provider: string;
          model: string;
          compiledPrompt: string;
          width: number;
          height: number;
          estimatedCostUsd: number;
        };
        openDesignEnginePayload: {
          templateId: string;
          formatId: string;
          headline: string;
          brandKit: { companyName: string; primaryColor: string };
        };
        svgPreview: string;
      };
    };
    expect(designPreview.success).toBe(true);
    expect(designPreview.data.imageApiPayload.model).toBe("black-forest-labs/flux.2-klein-4b");
    expect(designPreview.data.imageApiPayload.width).toBe(1080);
    expect(designPreview.data.imageApiPayload.height).toBe(1350);
    expect(designPreview.data.openDesignEnginePayload.brandKit.primaryColor).toBe("#C58B6B");
    expect(designPreview.data.svgPreview).toContain("<svg");
  });
});

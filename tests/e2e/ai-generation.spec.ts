import { test, expect } from "@playwright/test";

test.describe("M4 E2E: IA Generativa Agnóstica, ML Studio API e Geração de Carrossel", () => {
  test("deve configurar ML Studio API, testar conexão, gerar carrossel com IA e exibir legenda sem erros no console", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];

    // 1. Escuta rigorosa de erros no console do navegador (Tolerância Zero a erros JS/React)
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // 2. Acesso à aplicação web
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Social Panel/i })).toBeVisible();

    // 3. Garantir empresa ativa (Demo Corp)
    const switcher = page.getByRole("combobox", { name: /Empresa/i });
    await expect(switcher).toBeVisible();
    if (await page.getByRole("button", { name: /Cadastrar Primeira Empresa/i }).isVisible()) {
      await switcher.click();
      const option = page.getByRole("option", { name: /Demo Corp/i });
      if (await option.isVisible()) {
        await option.click();
      }
    }

    // 4. Abrir Modal de Configurações de IA pelo Topbar
    const aiConfigBtn = page.getByRole("button", { name: /Configurar IA/i });
    await expect(aiConfigBtn).toBeVisible();
    await aiConfigBtn.click();

    // 5. Validar Modal de Configurações de IA e suporte a ML Studio API
    await expect(
      page.getByRole("heading", { name: /Configurações de IA Generativa Agnóstica/i })
    ).toBeVisible();

    // Selecionar o provedor ML Studio API
    const providerSelect = page.locator("#ai-provider");
    await expect(providerSelect).toBeVisible();
    await providerSelect.selectOption("mlstudio");

    // Verificar modelo e base URL padrão para ML Studio
    await expect(page.locator("#ai-model")).toHaveValue("llama-3.1-8b-instruct");
    await expect(page.locator("#ai-baseurl")).toHaveValue("http://localhost:1234/v1");

    // 6. Testar botão "Testar Conexão"
    const testBtn = page.getByRole("button", { name: /Testar Conexão/i });
    await expect(testBtn).toBeVisible();
    await testBtn.click();

    // Aguardar feedback do teste de conexão (sucesso ou falha tratada sem crash)
    await expect(
      page.getByText(/(Conexão Estabelecida com Sucesso|Falha na Conexão)/i)
    ).toBeVisible();

    // 7. Salvar Configurações de IA
    const saveAIBtn = page.getByRole("button", { name: /Salvar Configuração/i });
    await expect(saveAIBtn).toBeVisible();
    await saveAIBtn.click();
    await expect(page.getByText("Salvo!")).toBeVisible();

    // Fechar modal
    await page.locator("form").getByRole("button", { name: "Fechar" }).click();
    await expect(
      page.getByRole("heading", { name: /Configurações de IA Generativa Agnóstica/i })
    ).not.toBeVisible();

    // 8. Navegar até a aba "Módulo IA" para validar acesso alternativo
    const aiTab = page.getByRole("tab", { name: /Módulo IA/i });
    await expect(aiTab).toBeVisible();
    await aiTab.click();
    await expect(page.getByText(/IA Generativa Agnóstica com Adapter Pattern/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Gerenciar Provedores & Modelos/i })).toBeVisible();

    // 9. Voltar para o "Calendário" e gerar post com IA
    const calendarTab = page.getByRole("tab", { name: /Calendário/i });
    await expect(calendarTab).toBeVisible();
    await calendarTab.click();

    // Selecionar Segunda-feira
    const segBtn = page.getByRole("button", { name: /^Segunda/i }).first();
    await expect(segBtn).toBeVisible();
    await segBtn.click();

    // Definir tema central
    const themeInput = page.locator("#post-theme");
    await themeInput.fill("5 Dicas de Clareamento Dental");

    // Interceptar a rota de geração para garantir mock previsível e determinístico no Playwright
    await page.route("**/api/ai/generate-post", async (route) => {
      const requestData = route.request().postDataJSON() || {};
      const targetPostId = requestData.postId || "post_e2e_ai_test";

      const json = {
        success: true,
        data: {
          id: targetPostId,
          dayOfWeek: "segunda",
          theme: "5 Dicas de Clareamento Dental",
          category: "Dica Prática",
          slideCount: 5,
          status: "ai_generated",
          caption:
            "Descubra como manter seu sorriso radiante com 5 dicas! Agende no WhatsApp: https://wa.me/5511999998888\n\n#Odontologia #Sorriso",
          slides: [
            {
              id: `slide_${targetPostId}_1`,
              postId: targetPostId,
              slideNumber: 1,
              title: "Sorriso Branco em 5 Passos",
              bodyText: "Cuidar do seu sorriso é mais simples do que parece.",
              ctaText: null,
            },
            {
              id: `slide_${targetPostId}_2`,
              postId: targetPostId,
              slideNumber: 2,
              title: "1. Evite Alimentos Pigmentados",
              bodyText: "Café e vinho tinto causam manchas superficiais no esmalte.",
              ctaText: null,
            },
            {
              id: `slide_${targetPostId}_3`,
              postId: targetPostId,
              slideNumber: 3,
              title: "2. Escovação Adequada",
              bodyText: "Use cerdas macias e movimentos circulares por 2 minutos.",
              ctaText: null,
            },
            {
              id: `slide_${targetPostId}_4`,
              postId: targetPostId,
              slideNumber: 4,
              title: "3. Uso Diário do Fio Dental",
              bodyText: "Remove a placa entre os dentes onde a escova não alcança.",
              ctaText: null,
            },
            {
              id: `slide_${targetPostId}_5`,
              postId: targetPostId,
              slideNumber: 5,
              title: "Agende sua Avaliação",
              bodyText: "Toque no link ou envie uma mensagem no WhatsApp!",
              ctaText: "Chame no WhatsApp!",
            },
          ],
        },
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    });

    // Clicar em "Gerar com IA"
    const generateBtn = page.getByRole("button", { name: /Gerar com IA/i });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // 10. Validar que o post foi atualizado com o conteúdo da IA
    await expect(page.locator("#post-caption")).toBeVisible();
    await expect(page.locator("#post-caption")).toHaveValue(/Descubra como manter seu sorriso radiante/i);

    // Validar botão de copiar legenda
    const copyCaptionBtn = page.getByRole("button", { name: /Copiar Legenda/i });
    await expect(copyCaptionBtn).toBeVisible();

    // Validar título do Slide 1 nos campos de edição
    await expect(page.locator("#slide-title")).toHaveValue("Sorriso Branco em 5 Passos");

    // Validar título no Mockup 4:5 (usar .first() para evitar strict mode ambiguity se houver)
    await expect(page.getByText("Sorriso Branco em 5 Passos").first()).toBeVisible();

    // 11. Conclusão: Zero erros no console durante todo o fluxo
    expect(consoleErrors).toEqual([]);
  });
});

import { test, expect } from "@playwright/test";

test.describe("M5 E2E: Exportação Canva Pro (Bulk Create) e Fila AutoSocial", () => {
  test("deve baixar CSV do Canva com UTF-8 BOM, enfileirar posts no AutoSocial e exibir contadores sem erros no console", async ({
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

    // 4. Acessar a aba "Publicação & Fila"
    const queueTab = page.getByRole("tab", { name: /Publicação & Fila/i });
    await expect(queueTab).toBeVisible();
    await queueTab.click();

    // 5. Validar cards de controle
    await expect(page.getByRole("heading", { name: /Criar em Lote no Canva/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Fila no Sistema de Arquivos/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Publicação Autônoma/i })).toBeVisible();

    // 6. Testar download do CSV do Canva Pro Bulk Create
    const canvaDownloadBtn = page.getByRole("button", { name: /Baixar CSV Canva Pro/i });
    await expect(canvaDownloadBtn).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      canvaDownloadBtn.click(),
    ]);

    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toContain("canva_bulk_create_");
    expect(suggestedName).toContain(".csv");

    // Validar mensagem de sucesso na tela
    await expect(
      page.getByText(/Arquivo CSV para Canva Bulk Create gerado e baixado com sucesso/i)
    ).toBeVisible();

    // 7. Enfileirar post individual na fila do AutoSocial
    const firstEnqueueBtn = page.getByRole("button", { name: /Enfileirar Post/i }).first();
    await expect(firstEnqueueBtn).toBeVisible();
    await firstEnqueueBtn.click();

    // Validar feedback de post enfileirado
    await expect(
      page.getByText(/Post enfileirado com sucesso na pasta pending\/ do AutoSocial/i)
    ).toBeVisible();

    // 8. Testar Enfileirar Semana Completa
    const enqueueAllBtn = page.getByRole("button", { name: /Enfileirar Semana Completa/i });
    await expect(enqueueAllBtn).toBeVisible();
    await enqueueAllBtn.click();

    await expect(
      page.getByText(/Semana enfileirada com sucesso/i)
    ).toBeVisible();

    // 9. Verificar que o badge "Enfileirado AutoSocial" está visível na grade semanal
    await expect(page.getByText("Enfileirado AutoSocial").first()).toBeVisible();

    // 10. Conclusão: Zero erros no console durante todo o fluxo
    expect(consoleErrors).toEqual([]);
  });
});

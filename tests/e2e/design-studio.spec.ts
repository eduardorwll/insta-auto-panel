import { test, expect } from "@playwright/test";

test.describe("M6 E2E: Studio Visual Autônomo Sem Canva (OpenDesign 4:5 + Variable Image AI + break-ui)", () => {
  test("deve abrir o Studio Visual, trocar templates 4:5, gerar fundo IA, suportar stress test break-ui (300 chars) e enfileirar no AutoSocial sem erros de console", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Social Panel/i })
    ).toBeVisible();

    // 1. Abrir Studio Visual (Sem Canva) no WeekPlanner
    const studioBtn = page.getByRole("button", {
      name: /Studio Visual \(Sem Canva\)/i,
    });
    await expect(studioBtn).toBeVisible();
    await studioBtn.click();

    // 2. Validar abertura do modal com Canvas 1080x1350 (Modo Operate + Persuade)
    const dialog = page.getByRole("dialog", {
      name: /Studio Visual OpenDesign Sem Canva/i,
    });
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("opendesign-canvas")).toBeVisible();

    // 3. Trocar templates 4:5
    await dialog.getByRole("button", { name: /Editorial Clean/i }).click();
    await dialog.getByRole("button", { name: /Split Photo 4:5/i }).click();

    // 4. Selecionar provedor de imagem variável (ComfyUI / Krita Local :8188 e Pollinations Zero-Key)
    const providerSelect = dialog.getByLabel("Provedor de Imagem IA");
    await providerSelect.selectOption("comfyui-local");
    await providerSelect.selectOption("pollinations");

    // 5. Teste de quebra (break-ui): Prompt extremo de 300+ caracteres
    const extremePrompt =
      "Consultório odontológico arquitetônico minimalista com iluminação natural difusa, superfície em pedra travertino, cadeira ergonômica contemporânea, fotografia editorial 4:5 de alta resolução sem elementos de texto sobrepostos para carrossel educativo de reabilitação oral estética avançada 2026";
    const promptInput = dialog.getByLabel("Prompt de Background IA");
    await promptInput.fill(extremePrompt);

    // 6. Gerar Fundo IA
    const genBgBtn = dialog.getByRole("button", { name: /Gerar Fundo IA/i });
    await genBgBtn.click();
    await expect(
      dialog.getByText(/Background IA \(pollinations\) aplicado/i)
    ).toBeVisible();

    // 7. Renderizar Carrossel 4:5 & Enviar para Fila AutoSocial (Sem Canva)
    const renderAndQueueBtn = dialog.getByRole("button", {
      name: /Renderizar & Enviar para Fila AutoSocial \(Sem Canva\)/i,
    });
    await renderAndQueueBtn.click();

    await expect(
      dialog.getByText(
        /lâminas 4:5 renderizadas e enfileiradas direto no AutoSocial \(Sem Canva\)!/i
      )
    ).toBeVisible();

    // Verificar links PNG gerados
    await expect(dialog.getByText("Lâmina 1 (.PNG)")).toBeVisible();

    // 8. Fechar modal do Studio Visual
    await dialog.getByRole("button", { name: /Fechar Studio Visual/i }).click();
    await expect(dialog).not.toBeVisible();

    // 9. Clicar no botão "Arquitetura" na Topbar e validar abertura do Diagrama Único Archify
    const archBtn = page.getByRole("button", { name: /Arquitetura/i });
    await expect(archBtn).toBeVisible();
    await archBtn.click();

    const archDialog = page.getByRole("dialog", {
      name: /Diagrama Único de Arquitetura Archify/i,
    });
    await expect(archDialog).toBeVisible();
    await expect(
      archDialog.locator('iframe[src="/architecture.html"]')
    ).toBeVisible();
    await archDialog
      .getByRole("button", { name: /Fechar Diagrama de Arquitetura/i })
      .click();
    await expect(archDialog).not.toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

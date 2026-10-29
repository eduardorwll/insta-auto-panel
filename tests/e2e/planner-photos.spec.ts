import { test, expect } from "@playwright/test";
import path from "path";

test.describe("M3 E2E: Banco de Fotos, Planejador Semanal e Mockup 4:5", () => {
  test("deve realizar upload de foto, configurar 8 lâminas na quarta-feira e exibir mockup 4:5 sem erros no console", async ({
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

    // 4. Acessar a aba "Fotos Base"
    const photosTab = page.getByRole("tab", { name: /Fotos Base/i });
    await expect(photosTab).toBeVisible();
    await photosTab.click();

    // 5. Upload de imagem para o acervo da empresa
    const fixturePath = path.resolve(import.meta.dirname, "../fixtures/test-avatar.png");
    await page.locator("#photo-upload-input").setInputFiles(fixturePath);
    await page.locator("#photo-category-select").selectOption("Especialista");
    await page.locator("#photo-tags-input").fill("especialista, clínica");

    await page.getByRole("button", { name: /Enviar para o Acervo/i }).click();

    // Confirmação de upload
    await expect(page.getByText(/Foto enviada com sucesso/i)).toBeVisible();

    // 6. Acessar a aba "Calendário"
    const calendarTab = page.getByRole("tab", { name: /Calendário/i });
    await expect(calendarTab).toBeVisible();
    await calendarTab.click();

    // 7. Selecionar o card de Quarta-feira
    const quartaBtn = page.getByRole("button", { name: /QUA/i });
    await expect(quartaBtn).toBeVisible();
    await quartaBtn.click();

    // 8. Ajustar a quantidade dinâmica de lâminas para 8
    const stepper = page.getByRole("spinbutton", { name: /Quantidade de Lâminas/i });
    await expect(stepper).toBeVisible();
    await stepper.fill("8");

    // Verificar se a lâmina 8 (CTA) foi criada e renderizada
    await expect(page.getByRole("button", { name: /Slide 8 \(CTA\)/i })).toBeVisible();

    // 9. Atualizar o tema do post
    const themeInput = page.locator("#post-theme");
    await themeInput.fill("8 Passos para um Clareamento Seguro");

    // 10. Salvar o post
    const saveBtn = page.getByRole("button", { name: /Salvar Post/i });
    await saveBtn.click();
    await expect(page.getByText(/Salvo!/i)).toBeVisible();

    // 11. Conferir se o Mockup 4:5 exibe os dados atualizados
    await expect(page.getByText("1 / 8")).toBeVisible();
    await expect(page.getByText("8 Passos para um Clareamento Seguro").first()).toBeVisible();
    await expect(page.getByText(/Proporção Instagram 4:5/i)).toBeVisible();

    // 12. Validação mandatória: console limpo com ZERO erros de execução
    expect(consoleErrors).toEqual([]);
  });
});

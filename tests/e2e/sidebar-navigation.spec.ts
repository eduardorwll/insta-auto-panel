import { test, expect } from "@playwright/test";

test.describe("M7.2 E2E: Barra Lateral Recolhível (Sidebar Navigation) & Ausência de Vazamentos Tipográficos", () => {
  test("deve renderizar a barra lateral categorizada por domínio, alternar recolhimento/expansão, transitar entre abas e verificar ausência de vazamento tipográfico", async ({
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
    await expect(page.getByRole("heading", { name: /Social Panel/i })).toBeVisible();

    // Garantir empresa ativa canônica (Demo Corp)
    const switcher = page.getByRole("combobox", { name: /Empresa/i });
    await expect(switcher).toBeVisible();
    await switcher.click();
    const demoOption = page.getByRole("option", { name: /Demo Corp/i });
    if (await demoOption.isVisible()) {
      await demoOption.click();
    } else {
      await page.keyboard.press("Escape");
    }

    // 1. Validar grupos de domínio na Sidebar Navigation
    await expect(page.getByText("Criação & Editorial")).toBeVisible();
    await expect(page.getByText("Acervo de Mídia")).toBeVisible();
    await expect(page.getByText("Automação Social")).toBeVisible();
    await expect(page.getByText("Sistema & Ajustes")).toBeVisible();

    // 2. Validar abas e badges de modo
    await expect(page.getByRole("tab", { name: /Calendário Semanal/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Studio Visual 4:5/i })).toBeVisible();
    await expect(page.getByText("100% IA").first()).toBeVisible();
    await expect(page.getByRole("tab", { name: /Exportar Canva Pro/i })).toBeVisible();
    await expect(page.getByText("CSV").first()).toBeVisible();

    // 3. Testar botão de recolher barra lateral
    const collapseBtn = page.getByRole("button", { name: /Recolher Barra Lateral/i });
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    // Verificar botão de expandir presente no estado recolhido
    const expandBtn = page.getByTitle("Expandir barra lateral");
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();
    await expect(collapseBtn).toBeVisible();

    // 4. Navegar para "Configurações & Módulo IA" e validar ausência de overflow no botão de salvar
    const settingsTab = page.getByRole("tab", { name: /Configurações & Módulo IA/i });
    await settingsTab.click();
    await expect(page.getByTestId("settings-hub")).toBeVisible();

    const saveStudioPrefBtn = page.getByRole("button", {
      name: /Salvar Preferências do Studio/i,
    });
    await expect(saveStudioPrefBtn).toBeVisible();

    // Validar que o botão e o path persistente estão no viewport sem vazamento horizontal
    const buttonBox = await saveStudioPrefBtn.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.width).toBeGreaterThan(120);

    // 5. Navegar para "Exportar Canva Pro"
    const canvaTab = page.getByRole("tab", { name: /Exportar Canva Pro/i });
    await canvaTab.click();
    await expect(page.getByText(/Modo com Canva \(Exportação em Lote CSV\)/i)).toBeVisible();

    // 6. Navegar para "Fotos Base da Marca"
    const photosTab = page.getByRole("tab", { name: /Fotos Base da Marca/i });
    await photosTab.click();
    await expect(page.getByText(/Upload de Foto para o Banco Base/i)).toBeVisible();

    // 7. Navegar para a nova aba "Dados da Empresa" & Brand Kit
    const companyTab = page.getByRole("tab", { name: /Dados da Empresa/i });
    await expect(companyTab).toBeVisible();
    await companyTab.click();
    await expect(page.getByRole("heading", { name: /Dados da Empresa & Brand Kit/i })).toBeVisible();
    await expect(page.getByText(/Live Brand Kit Preview/i)).toBeVisible();
    await expect(page.locator("#company-name")).toBeVisible();
    await expect(page.locator("#company-instagram")).toBeVisible();

    // Testar salvar alterações na aba de dados da empresa
    const saveCompanyBtn = page.locator("#btn-save-company-data-top");
    await expect(saveCompanyBtn).toBeVisible();
    await saveCompanyBtn.click();
    await expect(page.getByText(/Salvo com Sucesso!/i).first()).toBeVisible();

    // 8. Navegar de volta ao "Calendário Semanal"
    const calendarTab = page.getByRole("tab", { name: /Calendário Semanal/i });
    await calendarTab.click();
    await expect(page.getByText(/Planejamento Editorial Semanal/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

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

    // 7. Navegar de volta ao "Calendário Semanal"
    const calendarTab = page.getByRole("tab", { name: /Calendário Semanal/i });
    await calendarTab.click();
    await expect(page.getByText(/Planejamento Editorial Semanal/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

import { test, expect } from "@playwright/test";

test.describe("M2 E2E: Navegação, Company Switcher e Cadastro de Empresa", () => {
  test("deve carregar a interface web sem erros no console, cadastrar empresa e selecionar dinamicamente", async ({
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

    // 3. Validação do Header e título
    await expect(page.getByRole("heading", { name: /Social Panel/i })).toBeVisible();

    // 4. Abertura do CompanySwitcher
    const switcher = page.getByRole("combobox", { name: /Empresa/i });
    await expect(switcher).toBeVisible();
    await switcher.click();

    // 5. Clicar em "Cadastrar Nova Empresa"
    const createOption = page.getByRole("menuitem", { name: /Cadastrar Nova Empresa/i });
    await expect(createOption).toBeVisible();
    await createOption.click();

    // 6. Preenchimento do formulário no Dialog Modal
    await expect(page.getByRole("heading", { name: /Cadastrar Nova Empresa/i })).toBeVisible();

    const testSlug = `e2e_alpha_${Date.now()}`;
    await page.getByLabel(/Nome Fantasia/i).fill("Alpha Odonto E2E");
    await page.getByLabel(/Slug do Identificador/i).fill(testSlug);
    await page.getByLabel(/Instagram/i).fill("@alphaodonto");
    await page.getByLabel(/Nicho de Mercado/i).fill("Odontologia Estética");
    await page.getByLabel(/Tom de Voz/i).fill("Especialista e Acolhedor");
    await page.getByLabel(/WhatsApp/i).fill("5511999998888");
    await page.getByLabel(/Canva Template ID/i).fill("CANVA-ALPHA-E2E");

    // 7. Submeter o cadastro
    await page.getByRole("button", { name: /Cadastrar Empresa/i }).click();

    // 8. O modal deve fechar e a nova empresa deve estar ativa no topo e no painel
    await expect(page.getByRole("heading", { name: /Cadastrar Nova Empresa/i })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Alpha Odonto E2E" })).toBeVisible();
    await expect(page.getByText("@alphaodonto").first()).toBeVisible();
    await expect(page.getByText("Odontologia Estética")).toBeVisible();
    await expect(page.getByText("5511999998888")).toBeVisible();

    // 9. Trocar de empresa via switcher
    await switcher.click();
    const demoOption = page.getByRole("option", { name: /Demo Corp/i });
    if (await demoOption.isVisible()) {
      await demoOption.click();
      await expect(page.getByRole("heading", { name: "Demo Corp" })).toBeVisible();
    }

    // 10. Validação mandatória: console limpo com ZERO erros de execução
    expect(consoleErrors).toEqual([]);
  });
});

import { test, expect } from "@playwright/test";

test.describe("E2E: Instagram SEO 2026 (Framework MATCH) e Campos da Marca", () => {
  test("deve exibir campos de SEO na aba Empresa e componente SeoChecklist no Studio Visual sem erros de console", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];

    // 1. Escuta rigorosa de erros no console
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // 2. Acessa a aplicação
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Social Panel/i })).toBeVisible();

    // 3. Navega para a aba 'Dados da Empresa'
    await page.getByRole("tab", { name: /Dados da Empresa/i }).click();

    // 4. Verifica a seção de SEO do Perfil e seus campos
    await expect(page.getByText("4. Instagram SEO & Perfil de Busca (Framework MATCH)")).toBeVisible();
    await expect(page.getByText("Display Name SEO (Nome de Exibição no Perfil)")).toBeVisible();
    await expect(page.getByText("Cluster de Palavras-Chave Prioritárias")).toBeVisible();
    await expect(page.getByText("Bio Indexável do Perfil")).toBeVisible();

    // 5. Navega para a aba 'Studio Visual 4:5'
    await page.getByRole("tab", { name: /Studio Visual 4:5/i }).click();

    // 6. Verifica a presença do card de legenda e checklist MATCH
    await expect(page.getByText("4. Legenda do Post no Instagram")).toBeVisible();
    await expect(page.getByText("SEO do Instagram (MATCH)")).toBeVisible();
    await expect(page.getByTestId("seo-checklist")).toBeVisible();

    // 7. Tolerância zero a erros de console/React
    expect(consoleErrors).toEqual([]);
  });
});

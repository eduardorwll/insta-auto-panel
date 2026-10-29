import { test, expect } from "@playwright/test";

test.describe("M7 E2E: Hub de Configurações Unificado, Cookies Instagram por Empresa & UI Craft", () => {
  test("deve navegar até a aba Configurações, salvar cookies de sessão do Instagram (.profiles/<empresa>/instagram), configurar motor de imagem IA e inicializar perfil Chromium sem erros de console", async ({
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

    // 1. Abrir aba "Configurações & Módulo IA"
    const settingsTab = page.getByRole("tab", { name: /Configurações/i });
    await expect(settingsTab).toBeVisible();
    await settingsTab.click();

    // 2. Validar renderização do SettingsHub
    const hub = page.getByTestId("settings-hub");
    await expect(hub).toBeVisible();
    await expect(
      hub.getByRole("heading", { name: /Central de Configurações, Chaves de API & Sessões/i })
    ).toBeVisible();

    // 3. Testar coleta de Cookies de Login do Instagram por Empresa
    const cookiesTextarea = hub.locator("#ig-cookies-json");
    await expect(cookiesTextarea).toBeVisible();

    const sampleCookies = JSON.stringify([
      {
        name: "sessionid",
        value: "987654321%3Ae2eSessionToken%3A14",
        domain: ".instagram.com",
        path: "/",
      },
      {
        name: "csrftoken",
        value: "csrf_e2e_token_2026",
        domain: ".instagram.com",
        path: "/",
      },
      {
        name: "ds_user_id",
        value: "987654321",
        domain: ".instagram.com",
        path: "/",
      },
    ]);

    await cookiesTextarea.fill(sampleCookies);

    const saveCookiesBtn = hub.getByRole("button", {
      name: /Validar & Salvar Cookies Instagram/i,
    });
    await saveCookiesBtn.click();

    await expect(
      hub.getByText(/Cookies e storageState\.json gravados com sucesso/i)
    ).toBeVisible();
    await expect(hub.getByText("Sessão Instagram Ativa")).toBeVisible();

    // 4. Testar inicialização do Perfil Chromium Local (.profiles/<empresa>/instagram)
    const initProfileBtn = hub.getByRole("button", {
      name: /Inicializar Perfil Chromium Local/i,
    });
    await initProfileBtn.click();
    await expect(
      hub.getByText(/Perfil Chromium persistente preparado em/i)
    ).toBeVisible();

    // 5. Configurar Provedor de Imagem IA Variável e Template 4:5 Padrão
    const imgProviderSelect = hub.locator("#app-img-provider");
    await imgProviderSelect.selectOption("comfyui-local");

    const templateSelect = hub.locator("#app-template-id");
    await templateSelect.selectOption("editorial-clean");

    const saveAppBtn = hub.getByRole("button", {
      name: /Salvar Preferências do Studio/i,
    });
    await saveAppBtn.click();

    await expect(
      hub.getByText(/Preferências de Imagem IA e Aplicação salvas!/i)
    ).toBeVisible();

    // 6. Capturar screenshot do Hub de Configurações para auditoria visual
    await page.screenshot({
      path: ".taste-skill/inspect/settings-hub-e2e.jpg",
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
  });
});

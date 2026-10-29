import { describe, expect, test } from "bun:test";
import { server } from "../../src/server/index";
import { db } from "../../src/server/db/client";
import { companies } from "../../src/server/db/schema";
import fs from "node:fs/promises";
import path from "node:path";

describe("M7-T1: REST API Hub de Configurações & Cookies Instagram por Empresa (/api/settings)", () => {
  const baseUrl = `http://localhost:${server.port}`;

  test("GET /api/settings deve retornar configurações padrão da empresa quando ainda não configurada", async () => {
    const companyId = `cfg_co_${Date.now()}`;
    await db.insert(companies).values({
      id: companyId,
      name: "Clínica Prime Settings",
      instagramHandle: "@clinicaprimesettings",
      niche: "Odontologia",
      toneOfVoice: " Técnico e humano",
    });

    const res = await fetch(`${baseUrl}/api/settings?companyId=${companyId}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: {
        companyId: string;
        instagramSessionStatus: string;
        preferredImageProvider: string;
        defaultTemplateId: string;
      };
    };

    expect(body.success).toBe(true);
    expect(body.data.companyId).toBe(companyId);
    expect(body.data.instagramSessionStatus).toBe("unconfigured");
    expect(body.data.preferredImageProvider).toBe("pollinations");
    expect(body.data.defaultTemplateId).toBe("modern-bold");
  });

  test("PUT /api/settings/instagram-cookies deve extrair sessionid de JSON de cookies ou campos diretos e persistir em .profiles/<companyId>/instagram/", async () => {
    const companyId = `ig_cookie_co_${Date.now()}`;
    await db.insert(companies).values({
      id: companyId,
      name: "Odonto Cookie Lab",
      instagramHandle: "@odontocookielab",
      niche: "Estética Dental",
      toneOfVoice: "Moderno",
    });

    const sampleCookieArray = JSON.stringify([
      {
        name: "sessionid",
        value: "654321%3AtestSessionToken%3A28",
        domain: ".instagram.com",
        path: "/",
      },
      {
        name: "csrftoken",
        value: "csrf_token_example_99",
        domain: ".instagram.com",
        path: "/",
      },
      {
        name: "ds_user_id",
        value: "654321",
        domain: ".instagram.com",
        path: "/",
      },
    ]);

    const res = await fetch(`${baseUrl}/api/settings/instagram-cookies`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        cookiesJson: sampleCookieArray,
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      sessionStatus: string;
      dsUserId: string;
      profileDir: string;
      filesWritten: string[];
    };

    expect(data.success).toBe(true);
    expect(data.sessionStatus).toBe("active");
    expect(data.dsUserId).toBe("654321");
    expect(data.filesWritten.length).toBeGreaterThanOrEqual(2);

    // Conferir arquivos físicos criados para o Katzca/AutoSocial
    const storageStatePath = path.resolve(
      import.meta.dirname,
      `../../data/autosocial/.profiles/${companyId}/instagram/storageState.json`
    );
    const stat = await fs.stat(storageStatePath);
    expect(stat.size).toBeGreaterThan(50);
  });

  test("PUT /api/settings/app deve salvar provedor de imagem IA, URL ComfyUI e template padrão da empresa", async () => {
    const companyId = `app_cfg_co_${Date.now()}`;
    await db.insert(companies).values({
      id: companyId,
      name: "Studio Config Co",
      instagramHandle: "@studioconfigco",
      niche: "Arquitetura",
      toneOfVoice: "Minimalista",
    });

    const res = await fetch(`${baseUrl}/api/settings/app`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        preferredImageProvider: "comfyui-local",
        imageProviderBaseUrl: "http://localhost:8188",
        defaultTemplateId: "editorial-clean",
        autosocialQueuePath: "data/autosocial/queue",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: {
        preferredImageProvider: string;
        imageProviderBaseUrl: string;
        defaultTemplateId: string;
      };
    };

    expect(body.success).toBe(true);
    expect(body.data.preferredImageProvider).toBe("comfyui-local");
    expect(body.data.imageProviderBaseUrl).toBe("http://localhost:8188");
    expect(body.data.defaultTemplateId).toBe("editorial-clean");
  });
});

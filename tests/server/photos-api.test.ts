import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import { companies, photo_assets } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { existsSync } from "fs";

describe("REST API: Banco de Fotos Base (/api/photos)", () => {
  const testCompanyId = "empresa_photos_test";
  let uploadedPhotoId = "";
  let uploadedPhotoFilename = "";

  beforeAll(async () => {
    // Garante que a empresa exista
    await db.delete(companies).where(eq(companies.id, testCompanyId));
    await db.insert(companies).values({
      id: testCompanyId,
      name: "Empresa Fotos Teste",
      instagramHandle: "@empresafotos",
      niche: "Estética",
      toneOfVoice: "Elegante",
    });
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, testCompanyId));
  });

  it("POST /api/photos/upload deve receber arquivo via FormData e persistir no SQLite", async () => {
    const formData = new FormData();
    const fakeBlob = new Blob(["fake-image-content-png"], { type: "image/png" });
    formData.append("file", fakeBlob, "especialista-dr-carlos.png");
    formData.append("companyId", testCompanyId);
    formData.append("category", "Especialista");
    formData.append("tags", JSON.stringify(["rosto", "consultorio"]));

    const req = new Request(`http://localhost:${server.port}/api/photos/upload`, {
      method: "POST",
      body: formData,
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(201);

    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.companyId).toBe(testCompanyId);
    expect(body.data.category).toBe("Especialista");
    expect(body.data.originalName).toBe("especialista-dr-carlos.png");

    uploadedPhotoId = body.data.id;
    uploadedPhotoFilename = body.data.filename;

    // Conferir se arquivo físico foi gravado em disk
    expect(existsSync(`data/uploads/${uploadedPhotoFilename}`)).toBe(true);
  });

  it("GET /api/photos deve listar fotos da empresa e suportar filtro por categoria", async () => {
    // Listar todas as fotos da empresa
    const reqAll = new Request(`http://localhost:${server.port}/api/photos?companyId=${testCompanyId}`);
    const resAll = await server.fetch(reqAll);
    expect(resAll.status).toBe(200);

    const bodyAll = (await resAll.json()) as { success: boolean; data: any[] };
    expect(bodyAll.data.length).toBeGreaterThanOrEqual(1);

    // Filtrar por categoria existente
    const reqFiltered = new Request(
      `http://localhost:${server.port}/api/photos?companyId=${testCompanyId}&category=Especialista`
    );
    const resFiltered = await server.fetch(reqFiltered);
    const bodyFiltered = (await resFiltered.json()) as { success: boolean; data: any[] };
    expect(bodyFiltered.data.length).toBeGreaterThanOrEqual(1);

    // Filtrar por categoria sem itens
    const reqEmpty = new Request(
      `http://localhost:${server.port}/api/photos?companyId=${testCompanyId}&category=Produto`
    );
    const resEmpty = await server.fetch(reqEmpty);
    const bodyEmpty = (await resEmpty.json()) as { success: boolean; data: any[] };
    expect(bodyEmpty.data.length).toBe(0);
  });

  it("GET /uploads/:filename deve servir a imagem estática salva", async () => {
    const req = new Request(`http://localhost:${server.port}/uploads/${uploadedPhotoFilename}`);
    const res = await server.fetch(req);
    expect(res.status).toBe(200);
    const content = await res.text();
    expect(content).toBe("fake-image-content-png");
  });

  it("DELETE /api/photos/:id deve remover do banco e apagar arquivo em data/uploads/", async () => {
    const req = new Request(`http://localhost:${server.port}/api/photos/${uploadedPhotoId}`, {
      method: "DELETE",
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    // Validar exclusão física do arquivo
    expect(existsSync(`data/uploads/${uploadedPhotoFilename}`)).toBe(false);

    // Validar exclusão do registro no banco
    const [check] = await db.select().from(photo_assets).where(eq(photo_assets.id, uploadedPhotoId));
    expect(check).toBeUndefined();
  });
});

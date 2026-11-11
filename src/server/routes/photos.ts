import { db } from "../db/client";
import { photo_assets, posts, companies, photoCategorySchema } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import path from "path";
import { unlinkSync, existsSync } from "fs";

export async function handlePhotosRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. GET /api/photos?companyId=...&category=...
  if (req.method === "GET" && pathname === "/api/photos") {
    const companyId = url.searchParams.get("companyId");
    const category = url.searchParams.get("category");

    if (!companyId) {
      return Response.json({ success: false, error: "companyId é obrigatório" }, { status: 400 });
    }

    const conditions = [eq(photo_assets.companyId, companyId)];
    if (category) {
      conditions.push(eq(photo_assets.category, category));
    }

    const photos = await db
      .select()
      .from(photo_assets)
      .where(and(...conditions))
      .orderBy(desc(photo_assets.uploadedAt));

    return Response.json({ success: true, data: photos });
  }

  // 2. POST /api/photos/upload
  if (req.method === "POST" && pathname === "/api/photos/upload") {
    try {
      const formData = await req.formData();
      const file = formData.get("file");
      const companyId = formData.get("companyId")?.toString();
      const category = formData.get("category")?.toString();
      const tagsRaw = formData.get("tags")?.toString();

      if (!file || !(file instanceof Blob)) {
        return Response.json({ success: false, error: "Arquivo de imagem obrigatório" }, { status: 400 });
      }

      // Validação estrita de tamanho (máx 10 MB), extensão, MIME type e assinatura contra uploads maliciosos (SEC-05 / OWASP A04)
      const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
      if (file.size === 0) {
        return Response.json({ success: false, error: "Arquivo vazio não permitido." }, { status: 400 });
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return Response.json(
          { success: false, error: "Arquivo excede o limite máximo de 10 MB." },
          { status: 413 }
        );
      }

      const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
      const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

      const originalName = file instanceof File ? file.name : "upload.png";
      const ext = path.extname(originalName).toLowerCase() || ".png";
      if (!ALLOWED_EXTENSIONS.has(ext) || (file.type && !ALLOWED_MIME_TYPES.has(file.type))) {
        return Response.json(
          { success: false, error: "Formato de arquivo não permitido. Use apenas PNG, JPG ou WebP." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const headText = new TextDecoder("utf-8", { fatal: false })
        .decode(arrayBuffer.slice(0, 256))
        .trimStart()
        .toLowerCase();
      if (
        headText.startsWith("<script") ||
        headText.startsWith("<!doctype") ||
        headText.startsWith("<html") ||
        headText.startsWith("<svg") ||
        headText.startsWith("<?xml") ||
        headText.startsWith("<?php")
      ) {
        return Response.json(
          { success: false, error: "Conteúdo de arquivo inválido ou potencialmente malicioso detectado." },
          { status: 400 }
        );
      }

      if (!companyId) {
        return Response.json({ success: false, error: "companyId é obrigatório" }, { status: 400 });
      }

      // Validar existência da empresa
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      if (!company) {
        return Response.json({ success: false, error: "Empresa não encontrada" }, { status: 404 });
      }

      // Validar categoria
      const catParsed = photoCategorySchema.safeParse(category);
      if (!catParsed.success) {
        return Response.json({ success: false, error: "Categoria de foto inválida" }, { status: 400 });
      }
      const cleanOriginal = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const photoId = `photo_${companyId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const filename = `${photoId}_${cleanOriginal}${ext}`;
      const uploadsDir = path.resolve(import.meta.dirname, "../../../data/uploads");
      const diskPath = path.join(uploadsDir, filename);

      // Gravar arquivo em disco usando Bun.write
      await Bun.write(diskPath, arrayBuffer);

      // Inserir registro no SQLite
      const newAsset = {
        id: photoId,
        companyId,
        filename,
        originalName,
        filePath: `data/uploads/${filename}`,
        category: catParsed.data,
        tags: tagsRaw || null,
        timesUsed: 0,
      };

      try {
        await db.insert(photo_assets).values(newAsset);
      } catch (insertErr) {
        // Rollback compensatório: sem registro no SQLite, o arquivo gravado seria órfão.
        try {
          unlinkSync(diskPath);
        } catch {}
        throw insertErr;
      }
      const [created] = await db.select().from(photo_assets).where(eq(photo_assets.id, photoId));

      return Response.json({ success: true, data: created }, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro no upload";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  // 3. DELETE /api/photos/:id
  if (req.method === "DELETE" && pathname.startsWith("/api/photos/")) {
    const photoId = pathname.replace("/api/photos/", "");
    const [photo] = await db.select().from(photo_assets).where(eq(photo_assets.id, photoId));

    if (!photo) {
      return Response.json({ success: false, error: "Foto não encontrada" }, { status: 404 });
    }

    // Excluir arquivo físico
    const uploadsDir = path.resolve(import.meta.dirname, "../../../data/uploads");
    const diskPath = path.join(uploadsDir, photo.filename);
    if (existsSync(diskPath)) {
      try {
        unlinkSync(diskPath);
      } catch {}
    }

    // Excluir registro no banco
    // Transação: remove a foto e limpa referências pendentes em posts.selectedPhotoIds
    db.transaction((tx) => {
      const companyPosts = tx.select().from(posts).where(eq(posts.companyId, photo.companyId)).all();
      for (const p of companyPosts) {
        if (!p.selectedPhotoIds) continue;
        let ids: string[] = [];
        try {
          ids = JSON.parse(p.selectedPhotoIds) as string[];
        } catch {
          continue;
        }
        if (!ids.includes(photoId)) continue;
        tx.update(posts)
          .set({ selectedPhotoIds: JSON.stringify(ids.filter((x) => x !== photoId)) })
          .where(eq(posts.id, p.id))
          .run();
      }
      tx.delete(photo_assets).where(eq(photo_assets.id, photoId)).run();
    });
    return Response.json({ success: true, message: "Foto excluída com sucesso" });
  }

  return null;
}

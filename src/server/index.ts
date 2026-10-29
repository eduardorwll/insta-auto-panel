import { handleCompaniesRoutes } from "./routes/companies";
import { handlePhotosRoutes } from "./routes/photos";
import { handleSchedulesRoutes } from "./routes/schedules";
import { handleAIRoutes } from "./routes/ai";
import { handleExportRoutes } from "./routes/export";
import { handleDesignRoutes } from "./routes/design";
import { handleSettingsRoutes } from "./routes/settings";
import path from "path";

export const server = Bun.serve({
  port: process.env.NODE_ENV === "test" ? 0 : Number(process.env.PORT) || 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // 1. Health check
    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        app: "Social Panel PRO",
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Rotas de Empresas (/api/companies)
    const companiesResponse = await handleCompaniesRoutes(req, url);
    if (companiesResponse) return companiesResponse;

    // 3. Rotas de Fotos (/api/photos)
    const photosResponse = await handlePhotosRoutes(req, url);
    if (photosResponse) return photosResponse;

    // 4. Rotas de Cronograma & Posts (/api/schedules, /api/posts)
    const schedulesResponse = await handleSchedulesRoutes(req, url);
    if (schedulesResponse) return schedulesResponse;

    // 5. Rotas de IA Generativa Agnóstica (/api/ai)
    const aiResponse = await handleAIRoutes(req, url);
    if (aiResponse) return aiResponse;

    // 6. Rotas de Exportação e Publicação (/api/export)
    const exportResponse = await handleExportRoutes(req, url);
    if (exportResponse) return exportResponse;

    // 6.5. Rotas do Studio Visual OpenDesign Sem Canva (/api/design)
    const designResponse = await handleDesignRoutes(req, url);
    if (designResponse) return designResponse;

    // 6.6. Rotas do Hub de Configurações & Sessão Instagram por Empresa (/api/settings)
    const settingsResponse = await handleSettingsRoutes(req, url);
    if (settingsResponse) return settingsResponse;

    // 7. Servir diagrama único de arquitetura Archify (/architecture)
    if (url.pathname === "/architecture" || url.pathname === "/architecture.html") {
      const archFile = Bun.file(path.resolve(import.meta.dirname, "../../docs/architecture.html"));
      if (await archFile.exists()) {
        return new Response(archFile, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return new Response("Diagrama de arquitetura ainda não gerado (rode bun run archify)", { status: 404 });
    }

    // 8. Servir uploads de fotos (/uploads/*) e renders do Studio (/renders/*)
    if (url.pathname.startsWith("/uploads/")) {
      const uploadFilename = url.pathname.replace("/uploads/", "");
      const uploadsDir = path.resolve(import.meta.dirname, "../../data/uploads");
      const filePath = path.join(uploadsDir, uploadFilename);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Imagem não encontrada", { status: 404 });
    }

    if (url.pathname.startsWith("/renders/")) {
      const relRenderPath = url.pathname.replace("/renders/", "");
      const rendersDir = path.resolve(import.meta.dirname, "../../data/renders");
      const filePath = path.join(rendersDir, relRenderPath);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        const contentType = filePath.endsWith(".svg")
          ? "image/svg+xml"
          : "image/png";
        return new Response(file, {
          headers: { "Content-Type": contentType },
        });
      }
      return new Response("Render não encontrado", { status: 404 });
    }

    // 6. Servir arquivos estáticos do frontend (dist/) se compilado
    if (!url.pathname.startsWith("/api/")) {
      const distDir = path.resolve(import.meta.dirname, "../../dist");
      const relativePath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      const filePath = path.join(distDir, relativePath);
      const file = Bun.file(filePath);

      if (await file.exists()) {
        return new Response(file);
      }

      // Fallback SPA para index.html
      const indexHtml = Bun.file(path.join(distDir, "index.html"));
      if (await indexHtml.exists()) {
        return new Response(indexHtml, {
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

if (import.meta.main) {
  console.log(`Server running at http://localhost:${server.port}`);
}

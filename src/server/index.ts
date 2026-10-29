import { handleCompaniesRoutes } from "./routes/companies";
import { handlePhotosRoutes } from "./routes/photos";
import path from "path";

export const server = Bun.serve({
  port: Number(process.env.PORT) || 3000,
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

    // 4. Servir uploads de fotos (/uploads/*)
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

    // 5. Servir arquivos estáticos do frontend (dist/) se compilado
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

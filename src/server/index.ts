import { handleCompaniesRoutes } from "./routes/companies";

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

    return new Response("Not Found", { status: 404 });
  },
});

if (import.meta.main) {
  console.log(`Server running at http://localhost:${server.port}`);
}

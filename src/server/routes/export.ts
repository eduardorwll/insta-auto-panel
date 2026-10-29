import { generateCanvaCsv } from "../services/export/canva";

export async function handleExportRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. GET /api/export/canva?scheduleId=...&companyId=...
  if (req.method === "GET" && pathname === "/api/export/canva") {
    const scheduleId = url.searchParams.get("scheduleId");
    const companyId = url.searchParams.get("companyId");

    if (!scheduleId || !companyId) {
      return Response.json(
        { success: false, error: "scheduleId e companyId são obrigatórios." },
        { status: 400 }
      );
    }

    try {
      const { filename, csvContent } = await generateCanvaCsv(scheduleId, companyId);

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar CSV para Canva";
      return Response.json({ success: false, error: msg }, { status: 500 });
    }
  }

  return null;
}

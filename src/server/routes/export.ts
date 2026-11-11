import {
  enqueuePostForAutoSocial,
  enqueueScheduleForAutoSocial,
  getAutoSocialQueueStatus,
  reconcileAutoSocialQueueWithDb,
} from "../services/export/autosocial";

export async function handleExportRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. POST /api/export/autosocial/queue
  if (req.method === "POST" && pathname === "/api/export/autosocial/queue") {
    try {
      const body = await req.json();
      const { postId, scheduleId } = body;

      if (!postId && !scheduleId) {
        return Response.json(
          { success: false, error: "postId ou scheduleId é obrigatório." },
          { status: 400 }
        );
      }

      if (postId) {
        const result = await enqueuePostForAutoSocial(postId);
        return Response.json({
          success: true,
          queuedCount: 1,
          files: result.files,
        });
      }

      if (scheduleId) {
        const result = await enqueueScheduleForAutoSocial(scheduleId);
        return Response.json(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enfileirar no AutoSocial";
      return Response.json({ success: false, error: msg }, { status: 500 });
    }
  }

  // 3. GET /api/export/autosocial/status?companyId=...
  if (req.method === "GET" && pathname === "/api/export/autosocial/status") {
    const companyId = url.searchParams.get("companyId");
    if (!companyId) {
      return Response.json(
        { success: false, error: "companyId é obrigatório." },
        { status: 400 }
      );
    }

    try {
      await reconcileAutoSocialQueueWithDb(companyId);
      const status = await getAutoSocialQueueStatus(companyId);
      return Response.json({ success: true, data: status });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao verificar status da fila";
      return Response.json({ success: false, error: msg }, { status: 500 });
    }
  }

  return null;
}

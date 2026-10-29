export const server = Bun.serve({
  port: Number(process.env.PORT) || 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        app: "Social Panel PRO",
        timestamp: new Date().toISOString(),
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

if (import.meta.main) {
  console.log(`Server running at http://localhost:${server.port}`);
}

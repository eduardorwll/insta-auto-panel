import { describe, expect, it } from "bun:test";
import { server } from "@/server/index";

describe("Health Check API", () => {
  it("GET /api/health deve retornar status ok e timestamp", async () => {
    const req = new Request(`http://localhost:${server.port}/api/health`);
    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; app: string; timestamp: string };
    expect(body.status).toBe("ok");
    expect(body.app).toBe("Social Panel");
    expect(body.timestamp).toBeDefined();
  });

  it("GET rota inexistente deve retornar 404", async () => {
    const req = new Request(`http://localhost:${server.port}/api/rota-inexistente`);
    const res = await server.fetch(req);
    expect(res.status).toBe(404);
  });
});

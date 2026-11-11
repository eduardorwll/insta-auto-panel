import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { handleSchedulesRoutes } from "../../src/server/routes/schedules";
import { handlePhotosRoutes } from "../../src/server/routes/photos";
import { db } from "../../src/server/db/client";
import { companies, weekly_schedules, posts, post_slides, photo_assets } from "../../src/server/db/schema";
import { eq } from "drizzle-orm";

const companyId = "test_co_m13";
const weekStartDate = "2026-11-09";

async function cleanup() {
  const ps = await db.select({ id: posts.id }).from(posts).where(eq(posts.companyId, companyId));
  for (const p of ps) await db.delete(post_slides).where(eq(post_slides.postId, p.id));
  await db.delete(posts).where(eq(posts.companyId, companyId));
  await db.delete(weekly_schedules).where(eq(weekly_schedules.companyId, companyId));
  await db.delete(photo_assets).where(eq(photo_assets.companyId, companyId));
  await db.delete(companies).where(eq(companies.id, companyId));
}

async function call(method: string, path: string, body?: unknown) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const url = new URL(req.url);
  const res = (await handleSchedulesRoutes(req, url)) ?? (await handlePhotosRoutes(req, url));
  return { status: res!.status, json: await res!.json() };
}

describe("Marco M13: integridade transacional e chave natural", () => {
  beforeAll(async () => {
    await cleanup();
    await db.insert(companies).values({
      id: companyId, name: "M13", instagramHandle: "@m13", niche: "x", toneOfVoice: "y",
    });
  });
  afterAll(cleanup);

  it("GET concorrente do mesmo cronograma converge sem duplicar", async () => {
    const r = await Promise.all(
      [1, 2, 3].map(() => call("GET", `/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`))
    );
    expect(r.every((x) => x.status === 200)).toBe(true);
    const all = await db.select().from(weekly_schedules).where(eq(weekly_schedules.companyId, companyId));
    expect(all.length).toBe(1);
    expect(r[0]!.json.data.posts.length).toBe(7);
  });

  it("reduzir slideCount poda lâminas excedentes", async () => {
    const g = await call("GET", `/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`);
    const postId = g.json.data.posts[0].id;
    const up = await call("PUT", `/api/posts/${postId}`, { slideCount: 3 });
    expect(up.status).toBe(200);
    const rows = await db.select().from(post_slides).where(eq(post_slides.postId, postId));
    expect(rows.length).toBe(3);
    expect(Math.max(...rows.map((r) => r.slideNumber))).toBe(3);
  });

  it("slide com id temporário salva por (postId, slideNumber) no PUT atômico", async () => {
    const g = await call("GET", `/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`);
    const postId = g.json.data.posts[1].id;
    const up = await call("PUT", `/api/posts/${postId}`, {
      slideCount: 7,
      slides: [{ id: "temp_slide_abc", slideNumber: 7, title: "Novo", bodyText: "Texto novo", ctaText: null }],
    });
    expect(up.status).toBe(200);
    const s7 = up.json.data.slides.find((s: { slideNumber: number }) => s.slideNumber === 7);
    expect(s7.bodyText).toBe("Texto novo");
  });

  it("não altera lâmina de outro post mesmo com id válido (escopo composto)", async () => {
    const g = await call("GET", `/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`);
    const [a, b] = g.json.data.posts;
    const foreign = b.slides[0].id;
    await call("PUT", `/api/posts/${a.id}/slides`, { slides: [{ id: foreign, title: "HACK" }] });
    const [row] = await db.select().from(post_slides).where(eq(post_slides.id, foreign));
    expect(row!.title).not.toBe("HACK");
  });

  it("transição de status inválida retorna 409", async () => {
    const g = await call("GET", `/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`);
    const postId = g.json.data.posts[2].id;
    const r = await call("PUT", `/api/posts/${postId}`, { status: "published" });
    expect(r.status).toBe(409);
  });

  it("excluir foto limpa selectedPhotoIds e timesUsed é recalculado", async () => {
    const g = await call("GET", `/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`);
    const post = g.json.data.posts[3];
    await db.insert(photo_assets).values({
      id: "ph_m13", companyId, filename: "none.jpg", originalName: "none.jpg", filePath: "/x", category: "Produto",
    });
    await call("PUT", `/api/posts/${post.id}`, {
      selectedPhotoIds: ["ph_m13"],
      slides: [{ id: post.slides[0].id, slideNumber: 1, assignedPhotoId: "ph_m13" }],
    });
    const [ph] = await db.select().from(photo_assets).where(eq(photo_assets.id, "ph_m13"));
    expect(ph!.timesUsed).toBe(1);

    const del = await call("DELETE", `/api/photos/ph_m13`);
    expect(del.status).toBe(200);
    const [p] = await db.select().from(posts).where(eq(posts.id, post.id));
    expect(JSON.parse(p!.selectedPhotoIds || "[]")).not.toContain("ph_m13");
  });
});

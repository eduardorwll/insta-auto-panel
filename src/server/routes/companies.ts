import { db } from "../db/client";
import { companies, company_post_types, companyInsertSchema } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import {
  extractStyleBlueprint,
  listCompanyPostTypes,
} from "../services/design/blueprint-extractor";

const companyUpdateSchema = companyInsertSchema.partial().omit({ id: true });

export async function handleCompaniesRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  if (pathname === "/api/companies" || pathname.startsWith("/api/companies/")) {
    const parts = pathname.split("/").filter(Boolean);
    const companyId = parts[2]; // /api/companies/:id
    const subResource = parts[3]; // 'post-types'
    const subResourceId = parts[4]; // ':typeId'

    // Sub-recurso Marco M11: /api/companies/:id/post-types
    if (companyId && subResource === "post-types") {
      if (req.method === "GET") {
        const types = await listCompanyPostTypes(companyId);
        return Response.json({ success: true, data: types });
      }
      if (req.method === "POST") {
        try {
          const body = (await req.json()) as {
            name?: string;
            formatId?: string;
            styleDescription?: string;
            referenceImageUrls?: string[];
            isDefault?: boolean;
          };
          const extracted = await extractStyleBlueprint({
            companyId,
            name: body.name || "Carrossel Editorial Padrão",
            formatId: body.formatId || "carousel_feed",
            styleDescription: body.styleDescription,
            referenceImageUrls: body.referenceImageUrls,
            saveAsPostType: true,
            isDefault: Boolean(body.isDefault),
          });
          return Response.json({ success: true, data: extracted.postType }, { status: 201 });
        } catch (err) {
          return Response.json(
            { success: false, error: err instanceof Error ? err.message : "Erro ao criar tipo de post" },
            { status: 400 }
          );
        }
      }
      if (req.method === "DELETE" && subResourceId) {
        await db
          .delete(company_post_types)
          .where(
            and(
              eq(company_post_types.id, subResourceId),
              eq(company_post_types.companyId, companyId)
            )
          );
        return Response.json({ success: true });
      }
    }

    // 1. GET /api/companies
    if (req.method === "GET" && !companyId) {
      const list = await db.select().from(companies).orderBy(desc(companies.createdAt));
      return Response.json({ success: true, data: list });
    }

    // 2. GET /api/companies/:id
    if (req.method === "GET" && companyId) {
      const [found] = await db.select().from(companies).where(eq(companies.id, companyId));
      if (!found) {
        return Response.json({ success: false, error: "Empresa não encontrada" }, { status: 404 });
      }
      return Response.json({ success: true, data: found });
    }

    // 3. POST /api/companies
    if (req.method === "POST" && !companyId) {
      try {
        const body = await req.json();
        const parsed = companyInsertSchema.parse(body);

        const [existing] = await db.select().from(companies).where(eq(companies.id, parsed.id));
        if (existing) {
          return Response.json({ success: false, error: "Slug de empresa já existente" }, { status: 409 });
        }

        await db.insert(companies).values(parsed);
        const [created] = await db.select().from(companies).where(eq(companies.id, parsed.id));
        return Response.json({ success: true, data: created }, { status: 201 });
      } catch (err: unknown) {
        if (err instanceof z.ZodError) {
          return Response.json({ success: false, error: "Dados inválidos", details: err.format() }, { status: 400 });
        }
        const message = err instanceof Error ? err.message : "Erro interno";
        return Response.json({ success: false, error: message }, { status: 500 });
      }
    }

    // 4. PUT /api/companies/:id
    if (req.method === "PUT" && companyId) {
      try {
        const body = await req.json();
        const parsed = companyUpdateSchema.parse(body);

        const [existing] = await db.select().from(companies).where(eq(companies.id, companyId));
        if (!existing) {
          return Response.json({ success: false, error: "Empresa não encontrada" }, { status: 404 });
        }

        await db.update(companies).set(parsed).where(eq(companies.id, companyId));
        const [updated] = await db.select().from(companies).where(eq(companies.id, companyId));
        return Response.json({ success: true, data: updated });
      } catch (err: unknown) {
        if (err instanceof z.ZodError) {
          return Response.json({ success: false, error: "Dados inválidos", details: err.format() }, { status: 400 });
        }
        const message = err instanceof Error ? err.message : "Erro interno";
        return Response.json({ success: false, error: message }, { status: 500 });
      }
    }

    // 5. DELETE /api/companies/:id
    if (req.method === "DELETE" && companyId) {
      const [existing] = await db.select().from(companies).where(eq(companies.id, companyId));
      if (!existing) {
        return Response.json({ success: false, error: "Empresa não encontrada" }, { status: 404 });
      }

      await db.delete(companies).where(eq(companies.id, companyId));
      return Response.json({ success: true, message: "Empresa excluída com sucesso" });
    }
  }

  return null;
}

import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import {
  companies,
  weekly_schedules,
  posts,
  post_slides,
  photo_assets,
} from "@/server/db/schema";
import { AIProviderFactory } from "@/server/services/ai/factory";
import { eq } from "drizzle-orm";

describe("IA Generativa Multi-Tenant: Sugestão de Horário e Acervo de Fotos Estrito", () => {
  const testCompanyId = "company_ai_photos_test";
  let postId = "";

  beforeAll(async () => {
    await db.delete(companies).where(eq(companies.id, testCompanyId));
    await db.insert(companies).values({
      id: testCompanyId,
      name: "Odonto Laser",
      instagramHandle: "@odontolaser",
      niche: "Odontologia Estética",
      toneOfVoice: "Autoridade e Acolhimento",
      whatsappNumber: "5511999887766",
    });

    // Foto do tenant
    await db.insert(photo_assets).values({
      id: "photo_odonto_laser_1",
      companyId: testCompanyId,
      filename: "procedimento_laser.jpg",
      originalName: "Clareamento a Laser",
      filePath: "/uploads/procedimento_laser.jpg",
      category: "Produto",
      tags: JSON.stringify(["laser", "sorriso"]),
    });

    const schedId = `sched_${testCompanyId}_20261109`;
    await db.delete(weekly_schedules).where(eq(weekly_schedules.id, schedId));
    await db.insert(weekly_schedules).values({
      id: schedId,
      companyId: testCompanyId,
      weekStartDate: "2026-11-09",
    });

    postId = `post_${schedId}_terca`;
    await db.insert(posts).values({
      id: postId,
      scheduleId: schedId,
      companyId: testCompanyId,
      dayOfWeek: "terca",
      theme: "Tema a definir",
      category: "Dica Prática",
      slideCount: 5,
      status: "draft",
      scheduledTime: "09:00",
    });

    for (let i = 1; i <= 5; i++) {
      await db.insert(post_slides).values({
        id: `slide_${postId}_${i}`,
        postId,
        slideNumber: i,
        title: `Slide ${i}`,
        bodyText: `Texto ${i}`,
      });
    }
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, testCompanyId));
  });

  it("POST /api/ai/generate-post deve repassar fotos do tenant e salvar suggestedTime e assignedPhotoId", async () => {
    // Interceptar o provider da factory temporariamente
    const originalGetForCompany = AIProviderFactory.getForCompany;
    let receivedParams: any = null;

    AIProviderFactory.getForCompany = async () => {
      return {
        settings: { id: "mock", provider: "gemini", modelName: "gemini-2.5-flash" },
        testConnection: async () => ({ success: true, message: "OK" }),
        generate: async (params: any) => {
          receivedParams = params;
          return {
            suggestedTheme: "Clareamento a Laser: Mitos e Verdades",
            suggestedCategory: "Autoridade",
            suggestedTime: "19:30",
            caption: "Tudo o que você precisa saber sobre o clareamento a laser! #odontologia",
            slides: [
              {
                slideNumber: 1,
                title: "O Laser Danifica os Dentes?",
                bodyText: "Descubra a verdade científica sobre o procedimento.",
                suggestedPhotoId: "photo_odonto_laser_1",
              },
              {
                slideNumber: 2,
                title: "Como Funciona",
                bodyText: "A luz ativa as moléculas clareadoras sem desgastar o esmalte.",
                suggestedPhotoId: null,
              },
              {
                slideNumber: 3,
                title: "Duração dos Resultados",
                bodyText: "Em média de 1 a 3 anos com bons hábitos.",
                suggestedPhotoId: null,
              },
              {
                slideNumber: 4,
                title: "Cuidados Pós-Aplicação",
                bodyText: "Evite café e vinho nas primeiras 48 horas.",
                suggestedPhotoId: null,
              },
              {
                slideNumber: 5,
                title: "Agende sua Avaliação",
                bodyText: "Clique no link da bio para conversar com nossa equipe.",
                ctaText: "Enviar WhatsApp",
                suggestedPhotoId: null,
              },
            ],
          };
        },
      } as any;
    };

    try {
      const req = new Request(`http://localhost:${server.port}/api/ai/generate-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const res = await server.fetch(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);

      // Valida que os parâmetros enviados à IA continham dados da empresa e fotos exclusivamente do tenant
      expect(receivedParams).toBeDefined();
      expect(receivedParams.company.name).toBe("Odonto Laser");
      expect(receivedParams.photos.length).toBe(1);
      expect(receivedParams.photos[0].id).toBe("photo_odonto_laser_1");

      // Valida que o post foi atualizado com o tema sugerido e horário sugerido
      expect(json.data.theme).toBe("Clareamento a Laser: Mitos e Verdades");
      expect(json.data.scheduledTime).toBe("19:30");
      expect(json.data.category).toBe("Autoridade");

      // Valida que o Slide 1 recebeu a foto atribuída
      const slide1 = json.data.slides.find((s: any) => s.slideNumber === 1);
      expect(slide1.title).toBe("O Laser Danifica os Dentes?");
      expect(slide1.assignedPhotoId).toBe("photo_odonto_laser_1");
    } finally {
      AIProviderFactory.getForCompany = originalGetForCompany;
    }
  });
});

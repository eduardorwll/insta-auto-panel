import { describe, expect, it } from "bun:test";
import { getFormatSpec, POST_FORMATS } from "@/shared/post-formats";
import { renderOpenDesignSlideSvg } from "@/server/services/design/template-engine";

describe("M9-T3: Abstração Multi-Formato PostFormatRegistry (Feed Carousels + Stories 9:16)", () => {
  it("deve registrar os formatos carousel_feed (4:5), carousel_square (1:1) e story_vertical (9:16) com safeZones", () => {
    const feed = getFormatSpec("carousel_feed");
    expect(feed.width).toBe(1080);
    expect(feed.height).toBe(1350);
    expect(feed.aspectRatio).toBe("4:5");
    expect(feed.minSlides).toBe(3);
    expect(feed.maxSlides).toBe(10);

    const story = getFormatSpec("story_vertical");
    expect(story.width).toBe(1080);
    expect(story.height).toBe(1920);
    expect(story.aspectRatio).toBe("9:16");
    expect(story.safeZones.top).toBeGreaterThanOrEqual(220);
    expect(story.safeZones.bottom).toBeGreaterThanOrEqual(300);

    expect(Object.keys(POST_FORMATS)).toEqual([
      "carousel_feed",
      "carousel_square",
      "story_vertical",
    ]);
  });

  it("renderOpenDesignSlideSvg deve adaptar o viewBox dinamicamente para carousel_feed (1080x1350) e story_vertical (1080x1920)", () => {
    const baseFields = {
      templateId: "modern-bold" as const,
      slideNumber: 1,
      totalSlides: 5,
      headline: "Sua Saúde Não Precisa Esperar",
      bodyText: "Pequenas escolhas feitas hoje transformam sua rotina.",
      ctaText: "Envie mensagem no Direct ou acesse o link na bio!",
      brandKit: {
        companyName: "Etiene Rewell | Nutricionista",
        instagramHandle: "@etienerewell",
        primaryColor: "#C58B6B",
        secondaryColor: "#5C6843",
        backgroundColor: "#F5ECE2",
        accentColor: "#5C6843",
      },
    };

    const feedSvg = renderOpenDesignSlideSvg(baseFields);
    expect(feedSvg).toContain('width="1080" height="1350" viewBox="0 0 1080 1350"');

    const storySvg = renderOpenDesignSlideSvg({
      ...baseFields,
      formatId: "story_vertical",
    });
    expect(storySvg).toContain('width="1080" height="1920" viewBox="0 0 1080 1920"');
  });
});

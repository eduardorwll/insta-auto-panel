import { describe, expect, it } from "bun:test";
import { normalizeCaption, auditPost } from "@/server/services/ai/seo-quality";

describe("Instagram SEO Quality Gate (MATCH)", () => {
  it("normalizeCaption remove a frase inteira que contém URL, sem deixar texto quebrado", () => {
    const out = normalizeCaption(
      "Dicas valiosas para seu negócio. Acesse https://wa.me/5511999991234 para falar conosco. Salve este post."
    );
    expect(out).not.toMatch(/wa\.me|https?:/i);
    expect(out).toContain("Dicas valiosas para seu negócio.");
    expect(out).toContain("Salve este post.");
    expect(out).not.toContain("Acesse");
    expect(out).not.toContain("para falar conosco");
  });

  it("normalizeCaption limita a 5 hashtags preservando as primeiras", () => {
    const out = normalizeCaption("Texto. #a #b #c #d #e #f #g");
    const tags = out.match(/#\w+/g) ?? [];
    expect(tags).toEqual(["#a", "#b", "#c", "#d", "#e"]);
  });

  it("auditPost sinaliza hashtags fora de 3-5, keyword ausente na abertura e falta de alt text", () => {
    const warnings = auditPost({
      caption: "Texto genérico sem a palavra principal logo no começo. #a #b",
      altText: null,
      keywordCluster: ["clareamento dental seguro", "estetica dental"],
    });
    expect(warnings.join("|")).toMatch(/hashtag/i);
    expect(warnings.join("|")).toMatch(/palavra-chave/i);
    expect(warnings.join("|")).toMatch(/alt/i);
  });

  it("auditPost não acusa keyword quando está na abertura (ignorando acentos/caixa)", () => {
    const warnings = auditPost({
      caption:
        "Clareamento dental seguro em consultório: veja o passo a passo. #clareamento #odonto #sorriso",
      altText: "Paciente em clareamento dental seguro",
      keywordCluster: ["Clareamento Dental Seguro"],
    });
    expect(warnings.some((w) => /palavra-chave/i.test(w))).toBe(false);
    expect(warnings.some((w) => /hashtag/i.test(w))).toBe(false);
    expect(warnings.some((w) => /alt/i.test(w))).toBe(false);
  });
});

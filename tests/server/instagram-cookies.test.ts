import { describe, expect, it } from "bun:test";
import { parseInstagramCookiesInput } from "../../src/server/services/instagram/cookies";

describe("Instagram Cookies Parser & Normalizer (instagram/cookies.ts)", () => {
  it("deve parsear JSON no formato Cookie-Editor / EditThisCookie", () => {
    const rawJson = JSON.stringify([
      { name: "sessionid", value: "987654321%3Aabc123xyz", domain: ".instagram.com", path: "/" },
      { name: "csrftoken", value: "csrf_token_value_abc", domain: ".instagram.com", path: "/" },
      { name: "ds_user_id", value: "987654321", domain: ".instagram.com", path: "/" },
      { name: "mid", value: "mid_value_123", domain: ".instagram.com", path: "/" },
    ]);

    const result = parseInstagramCookiesInput({ cookiesJson: rawJson });

    expect(result.sessionId).toBe("987654321%3Aabc123xyz");
    expect(result.csrfToken).toBe("csrf_token_value_abc");
    expect(result.dsUserId).toBe("987654321");
    expect(result.normalizedCookies.length).toBe(4);
  });

  it("deve parsear JSON no formato Playwright storageState ({ cookies: [...] })", () => {
    const playwrightJson = JSON.stringify({
      cookies: [
        { name: "sessionid", value: "11223344:session_val", domain: ".instagram.com" },
        { name: "csrftoken", value: "csrf_pw_val", domain: ".instagram.com" },
      ],
    });

    const result = parseInstagramCookiesInput({ cookiesJson: playwrightJson });

    expect(result.sessionId).toBe("11223344:session_val");
    expect(result.csrfToken).toBe("csrf_pw_val");
    // Deve extrair dsUserId do prefixo do sessionid
    expect(result.dsUserId).toBe("11223344");
  });

  it("deve aceitar campos diretos caso o JSON não seja fornecido", () => {
    const result = parseInstagramCookiesInput({
      sessionId: "555666777%3Adirect_val",
      csrfToken: "direct_csrf",
      dsUserId: "555666777",
    });

    expect(result.sessionId).toBe("555666777%3Adirect_val");
    expect(result.csrfToken).toBe("direct_csrf");
    expect(result.dsUserId).toBe("555666777");
    expect(result.normalizedCookies.some((c) => c.name === "sessionid")).toBeTrue();
  });

  it("deve lançar erro descritivo quando JSON de cookies for sintaticamente inválido", () => {
    expect(() =>
      parseInstagramCookiesInput({ cookiesJson: "{invalid json" })
    ).toThrow("O JSON de cookies fornecido é inválido");
  });
});

import { describe, test, expect } from "bun:test";
import { getMondayLocal, addDaysLocal, parseLocalYmd } from "../../src/shared/calendar-dates";
import {
  normalizePostStatus,
  canTransitionPostStatus,
  assertPostTransition,
} from "../../src/shared/state-machines/post-lifecycle.machine";
import { evaluateInstagramSessionState } from "../../src/shared/state-machines/instagram-session.machine";
import { BoundedTtlMap } from "../../src/shared/state-machines/bounded-ttl-map";

describe("calendar-dates", () => {
  test("segunda local sem desvio UTC (domingo 23:30 local)", () => {
    expect(getMondayLocal(new Date(2026, 0, 11, 23, 30))).toBe("2026-01-05");
    expect(getMondayLocal(new Date(2026, 0, 5, 0, 10))).toBe("2026-01-05");
    expect(getMondayLocal("2026-01-07")).toBe("2026-01-05");
  });
  test("addDaysLocal cruza mês/ano", () => {
    expect(addDaysLocal("2025-12-29", 7)).toBe("2026-01-05");
    expect(addDaysLocal("2026-01-05", -7)).toBe("2025-12-29");
  });
  test("parseLocalYmd rejeita formato inválido", () => {
    expect(() => parseLocalYmd("05/01/2026")).toThrow();
  });
});

describe("post lifecycle", () => {
  test("normaliza posted -> published e desconhecido -> draft", () => {
    expect(normalizePostStatus("posted")).toBe("published");
    expect(normalizePostStatus("xyz")).toBe("draft");
    expect(normalizePostStatus(null)).toBe("draft");
  });
  test("guards", () => {
    expect(canTransitionPostStatus("queued", "published")).toBe(true);
    expect(canTransitionPostStatus("queued", "failed")).toBe(true);
    expect(canTransitionPostStatus("published", "draft")).toBe(false);
    expect(canTransitionPostStatus("draft", "published")).toBe(false);
    expect(() => assertPostTransition("draft", "published")).toThrow();
    expect(assertPostTransition("posted", "published")).toBe("published");
  });
});

describe("instagram session", () => {
  const now = 1_800_000_000;
  test("estados", () => {
    expect(evaluateInstagramSessionState(null, now)).toBe("unconfigured");
    expect(evaluateInstagramSessionState([{ name: "csrftoken", value: "a" }], now)).toBe("unconfigured");
    expect(evaluateInstagramSessionState([{ name: "sessionid", value: "a", expires: now - 5 }], now)).toBe("expired");
    expect(evaluateInstagramSessionState([{ name: "sessionid", value: "a", expires: now + 5 }], now)).toBe("active");
    expect(evaluateInstagramSessionState([{ name: "sessionid", value: "a", expires: -1 }], now)).toBe("active");
  });
});

describe("BoundedTtlMap", () => {
  test("limite e TTL", () => {
    const m = new BoundedTtlMap<number>(2, 100);
    m.set("a", 1, 0);
    m.set("b", 2, 0);
    m.set("c", 3, 10);
    expect(m.size).toBe(2);
    expect(m.get("a", 10)).toBeUndefined();
    expect(m.get("c", 10)).toBe(3);
    expect(m.get("c", 500)).toBeUndefined();
  });
});

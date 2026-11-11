import { describe, test, expect } from "bun:test";
import { authBootReducer } from "../../src/shared/state-machines/auth-boot.machine";
import {
  studioWorkflowReducer,
  isStudioOpActive,
  type StudioWorkflowState,
} from "../../src/shared/state-machines/studio-workflow.machine";

describe("auth boot FSM", () => {
  test("bootstrapping resolve conforme /api/auth/me", () => {
    expect(authBootReducer("bootstrapping", { type: "ME_RESOLVED", authRequired: true, authenticated: false })).toBe("unauthenticated");
    expect(authBootReducer("bootstrapping", { type: "ME_RESOLVED", authRequired: true, authenticated: true })).toBe("authenticated");
    expect(authBootReducer("bootstrapping", { type: "ME_RESOLVED", authRequired: false, authenticated: false })).toBe("authenticated");
    expect(authBootReducer("bootstrapping", { type: "ME_FAILED" })).toBe("authenticated");
  });
  test("login e lock só valem nos estados corretos", () => {
    expect(authBootReducer("bootstrapping", { type: "LOGIN_SUCCESS" })).toBe("bootstrapping");
    expect(authBootReducer("bootstrapping", { type: "LOCK" })).toBe("bootstrapping");
    expect(authBootReducer("unauthenticated", { type: "LOGIN_SUCCESS" })).toBe("authenticated");
    expect(authBootReducer("authenticated", { type: "LOCK" })).toBe("unauthenticated");
    expect(authBootReducer("authenticated", { type: "ME_RESOLVED", authRequired: true, authenticated: false })).toBe("authenticated");
  });
});

describe("studio workflow FSM", () => {
  const idle: StudioWorkflowState = { phase: "idle" };
  test("apenas uma operação por vez", () => {
    const busy = studioWorkflowReducer(idle, { type: "START", op: "rendering", postId: "p1" });
    expect(isStudioOpActive(busy, "rendering")).toBe(true);
    const still = studioWorkflowReducer(busy, { type: "START", op: "saving", postId: "p1" });
    expect(still).toEqual(busy);
  });
  test("FINISH exige a mesma operação; salvar ok -> saved", () => {
    const busy = studioWorkflowReducer(idle, { type: "START", op: "saving", postId: "p1" });
    expect(studioWorkflowReducer(busy, { type: "FINISH", op: "rendering", ok: true })).toEqual(busy);
    expect(studioWorkflowReducer(busy, { type: "FINISH", op: "saving", ok: true })).toEqual({ phase: "saved" });
    expect(studioWorkflowReducer(busy, { type: "FINISH", op: "saving", ok: false })).toEqual(idle);
  });
  test("saved libera nova operação e CLEAR_SAVED volta a idle", () => {
    const saved: StudioWorkflowState = { phase: "saved" };
    expect(studioWorkflowReducer(saved, { type: "START", op: "generating_ai", postId: null }).phase).toBe("busy");
    expect(studioWorkflowReducer(saved, { type: "CLEAR_SAVED" })).toEqual(idle);
  });
});

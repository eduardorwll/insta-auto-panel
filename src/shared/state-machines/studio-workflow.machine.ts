/**
 * FSM do fluxo do Studio Visual: substitui 7 booleans concorrentes
 * (isRendering, isGeneratingBg, isGeneratingAI, isSaving, saveSuccess, isAddingPost, isDeletingPost).
 * Apenas UMA operação assíncrona por vez; respostas são vinculadas ao `postId` de origem.
 */
export type StudioOp =
  | "saving"
  | "rendering"
  | "generating_ai"
  | "generating_bg"
  | "adding_post"
  | "deleting_post";

export type StudioWorkflowState =
  | { phase: "idle" }
  | { phase: "busy"; op: StudioOp; postId: string | null }
  | { phase: "saved" };

export type StudioWorkflowEvent =
  | { type: "START"; op: StudioOp; postId: string | null }
  | { type: "FINISH"; op: StudioOp; ok: boolean }
  | { type: "CLEAR_SAVED" }
  | { type: "RESET" };

export function canStartStudioOp(state: StudioWorkflowState): boolean {
  return state.phase !== "busy";
}

export function studioWorkflowReducer(
  state: StudioWorkflowState,
  event: StudioWorkflowEvent
): StudioWorkflowState {
  switch (event.type) {
    case "START":
      return canStartStudioOp(state)
        ? { phase: "busy", op: event.op, postId: event.postId }
        : state;
    case "FINISH":
      if (state.phase !== "busy" || state.op !== event.op) return state;
      return event.op === "saving" && event.ok ? { phase: "saved" } : { phase: "idle" };
    case "CLEAR_SAVED":
      return state.phase === "saved" ? { phase: "idle" } : state;
    case "RESET":
      return { phase: "idle" };
  }
}

export function isStudioOpActive(state: StudioWorkflowState, op: StudioOp): boolean {
  return state.phase === "busy" && state.op === op;
}

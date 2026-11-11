import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  studioWorkflowReducer,
  isStudioOpActive,
  canStartStudioOp,
  type StudioOp,
  type StudioWorkflowState,
} from "@/shared/state-machines/studio-workflow.machine";

/**
 * Hook do FSM do Studio. `tryStart` é síncrono (ref espelho) para bloquear duplo clique
 * antes do próximo render; expõe booleanos derivados só para compatibilidade com a UI.
 */
export function useStudioWorkflowMachine() {
  const [state, dispatch] = useReducer(studioWorkflowReducer, { phase: "idle" } as StudioWorkflowState);
  const stateRef = useRef<StudioWorkflowState>(state);

  const tryStart = useCallback((op: StudioOp, postId: string | null): boolean => {
    if (!canStartStudioOp(stateRef.current)) return false;
    stateRef.current = { phase: "busy", op, postId };
    dispatch({ type: "START", op, postId });
    return true;
  }, []);

  const finish = useCallback((op: StudioOp, ok = true) => {
    const cur = stateRef.current;
    if (cur.phase === "busy" && cur.op === op) {
      stateRef.current = op === "saving" && ok ? { phase: "saved" } : { phase: "idle" };
    }
    dispatch({ type: "FINISH", op, ok });
  }, []);

  useEffect(() => {
    stateRef.current = state;
    if (state.phase !== "saved") return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_SAVED" }), 3000);
    return () => clearTimeout(t);
  }, [state]);

  return {
    state,
    tryStart,
    finish,
    isBusy: state.phase === "busy",
    isSaving: isStudioOpActive(state, "saving"),
    saveSuccess: state.phase === "saved",
    isRendering: isStudioOpActive(state, "rendering"),
    isGeneratingAI: isStudioOpActive(state, "generating_ai"),
    isGeneratingBg: isStudioOpActive(state, "generating_bg"),
    isAddingPost: isStudioOpActive(state, "adding_post"),
    isDeletingPost: isStudioOpActive(state, "deleting_post"),
  };
}

/**
 * FSM de boot de autenticação do painel.
 * bootstrapping -> (authenticated | unauthenticated); unauthenticated <-> authenticated via login/lock.
 * Nenhum componente autenticado é montado enquanto o estado for `bootstrapping`.
 */
export type AuthBootState = "bootstrapping" | "authenticated" | "unauthenticated";

export type AuthBootEvent =
  | { type: "ME_RESOLVED"; authRequired: boolean; authenticated: boolean }
  | { type: "ME_FAILED" }
  | { type: "LOGIN_SUCCESS" }
  | { type: "LOCK" };

export function authBootReducer(state: AuthBootState, event: AuthBootEvent): AuthBootState {
  switch (event.type) {
    case "ME_RESOLVED":
      if (state !== "bootstrapping") return state;
      return event.authRequired && !event.authenticated ? "unauthenticated" : "authenticated";
    case "ME_FAILED":
      // Sem resposta do servidor: assume sessão livre (mesmo comportamento anterior), mas explícito.
      return state === "bootstrapping" ? "authenticated" : state;
    case "LOGIN_SUCCESS":
      return state === "unauthenticated" ? "authenticated" : state;
    case "LOCK":
      return state === "authenticated" ? "unauthenticated" : state;
  }
}

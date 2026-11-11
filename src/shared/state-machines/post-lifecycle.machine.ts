/**
 * Máquina de estados explícita do ciclo de vida de `posts.status`.
 * `"posted"` (legado) é normalizado para `"published"`.
 */
export const POST_STATUSES = [
  "draft",
  "ai_generated",
  "ready_design",
  "queued",
  "published",
  "failed",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_TRANSITIONS: Record<PostStatus, readonly PostStatus[]> = {
  draft: ["ai_generated", "ready_design", "queued"],
  ai_generated: ["draft", "ready_design", "queued"],
  ready_design: ["draft", "ai_generated", "queued"],
  queued: ["published", "failed", "ready_design", "draft"],
  published: [],
  failed: ["queued", "ready_design", "draft"],
};

export function normalizePostStatus(raw: string | null | undefined): PostStatus {
  if (raw === "posted") return "published";
  return (POST_STATUSES as readonly string[]).includes(raw ?? "") ? (raw as PostStatus) : "draft";
}

export function canTransitionPostStatus(from: PostStatus, to: PostStatus): boolean {
  return from === to || POST_STATUS_TRANSITIONS[from].includes(to);
}

export function assertPostTransition(fromRaw: string | null | undefined, to: PostStatus): PostStatus {
  const from = normalizePostStatus(fromRaw);
  if (!canTransitionPostStatus(from, to)) {
    throw new Error(`Transição de status inválida: ${from} -> ${to}`);
  }
  return to;
}

export function isPublishedStatus(s: string | null | undefined): boolean {
  return normalizePostStatus(s) === "published";
}

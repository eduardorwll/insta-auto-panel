/**
 * Quality gate determinístico de Instagram SEO (Framework MATCH, skill `instagram-seo`).
 * Módulo puro (sem I/O): normaliza o que é seguro corrigir e audita o restante,
 * independente do modelo de IA usado (modelos locais costumam ignorar instruções do prompt).
 */

export const MIN_HASHTAGS = 3;
export const MAX_HASHTAGS = 5;
const OPENING_CHARS = 125;
const MIN_WORDS = 150;
const MAX_WORDS = 300;

const URL_PATTERN = /(https?:\/\/|www\.|wa\.me\/)\S*/i;

/** Remove acentos e caixa para comparação semântica simples. */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Links em legendas do Instagram não são clicáveis: remove a FRASE inteira que contém a URL
 * (remover só o token deixaria texto quebrado, ex.: "Acesse  para falar conosco").
 */
function dropSentencesWithUrls(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !URL_PATTERN.test(sentence))
        .join(" ")
    )
    .join("\n");
}

/** Mantém apenas as primeiras `max` hashtags (hashtags foram despriorizadas a 3–5 rótulos). */
function limitHashtags(text: string, max: number): string {
  let seen = 0;
  return text.replace(/#[\p{L}\p{N}_]+/gu, (tag) => (++seen <= max ? tag : ""));
}

export function normalizeCaption(raw: string, maxHashtags = MAX_HASHTAGS): string {
  const cleaned = limitHashtags(dropSentencesWithUrls(raw), maxHashtags)
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return cleaned;
}

export interface SeoAuditInput {
  caption: string;
  altText?: string | null;
  keywordCluster?: string[] | null;
}

export interface SeoCheck {
  id: "hashtags" | "keyword" | "length" | "alt";
  label: string;
  ok: boolean;
  /** Mensagem de orientação exibida quando o critério falha. */
  hint: string;
}

/** Aceita o JSON serializado do banco, um array ou lixo; sempre devolve string[]. */
export function parseKeywordCluster(value: unknown): string[] {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
}

/** Critérios do MATCH aplicáveis ao post (keyword só existe quando há cluster). */
export function seoChecks({ caption, altText, keywordCluster }: SeoAuditInput): SeoCheck[] {
  const checks: SeoCheck[] = [];

  const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  checks.push({
    id: "hashtags",
    label: `${MIN_HASHTAGS}–${MAX_HASHTAGS} hashtags`,
    ok: hashtags.length >= MIN_HASHTAGS && hashtags.length <= MAX_HASHTAGS,
    hint: `Use de ${MIN_HASHTAGS} a ${MAX_HASHTAGS} hashtags de nicho (atual: ${hashtags.length}).`,
  });

  const primary = keywordCluster?.find((k) => k.trim().length > 0);
  if (primary) {
    checks.push({
      id: "keyword",
      label: "Palavra-chave na abertura",
      ok: fold(caption.slice(0, OPENING_CHARS)).includes(fold(primary.trim())),
      hint: `A palavra-chave principal "${primary}" deveria aparecer nos primeiros ${OPENING_CHARS} caracteres da legenda.`,
    });
  }

  const words = caption.replace(/#[\p{L}\p{N}_]+/gu, "").split(/\s+/).filter(Boolean).length;
  checks.push({
    id: "length",
    label: `${MIN_WORDS}–${MAX_WORDS} palavras`,
    ok: words >= MIN_WORDS && words <= MAX_WORDS,
    hint: `Legenda com ${words} palavras; ideal entre ${MIN_WORDS} e ${MAX_WORDS}.`,
  });

  const hasAlt = Boolean(altText && altText.trim());
  const altHasKeyword = !primary || (hasAlt && fold(altText as string).includes(fold(primary.trim())));
  checks.push({
    id: "alt",
    label: "Alt Text com palavra-chave",
    ok: hasAlt && altHasKeyword,
    hint: hasAlt
      ? "O Alt Text deveria conter a palavra-chave principal."
      : "Preencha o Alt Text da capa (Computer Vision confere imagem x legenda).",
  });

  return checks;
}

/** Retorna avisos legíveis; lista vazia significa que o post cumpre o MATCH. */
export function auditPost(input: SeoAuditInput): string[] {
  return seoChecks(input)
    .filter((check) => !check.ok)
    .map((check) => check.hint);
}

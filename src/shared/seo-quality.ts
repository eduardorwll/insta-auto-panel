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

/** Retorna avisos legíveis; lista vazia significa que o post cumpre o MATCH. */
export function auditPost({ caption, altText, keywordCluster }: SeoAuditInput): string[] {
  const warnings: string[] = [];

  const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  if (hashtags.length < MIN_HASHTAGS || hashtags.length > MAX_HASHTAGS) {
    warnings.push(
      `Use de ${MIN_HASHTAGS} a ${MAX_HASHTAGS} hashtags de nicho (atual: ${hashtags.length}).`
    );
  }

  const primary = keywordCluster?.find((k) => k.trim().length > 0);
  if (primary && !fold(caption.slice(0, OPENING_CHARS)).includes(fold(primary.trim()))) {
    warnings.push(
      `A palavra-chave principal "${primary}" deveria aparecer nos primeiros ${OPENING_CHARS} caracteres da legenda.`
    );
  }

  const words = caption.replace(/#[\p{L}\p{N}_]+/gu, "").split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS || words > MAX_WORDS) {
    warnings.push(`Legenda com ${words} palavras; ideal entre ${MIN_WORDS} e ${MAX_WORDS}.`);
  }

  if (!altText || !altText.trim()) {
    warnings.push("Preencha o Alt Text da capa (Computer Vision confere imagem x legenda).");
  } else if (primary && !fold(altText).includes(fold(primary.trim()))) {
    warnings.push("O Alt Text deveria conter a palavra-chave principal.");
  }

  return warnings;
}

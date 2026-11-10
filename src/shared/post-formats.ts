import { z } from "zod";

export const POST_FORMAT_IDS = [
  "carousel_feed",
  "carousel_square",
  "story_vertical",
] as const;

export type PostFormatId = (typeof POST_FORMAT_IDS)[number];

export const postFormatIdSchema = z.enum(POST_FORMAT_IDS);

export interface FormatSafeZones {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface FormatSpec {
  id: PostFormatId;
  label: string;
  shortLabel: string;
  aspectRatio: "4:5" | "1:1" | "9:16";
  width: number;
  height: number;
  minSlides: number;
  maxSlides: number;
  defaultSlides: number;
  safeZones: FormatSafeZones;
  description: string;
}

export const POST_FORMATS: Record<PostFormatId, FormatSpec> = {
  carousel_feed: {
    id: "carousel_feed",
    label: "Carrossel de Feed (4:5 Vertical)",
    shortLabel: "Feed 4:5",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    minSlides: 3,
    maxSlides: 10,
    defaultSlides: 5,
    safeZones: {
      top: 90,
      bottom: 110,
      left: 80,
      right: 80,
    },
    description: "Formato principal de carrossel editorial 1080×1350px com máxima ocupação de tela no Feed.",
  },
  carousel_square: {
    id: "carousel_square",
    label: "Carrossel Quadrado (1:1 Clássico)",
    shortLabel: "Feed 1:1",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    minSlides: 3,
    maxSlides: 10,
    defaultSlides: 5,
    safeZones: {
      top: 80,
      bottom: 90,
      left: 80,
      right: 80,
    },
    description: "Carrossel simétrico 1080×1080px para grades quadradas clássicas.",
  },
  story_vertical: {
    id: "story_vertical",
    label: "Stories Vertical (9:16 Tela Cheia)",
    shortLabel: "Stories 9:16",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    minSlides: 1,
    maxSlides: 10,
    defaultSlides: 3,
    safeZones: {
      top: 250,
      bottom: 340,
      left: 80,
      right: 80,
    },
    description: "Sequência de Stories 1080×1920px com zonas seguras para barra de perfil superior e caixa de resposta inferior.",
  },
};

export function getFormatSpec(formatId?: PostFormatId | string | null): FormatSpec {
  if (formatId && formatId in POST_FORMATS) {
    return POST_FORMATS[formatId as PostFormatId];
  }
  return POST_FORMATS.carousel_feed;
}

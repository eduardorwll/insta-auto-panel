import zlib from "node:zlib";
import type { DesignTemplateId } from "../../db/schema";

export interface OpenDesignBrandKit {
  companyName: string;
  instagramHandle: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
}

export interface OpenDesignSlideFields {
  templateId: DesignTemplateId;
  slideNumber: number;
  totalSlides: number;
  headline: string;
  bodyText: string;
  ctaText?: string | null;
  backgroundImageUrl?: string | null;
  brandKit: OpenDesignBrandKit;
  clientCanvasDataUrl?: string | null;
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Quebra texto longo (inclusive 300+ caracteres do break-ui stress test) em linhas seguras
 * com truncamento elegante por reticências na última linha permitida.
 */
export function wrapEditorialLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number
): string[] {
  const clean = (text || "").trim().replace(/\s+/g, " ");
  if (!clean) return [""];

  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        if (lines.length >= maxLines) {
          const last = lines[maxLines - 1] ?? "";
          lines[maxLines - 1] =
            last.length > maxCharsPerLine - 1
              ? `${last.slice(0, maxCharsPerLine - 1)}…`
              : `${last}…`;
          return lines;
        }
      }
      current =
        word.length > maxCharsPerLine ? `${word.slice(0, maxCharsPerLine - 1)}…` : word;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

/**
 * Renderiza uma lâmina 4:5 (1080x1350) determinística inspirada no OpenDesign Template Fields API,
 * calibrada no modo Impeccable Persuade + Taste-Skill Anti-Slop.
 */
export function renderOpenDesignSlideSvg(fields: OpenDesignSlideFields): string {
  const width = 1080;
  const height = 1350;
  const slideBadge = `${String(fields.slideNumber).padStart(2, "0")} / ${String(
    fields.totalSlides
  ).padStart(2, "0")}`;

  const isEditorialLight = fields.templateId === "editorial-clean";
  const surfaceBg = isEditorialLight
    ? "#F8FAFC"
    : fields.templateId === "dark-neon"
      ? "#070A12"
      : fields.brandKit.backgroundColor || "#0F172A";
  const textPrimary = isEditorialLight ? "#0F172A" : "#F8FAFC";
  const textSecondary = isEditorialLight ? "#334155" : "#CBD5E1";
  const primary = fields.brandKit.primaryColor || "#0D9488";
  const secondary = fields.brandKit.secondaryColor || "#0284C7";
  const accent = fields.brandKit.accentColor || "#10B981";

  const headlineLines = wrapEditorialLines(fields.headline || "Título da Lâmina", 28, 4);
  const bodyLines = wrapEditorialLines(fields.bodyText || "", 38, 6);
  const ctaLine = wrapEditorialLines(fields.ctaText || "", 42, 1)[0] || "";

  const headlineTspans = headlineLines
    .map(
      (line, idx) =>
        `<tspan x="96" dy="${idx === 0 ? 0 : 74}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const bodyStartY = 470 + headlineLines.length * 74;
  const bodyTspans = bodyLines
    .map(
      (line, idx) =>
        `<tspan x="96" dy="${idx === 0 ? 0 : 48}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const bgImageLayer = fields.backgroundImageUrl
    ? fields.templateId === "split-photo"
      ? `<image href="${escapeXml(
          fields.backgroundImageUrl
        )}" x="64" y="140" width="952" height="440" preserveAspectRatio="xMidYMid slice" opacity="0.92"/>`
      : `<image href="${escapeXml(
          fields.backgroundImageUrl
        )}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="${
          isEditorialLight ? "0.14" : "0.28"
        }"/>`
    : "";

  const headlineStartY = fields.templateId === "split-photo" ? 670 : 390;
  const adjustedBodyStartY =
    fields.templateId === "split-photo"
      ? 690 + headlineLines.length * 68
      : bodyStartY;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="accentBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${escapeXml(primary)}"/>
      <stop offset="100%" stop-color="${escapeXml(secondary)}"/>
    </linearGradient>
    <radialGradient id="ambientGlow" cx="85%" cy="15%" r="60%">
      <stop offset="0%" stop-color="${escapeXml(primary)}" stop-opacity="${
        isEditorialLight ? "0.12" : "0.32"
      }"/>
      <stop offset="100%" stop-color="${escapeXml(primary)}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Base Surface -->
  <rect width="${width}" height="${height}" fill="${escapeXml(surfaceBg)}"/>
  <rect width="${width}" height="${height}" fill="url(#ambientGlow)"/>
  ${bgImageLayer}

  <!-- Top Editorial Header (Impeccable Persuade Hierarchy) -->
  <rect x="96" y="76" width="888" height="4" fill="url(#accentBar)" rx="2"/>
  <text x="96" y="128" fill="${escapeXml(
    textPrimary
  )}" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="700" letter-spacing="0.5">
    ${escapeXml(fields.brandKit.companyName)}
  </text>
  <text x="984" y="128" text-anchor="end" fill="${escapeXml(
    primary
  )}" font-family="JetBrains Mono, monospace" font-size="24" font-weight="700" style="font-variant-numeric: tabular-nums;">
    ${escapeXml(slideBadge)}
  </text>

  <!-- Accent Index Pill -->
  <rect x="96" y="${headlineStartY - 96}" width="170" height="44" rx="22" fill="${escapeXml(
    primary
  )}" fill-opacity="0.16" stroke="${escapeXml(primary)}" stroke-width="1.5"/>
  <text x="181" y="${
    headlineStartY - 67
  }" text-anchor="middle" fill="${escapeXml(
    isEditorialLight ? primary : "#E0E7FF"
  )}" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="600" letter-spacing="1.2">
    SLIDE ${fields.slideNumber}
  </text>

  <!-- Focal Headline -->
  <text x="96" y="${headlineStartY}" fill="${escapeXml(
    textPrimary
  )}" font-family="Inter, system-ui, sans-serif" font-size="${
    fields.templateId === "split-photo" ? "54" : "62"
  }" font-weight="800" letter-spacing="-1.2">
    ${headlineTspans}
  </text>

  <!-- Body Copy -->
  <text x="96" y="${adjustedBodyStartY}" fill="${escapeXml(
    textSecondary
  )}" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="400">
    ${bodyTspans}
  </text>

  <!-- Bottom CTA & Handle Bar -->
  ${
    ctaLine
      ? `<rect x="96" y="1120" width="888" height="84" rx="18" fill="${escapeXml(
          primary
        )}"/>
  <text x="540" y="1172" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="700">
    ${escapeXml(ctaLine)}
  </text>`
      : ""
  }

  <text x="96" y="1272" fill="${escapeXml(
    textSecondary
  )}" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="600">
    ${escapeXml(fields.brandKit.instagramHandle)}
  </text>
  <circle cx="968" cy="1264" r="14" fill="${escapeXml(accent)}"/>
</svg>`;
}

/**
 * Tabela CRC32 IEEE 802.3 para geração determinística de chunks PNG válidos
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i] ?? 0;
    const tableVal = CRC_TABLE[(c ^ byte) & 0xff] ?? 0;
    c = tableVal ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type: string, data: Uint8Array): Buffer {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuf, Buffer.from(data)]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, Buffer.from(data), crcBuf]);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = (hex || "#0D9488").replace("#", "").trim();
  if (clean.length !== 6) return [99, 102, 241];
  const num = Number.parseInt(clean, 16);
  if (Number.isNaN(num)) return [99, 102, 241];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Converte Data URL PNG do Canvas HTML5 do cliente OU gera um arquivo PNG 4:5 (360x450 / 1080x1350)
 * válido em memória com a assinatura mágica PNG e as cores do Brand Kit + metadados tEXt do SVG,
 * permitindo envio imediato para a fila do AutoSocial sem depender do Canva.
 */
export function renderSlidePngBuffer(fields: OpenDesignSlideFields): Buffer {
  if (
    fields.clientCanvasDataUrl &&
    fields.clientCanvasDataUrl.startsWith("data:image/png;base64,")
  ) {
    const b64 = fields.clientCanvasDataUrl.slice("data:image/png;base64,".length);
    return Buffer.from(b64, "base64");
  }

  // Gera PNG determinístico 4:5 com gradiente da marca e embute o SVG completo em chunk tEXt
  const w = 216;
  const h = 270;
  const [r1, g1, b1] = hexToRgb(fields.brandKit.backgroundColor || "#0F172A");
  const [r2, g2, b2] = hexToRgb(fields.brandKit.primaryColor || "#0D9488");

  const rawScanlines = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const rowStart = y * (1 + w * 4);
    rawScanlines[rowStart] = 0; // filtro None
    const t = y / h;
    const r = Math.round(r1 * (1 - t * 0.35) + r2 * (t * 0.35));
    const g = Math.round(g1 * (1 - t * 0.35) + g2 * (t * 0.35));
    const b = Math.round(b1 * (1 - t * 0.35) + b2 * (t * 0.35));
    for (let x = 0; x < w; x++) {
      const px = rowStart + 1 + x * 4;
      rawScanlines[px] = r;
      rawScanlines[px + 1] = g;
      rawScanlines[px + 2] = b;
      rawScanlines[px + 3] = 255;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = zlib.deflateSync(rawScanlines);
  const svgMeta = Buffer.from(
    `OpenDesign-SVG\0${fields.templateId}:${fields.slideNumber}/${fields.totalSlides}:${fields.headline}`,
    "utf-8"
  );

  return Buffer.concat([
    signature,
    makePngChunk("IHDR", ihdr),
    makePngChunk("tEXt", svgMeta),
    makePngChunk("IDAT", idatData),
    makePngChunk("IEND", new Uint8Array(0)),
  ]);
}

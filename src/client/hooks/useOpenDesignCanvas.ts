import { useEffect, type RefObject } from "react";
import type { Company } from "../types/company";
import type { Post, PostSlide } from "../types/schedule";
import type { StudioTemplateId } from "../components/DesignStudioModal";
import { getFormatSpec, type PostFormatId } from "@/shared/post-formats";

export function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word || "";
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }
  lines.push(currentLine);
  return lines;
}

export interface UseOpenDesignCanvasParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  activeCompany: Company | null;
  activePost?: Post;
  currentSlide?: PostSlide;
  selectedTemplate: StudioTemplateId;
  aiBackgroundDataUrl: string | null;
  activeSlideIndex: number;
  formatId?: PostFormatId;
}

export function useOpenDesignCanvas({
  canvasRef,
  activeCompany,
  activePost,
  currentSlide,
  selectedTemplate,
  aiBackgroundDataUrl,
  activeSlideIndex,
  formatId = "carousel_feed",
}: UseOpenDesignCanvasParams) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeCompany) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const format = getFormatSpec(formatId);
    const width = format.width;
    const height = format.height;
    canvas.width = width;
    canvas.height = height;

    const primaryColor = activeCompany.primaryColor || "#0D9488";
    const secondaryColor = activeCompany.secondaryColor || "#EC4899";
    const backgroundColor = activeCompany.backgroundColor || "#0F172A";
    const accentColor = activeCompany.accentColor || "#10B981";

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (aiBackgroundDataUrl) {
      const bgImg = new Image();
      bgImg.src = aiBackgroundDataUrl;
      bgImg.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.35;
        // Corte "cover": provedores sem 4:5 exato (3:4, 2:3) não podem ser esticados
        const scale = Math.max(width / bgImg.width, height / bgImg.height);
        const drawW = bgImg.width * scale;
        const drawH = bgImg.height * scale;
        ctx.drawImage(bgImg, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
        ctx.restore();
        drawTypographyLayers();
      };
      return;
    }

    drawTypographyLayers();

    function drawTypographyLayers() {
      if (!ctx || !activeCompany) return;

      if (selectedTemplate === "modern-bold") {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, width, 220);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.name.toUpperCase(), 80, 120);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 72px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Modern Bold 4:5";
        const titleLines = wrapCanvasLines(ctx, titleText, 920, 3);
        let yPos = 360;
        for (const line of titleLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 86;
        }

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "normal 40px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Template determinístico do Studio Visual OpenDesign para criação rápida e autônoma de conteúdo.";
        const bodyLines = wrapCanvasLines(ctx, bodyText, 920, 5);
        yPos += 40;
        for (const line of bodyLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 58;
        }

        ctx.fillStyle = secondaryColor;
        ctx.fillRect(80, height - 160, width - 160, 4);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "500 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.instagramHandle || "@democorp", 80, height - 90);

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(width - 100, height - 98, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedTemplate === "editorial-clean") {
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#0F172A";
        ctx.font = "italic 32px 'Instrument Sans', serif";
        ctx.fillText(activeCompany.name, 90, 130);

        ctx.fillStyle = "#0F172A";
        ctx.font = "600 64px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Editorial Clean 4:5";
        const titleLines = wrapCanvasLines(ctx, titleText, 900, 3);
        let yPos = 320;
        for (const line of titleLines) {
          ctx.fillText(line, 90, yPos);
          yPos += 82;
        }

        ctx.fillStyle = "#334155";
        ctx.font = "normal 38px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Equilíbrio tipográfico refinado com proporções editoriais para maior autoridade.";
        const bodyLines = wrapCanvasLines(ctx, bodyText, 900, 5);
        yPos += 40;
        for (const line of bodyLines) {
          ctx.fillText(line, 90, yPos);
          yPos += 56;
        }

        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(90, height - 120);
        ctx.lineTo(width - 90, height - 120);
        ctx.stroke();

        ctx.fillStyle = "#64748B";
        ctx.font = "500 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.instagramHandle || "@democorp", 90, height - 70);
      } else {
        ctx.fillStyle = "#090D16";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 30px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.name.toUpperCase(), 80, 110);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 70px 'Instrument Sans', sans-serif";
        const titleText = currentSlide?.title || activePost?.theme || "Dark Obsidian 4:5";
        const titleLines = wrapCanvasLines(ctx, titleText, 920, 3);
        let yPos = 260;
        for (const line of titleLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 84;
        }

        ctx.fillStyle = "#94A3B8";
        ctx.font = "normal 38px 'Instrument Sans', sans-serif";
        const bodyText =
          currentSlide?.bodyText ||
          "Design de alto contraste com renderização pura no motor OpenDesign.";
        const bodyLines = wrapCanvasLines(ctx, bodyText, 920, 5);
        yPos += 40;
        for (const line of bodyLines) {
          ctx.fillText(line, 80, yPos);
          yPos += 56;
        }

        ctx.fillStyle = "#64748B";
        ctx.font = "500 28px 'Instrument Sans', sans-serif";
        ctx.fillText(activeCompany.instagramHandle || "@democorp", 80, height - 70);
      }
    }
  }, [
    canvasRef,
    selectedTemplate,
    aiBackgroundDataUrl,
    activeSlideIndex,
    activePost,
    currentSlide,
    activeCompany,
    formatId,
  ]);
}

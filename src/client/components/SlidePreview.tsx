import React from "react";
import type { Post } from "@/client/types/schedule";
import { Badge } from "@/client/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";

interface SlidePreviewProps {
  post: Post;
  slideNumber?: number; // 1 a N
  photoUrl?: string | null;
  brandColors?: {
    primary?: string | null;
    secondary?: string | null;
    background?: string | null;
    accent?: string | null;
  };
  companyName: string;
  instagramHandle: string;
}

export function SlidePreview({
  post,
  slideNumber = 1,
  photoUrl,
  brandColors,
  instagramHandle,
}: SlidePreviewProps) {
  const currentSlide =
    post.slides.find((s) => s.slideNumber === slideNumber) || post.slides[0];

  const primary = brandColors?.primary || "#0D9488";
  const secondary = brandColors?.secondary || "#0284C7";
  const bg = brandColors?.background || "#0F172A";
  const accent = brandColors?.accent || "#10B981";

  const isCover = slideNumber === 1;
  const isCta = slideNumber === post.slideCount;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Container Proporção 4:5 (1080x1350) */}
      <div
        className="relative w-full max-w-[300px] aspect-[4/5] rounded-xl overflow-hidden border border-slate-700 flex flex-col justify-between p-5 select-none"
        style={{ backgroundColor: bg }}
      >
        {/* Background Overlay com Foto (se houver) */}
        {photoUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={photoUrl}
              alt="Fundo do slide"
              className="w-full h-full object-cover opacity-25 filter brightness-90"
            />
            <div
              className="absolute inset-0 bg-slate-950/75"
              style={{ backgroundColor: `${bg}CC` }}
            />
          </div>
        )}

        {/* Topo do Slide com Alinhamento Vertical Perfeito */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            className="h-6 px-2.5 pt-[1px] rounded-md border text-xs font-semibold inline-flex items-center justify-center leading-none text-white"
            style={{ borderColor: primary }}
          >
            {post.category}
          </div>

          <div className="h-6 px-2.5 pt-[1px] rounded-full border border-white/15 bg-slate-950/80 text-xs font-semibold font-sans tabular-nums text-slate-200 inline-flex items-center justify-center leading-none">
            {slideNumber} / {post.slideCount}
          </div>
        </div>

        {/* Miolo do Slide (Conteúdo Tipográfico) */}
        <div className="relative z-10 space-y-3 my-auto w-full min-w-0 overflow-hidden">
          {isCover ? (
            <>
              <div
                className="inline-flex items-center justify-center h-5 px-2 pt-[1px] rounded text-xs font-bold leading-none max-w-full truncate"
                title={post.theme}
                style={{ backgroundColor: accent, color: "#090d16" }}
              >
                {post.theme}
              </div>
              <h3 className="text-lg font-black leading-tight text-white tracking-tight break-words line-clamp-3">
                {currentSlide?.title || "Como Escalar Seu Perfil com Conteúdo Autônomo"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 break-words">
                {currentSlide?.bodyText ||
                  "Descubra o passo a passo validado para gerar carrosséis estratégicos sem perder horas criando artes manuais."}
              </p>
            </>
          ) : isCta ? (
            <>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-white shrink-0"
                style={{ backgroundColor: primary }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-white leading-tight break-words line-clamp-3">
                {currentSlide?.title || "Pronto para Transformar Seu Negócio?"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 break-words">
                {currentSlide?.bodyText ||
                  "Compartilhe este post com quem precisa desse insight ou salve para consultar mais tarde!"}
              </p>
              {currentSlide?.ctaText && (
                <div
                  className="mt-2 text-center text-xs font-semibold py-1.5 px-3 rounded text-white break-words line-clamp-2"
                  style={{ backgroundColor: secondary }}
                >
                  {currentSlide.ctaText}
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className="h-5 px-2 pt-[1px] rounded border border-white/10 bg-slate-950/50 text-xs font-bold font-sans tabular-nums inline-flex items-center justify-center leading-none"
                style={{ color: secondary }}
              >
                Passo {slideNumber - 1} de {post.slideCount - 2}
              </div>
              <h3 className="text-base font-bold text-white leading-tight break-words line-clamp-3">
                {currentSlide?.title || `Lâmina ${slideNumber}: Título da Etapa`}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 break-words">
                {currentSlide?.bodyText ||
                  "Explicação detalhada deste insight prático com exemplos e orientações aplicáveis."}
              </p>
            </>
          )}
        </div>

        {/* Rodapé do Slide */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 truncate min-w-0 max-w-[200px]">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: primary }}
            />
            <span className="font-semibold text-white truncate">{instagramHandle}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0">
            <span>Arraste</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      <span className="text-xs text-slate-400 mt-2 font-sans tabular-nums inline-flex items-center justify-center leading-none">
        Proporção Instagram 4:5 (1080×1350px)
      </span>
    </div>
  );
}

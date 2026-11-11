# Diretrizes de Copywriting, Conversão & Instagram SEO 2026 (MATCH)

> **Contexto:** Social Panel (`insta-auto-panel`)  
> **Contrato Vinculado:** [AGENTS.md](../../AGENTS.md) (Seção de Padrões)

## 1. Canais de Conversão & Proibição de URLs Cruas
- **Links Não Clicáveis no Instagram:** Hyperlinks no corpo da legenda e nas imagens de posts orgânicos são inertes no Instagram. É expressamente proibido injetar URLs cruas (`wa.me/...`, `http://`, `https://`) tanto na legenda quanto nas lâminas geradas por IA.
- **Função dos Canais de Conversão:** Os dados cadastrais da empresa (WhatsApp Comercial, Website Oficial, Mensagem Padrão de Atendimento) destinam-se exclusivamente a subsidiar a redação persuasiva do Call-to-Action (CTA) no último slide e no fechamento da legenda.
- **Direcionamento Orgânico de Tráfego:** Todo CTA gerado pela IA ou formatado pelo backend deve orientar o público para os dois canais oficiais de conversão da plataforma:
  1. Envio de mensagem direta via **Direct**;
  2. Acesso ao WhatsApp ou canais externos através do **link na bio** do perfil da empresa (`@handle`).
- **Defesa em Profundidade:** O método `formatCaptionWithConversion` em `BaseAIProvider` sanitiza preventivamente qualquer URL crua remanescente e garante a presença do CTA orgânico e da menção ao perfil oficial.

## 2. Framework MATCH (Instagram SEO 2026)
A busca por palavras-chave substituiu as hashtags como vetor primário de descoberta orgânica no Explore, Feed e Search do Instagram.
1. **M — Metadata do Perfil:** O `seoDisplayName` ("Nome da Marca \| Nicho") possui o maior peso algorítmico do perfil, complementado pela `bioText` indexável (Google/Instagram) e links estruturados.
2. **A — Alt Text & Computer Vision:** Toda capa gerada deve conter `altText` descritivo incluindo a palavra-chave primária do post, garantindo alinhamento semântico auditável entre imagem, OCR visual e legenda.
3. **T — Topic Authority (Clusters de Conteúdo):** O conteúdo semanal deve ser distribuído em clusters temáticos semânticos (`keywordCluster`), garantindo diversidade e impedindo canibalização da mesma palavra-chave primária entre dias da mesma semana (`usedKeywords`).
4. **C — Content Semantics (Search-First Captions):** A legenda deve conter a palavra-chave primária já nos primeiros ~125 caracteres (antes do botão "...mais" / truncamento de feed), corpo explicativo substancial (150–300 palavras) e formatação limpa.
5. **H — Hashtags Focadas (3 a 5 Máximo):** Fica estritamente proibido o uso de blocos extensos de hashtags (10-30 tags). São permitidas exclusivamente de 3 a 5 tags hiper-específicas de nicho e localização.

## 3. Quality Gate Canônico
- O módulo `src/shared/seo-quality.ts` provê as funções canônicas `normalizeCaption`, `auditPost` e `seoChecks`.
- A UI exibe em tempo real o componente `SeoChecklist` e selos de conformidade MATCH no modo Operate.

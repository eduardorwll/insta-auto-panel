# Graph Report - insta-auto-panel  (2026-11-10)

## Corpus Check
- 125 files · ~222,603 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .toml 3, .lock 1)

## Summary
- 838 nodes · 2085 edges · 54 communities (35 shown, 19 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 205 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b5900e7c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- schema.ts
- provider.ts
- seo-quality.ts
- schedule-service.ts
- react
- Covered Files & Symbols
- 📘 Relatório Consolidado de Engenharia, Segurança, Arquitetura Generalizada (`@openrouter/sdk` + Style Blueprints) e Plano de Negócio — Social Panel (`insta-auto-panel`)
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- WeekPlanner.tsx
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- Covered Files & Symbols
- graft.ts
- useOpenDesignCanvas.ts
- session.ts
- scripts
- dependencies
- compilerOptions
- main.tsx
- devDependencies
- SettingsHub.tsx
- App.tsx
- package.json
- DesignStudioTab.tsx
- @playwright/test
- 🛠️ Execução e Testes
- post-formats.ts
- vite.config.ts
- image-provider.ts
- cookies.ts
- template-engine.ts
- prowl
- 1. Arquitetura e Stack Obrigatória
- 2.1. Regra de Commits Atômicos Obrigatórios
- 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees)
- 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)
- 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop) & Cláusula Pétrea de Execução Etapa por Etapa
- 2.5. Regra Mandatória de UI/UX Engineering para Toda Mudança de Interface
- 2.6. Regra Mandatória do Paradigma Why-First & Rotina de Refatoração Contínua
- 2.7. Diretriz Mandatória de Copywriting, Canais de Conversão & Links no Instagram
- 2.8. Diretriz Mandatória de Instagram SEO 2026 (Framework MATCH)
- 2.9. Diretriz Mandatória de Generalização de Estilo (Style Blueprints), OpenRouter SDK, Preview de Prompt e Home Server
- 2. Regras Operacionais Mandatórias do Repositório
- 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`)
- Prowl project context
- Prowl project map
- Social Panel (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente
- 📋 Checklist Mestre de Desenvolvimento por Etapas (Marcos M8 a M11)
- INDEX.md
- 🌐 Etapa 4: Integração Oficial com OpenRouter (`@openrouter/sdk`), Seleção Dinâmica de Modelos e Custo-Benefício
- OpenDesignSlideFields
- Covered Files & Symbols

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `Covered Files & Symbols` - 36 edges
3. `Covered Files & Symbols` - 35 edges
4. `drizzle-orm` - 32 edges
5. `react` - 28 edges
6. `Button` - 27 edges
7. `companies` - 26 edges
8. `db` - 24 edges
9. `useCompany()` - 22 edges
10. `PhotoBank()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `🧬 Etapa de Desenvolvimento 4 — Marco M11: Style Blueprints por Empresa (Visão IA) & Composição Generalizada Multi-Camadas` --references--> `PhotoBank()`  [INFERRED]
  docs/checklist-desenvolvimento-marcos-m8-a-m11.md → src/client/components/PhotoBank.tsx
- `3.1. Visão Geral da Arquitetura e Evolução Generalizada` --references--> `PhotoBank()`  [INFERRED]
  docs/relatorio-completo-engenharia-e-plano-negocio.md → src/client/components/PhotoBank.tsx
- `3.2. Cinco Estratégias para Construir o Motor de "Style Blueprint" por Empresa` --references--> `PhotoBank()`  [INFERRED]
  docs/relatorio-completo-engenharia-e-plano-negocio.md → src/client/components/PhotoBank.tsx
- `6.1. Posicionamento Estratégico: Um Motor Generalizado de Marcas ("Agency-in-a-Box")` --references--> `PhotoBank()`  [INFERRED]
  docs/relatorio-completo-engenharia-e-plano-negocio.md → src/client/components/PhotoBank.tsx
- ``src/client/App.tsx` (lines 1-317)` --references--> `DashboardContent()`  [INFERRED]
  graft/client-ui.md → src/client/App.tsx

## Import Cycles
- None detected.

## Communities (54 total, 19 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.16
Nodes (19): `src/client/components/CompanySwitcher.tsx` (lines 1-147), `src/client/components/ui/button.tsx` (lines 1-53), CompanySwitcher(), CompanySwitcherProps, Button, ButtonProps, buttonVariants, CardFooter (+11 more)

### Community 1 - "schema.ts"
Cohesion: 0.08
Nodes (60): `src/server/db/client.ts` (lines 1-111), `src/server/db/seed.ts` (lines 1-508), `src/server/services/export/autosocial.ts` (lines 1-168), drizzle-orm, zod, createDatabaseConnection(), createTestDb(), DatabaseConnection (+52 more)

### Community 2 - "provider.ts"
Cohesion: 0.08
Nodes (31): 2.7. Diretriz Mandatória de Copywriting, Canais de Conversão & Links no Instagram, Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-102), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-86), `src/server/services/ai/mlstudio.ts` (lines 1-97), `src/server/services/ai/openai.ts` (lines 1-98), `src/server/services/ai/provider.ts` (lines 1-275) (+23 more)

### Community 3 - "seo-quality.ts"
Cohesion: 0.06
Nodes (41): 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop) & Cláusula Pétrea de Execução Etapa por Etapa, 2.5. Regra Mandatória de UI/UX Engineering para Toda Mudança de Interface, 2.6. Regra Mandatória do Paradigma Why-First & Rotina de Refatoração Contínua, 2.8. Diretriz Mandatória de Instagram SEO 2026 (Framework MATCH), 2.9. Diretriz Mandatória de Generalização de Estilo (Style Blueprints), OpenRouter SDK, Preview de Prompt e Home Server (+33 more)

### Community 4 - "schedule-service.ts"
Cohesion: 0.10
Nodes (37): 1. Arquitetura e Stack Obrigatória, ✅ Etapa de Desenvolvimento 1 — Marco M8: Hardening de Segurança, Correções Críticas & Login Local (Home Server) [CONCLUÍDO], 2.2. Matriz Consolidada dos 14 Pontos Falhos Encontrados, ✅ Etapa 1 (Marco M8): Hardening de Segurança, Correções Críticas & Login Local (Home Server) — CONCLUÍDA, Covered Files & Symbols, `src/server/index.ts` (lines 1-166), `src/server/routes/ai.ts` (lines 1-305), `src/server/routes/companies.ts` (lines 1-90) (+29 more)

### Community 5 - "react"
Cohesion: 0.17
Nodes (20): `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/types/company.ts` (lines 1-22), class-variance-authority, react, CompanyModalProps, defaultForm, COLOR_PRESETS, DesignStudioModal() (+12 more)

### Community 6 - "Covered Files & Symbols"
Cohesion: 0.06
Nodes (34): Covered Files & Symbols, `tests/e2e/ai-generation.spec.ts` (lines 1-191), `tests/e2e/companies.spec.ts` (lines 1-100), `tests/e2e/design-studio.spec.ts` (lines 1-94), `tests/e2e/export-autosocial.spec.ts` (lines 1-69), `tests/e2e/planner-photos.spec.ts` (lines 1-92), `tests/e2e/seo-match.spec.ts` (lines 1-44), `tests/e2e/settings-hub.spec.ts` (lines 1-104) (+26 more)

### Community 7 - "📘 Relatório Consolidado de Engenharia, Segurança, Arquitetura Generalizada (`@openrouter/sdk` + Style Blueprints) e Plano de Negócio — Social Panel (`insta-auto-panel`)"
Cohesion: 0.18
Nodes (10): 1.1. Regras de Perímetro e Infraestrutura, 1.2. Ciclo Unificado de Engenharia, 2.1. Diagnóstico Automatizado da Base Atual, 3.1. Visão Geral da Arquitetura e Evolução Generalizada, 3.2. Cinco Estratégias para Construir o Motor de "Style Blueprint" por Empresa, 🧭 Etapa 1: Diretrizes de Agentes (Repositório + Sandbox), 🔍 Etapa 2: Auditoria de Engenharia & Segurança (Cloudflare / OWASP / STRIDE), 🏗️ Etapa 3: Resumo Arquitetural do Projeto e o Motor Generalizado "OpenDesign + Style Blueprints" (+2 more)

### Community 8 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.07
Nodes (30): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+22 more)

### Community 9 - "WeekPlanner.tsx"
Cohesion: 0.24
Nodes (21): `src/client/components/WeekPlanner.tsx` (lines 1-460), CATEGORIES, PhotoBank(), DAY_LABELS, DEFAULT_STATUS, getMonday(), PublicationQueue(), STATUS_CONFIG (+13 more)

### Community 10 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.07
Nodes (27): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação, 4.1. Stack Tecnológica (+19 more)

### Community 11 - "Covered Files & Symbols"
Cohesion: 0.09
Nodes (22): Covered Files & Symbols, `src/client/App.tsx` (lines 1-317), `src/client/components/AISettingsModal.tsx` (lines 1-468), `src/client/components/CompanyModal.tsx` (lines 1-338), `src/client/components/PhotoBank.tsx` (lines 1-295), `src/client/components/PublicationQueue.tsx` (lines 1-391), `src/client/components/SlidePreview.tsx` (lines 1-159), `src/client/components/ui/card.tsx` (lines 1-51) (+14 more)

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "useOpenDesignCanvas.ts"
Cohesion: 0.23
Nodes (13): `src/client/hooks/useWeekSchedule.ts` (lines 1-130), `src/client/types/schedule.ts` (lines 1-40), StudioTemplateId, UseOpenDesignCanvasParams, getMonday(), useWeekSchedule(), PhotoAsset, PhotoCategory (+5 more)

### Community 14 - "session.ts"
Cohesion: 0.24
Nodes (19): `src/server/routes/auth.ts` (lines 1-123), `src/server/services/auth/session.ts` (lines 1-139), handleRequest(), getClientIp(), handleAuthRoutes(), loginSchema, buildLogoutCookieHeader(), buildSessionCookieHeader() (+11 more)

### Community 15 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, archify, build, caveman, db:generate, db:migrate, db:sanitize, db:seed (+13 more)

### Community 16 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1, @radix-ui/react-label@^2.1.17 (+10 more)

### Community 17 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 18 - "main.tsx"
Cohesion: 0.40
Nodes (3): react-dom@^19.3.1, react-dom, rootElement

### Community 19 - "devDependencies"
Cohesion: 0.13
Nodes (14): devDependencies, drizzle-kit@^0.31.11, @playwright/test@^1.64.1, postcss@^8.5.32, @types/bun@^1.4.4, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^7.0.2 (+6 more)

### Community 20 - "SettingsHub.tsx"
Cohesion: 0.21
Nodes (11): `src/client/components/SettingsHub.tsx` (lines 1-847), `src/client/types/ai.ts` (lines 1-27), PROVIDER_OPTIONS, CompanySettingsData, IMAGE_PROVIDER_OPTIONS, LLM_PROVIDER_OPTIONS, SettingsHubProps, TEMPLATE_OPTIONS (+3 more)

### Community 21 - "App.tsx"
Cohesion: 0.14
Nodes (22): `src/client/components/CompanyTab.tsx` (lines 1-829), `src/client/components/LoginScreen.tsx` (lines 1-145), `src/client/components/SidebarNavigation.tsx` (lines 1-240), `src/client/components/ui/badge.tsx` (lines 1-33), lucide-react, App(), DashboardContent(), CompanyTab() (+14 more)

### Community 22 - "package.json"
Cohesion: 0.18
Nodes (10): tailwind-merge@^3.7.0, autoprefixer@^10.6.2, tailwindcss@^4.3.3, name, private, type, version, autoprefixer (+2 more)

### Community 23 - "DesignStudioTab.tsx"
Cohesion: 0.19
Nodes (20): `src/client/components/DesignStudioTab.tsx` (lines 1-1357), `src/client/components/ui/dialog.tsx` (lines 1-96), AISettingsModal(), CompanyModal(), DAY_LABELS, DAYS_OF_WEEK, DesignStudioTab(), DesignStudioTabProps (+12 more)

### Community 25 - "🛠️ Execução e Testes"
Cohesion: 0.22
Nodes (8): 🚀 Arquitetura & Stack Tecnológica, Checagem de Tipos TypeScript, Executar Testes Unitários, 🛠️ Execução e Testes, 📋 Funcionalidades Principais, Iniciar o Servidor, Instalação, Social Panel (insta-auto-panel)

### Community 26 - "post-formats.ts"
Cohesion: 0.19
Nodes (11): 10. Diário de Execução por Etapa — Registro Auditável de Modificações, ✅ Etapa 2 (Marco M9): Remoção Completa do Canva, Abstração Multi-Formato (Feed + Stories) & Modularização do Studio — CONCLUÍDA, `src/client/hooks/useOpenDesignCanvas.ts` (lines 1-224), useOpenDesignCanvas(), drawTypographyLayers(), wrapCanvasLines(), FormatSafeZones, getFormatSpec() (+3 more)

### Community 27 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 28 - "image-provider.ts"
Cohesion: 0.11
Nodes (25): `src/server/services/design/image-provider.ts` (lines 1-391), `tests/server/image-providers-real.test.ts` (lines 1-121), DESIGN_TEMPLATES, IMAGE_PROVIDERS, ImageProviderName, buildEditorialBackdropDataUri(), buildImagePrompt(), canCallApi() (+17 more)

### Community 29 - "cookies.ts"
Cohesion: 0.48
Nodes (5): `src/server/services/instagram/cookies.ts` (lines 1-128), CookieEntry, parseInstagramCookiesInput(), ParseInstagramCookiesInputParams, ParseInstagramCookiesResult

### Community 30 - "template-engine.ts"
Cohesion: 0.32
Nodes (11): `src/server/services/design/template-engine.ts` (lines 1-333), handleDesignRoutes(), crc32(), CRC_TABLE, escapeXml(), hexToRgb(), makePngChunk(), OpenDesignBrandKit (+3 more)

### Community 49 - "📋 Checklist Mestre de Desenvolvimento por Etapas (Marcos M8 a M11)"
Cohesion: 0.18
Nodes (10): 📋 Checklist Mestre de Desenvolvimento por Etapas (Marcos M8 a M11), ✅ Etapa de Desenvolvimento 2 — Marco M9: Remoção Completa do Canva, Abstração Multi-Formato (Feed + Stories) & Modularização do Studio [CONCLUÍDO], 🌐 Etapa de Desenvolvimento 3 — Marco M10: Integração Oficial `@openrouter/sdk`, Limites/Quotas de API & Prompt Inspector, 🧬 Etapa de Desenvolvimento 4 — Marco M11: Style Blueprints por Empresa (Visão IA) & Composição Generalizada Multi-Camadas, 6.1. Posicionamento Estratégico: Um Motor Generalizado de Marcas ("Agency-in-a-Box"), 6.2. Economia Unitária (Unit Economics) por Empresa Atendida, 6.3. Roadmap Técnico de Implementação (Próximos Marcos TDD), Resumo da Sequência de Execução: (+2 more)

### Community 50 - "INDEX.md"
Cohesion: 0.18
Nodes (6): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, HTTP REST API Routes (Bun.serve Endpoints), Domain Services & AI Provider Adapters, Automated Test Suite (Bun Unit/Integration + Playwright E2E)

### Community 51 - "🌐 Etapa 4: Integração Oficial com OpenRouter (`@openrouter/sdk`), Seleção Dinâmica de Modelos e Custo-Benefício"
Cohesion: 0.20
Nodes (10): 1. Instalação e Inicialização Padronizada no Bun, 2. Os 5 Endpoints/Módulos Oficiais da OpenRouter que Vamos Integrar no Backend, 4.1. Arquitetura Técnica da Integração com `@openrouter/sdk`, 4.2. Planejamento da Interface de Configuração e Seleção de Modelos (`SettingsHub.tsx`), 4.3. As 5 Sugestões Estratégicas para a Geração de Imagens OpenRouter + OpenDesign, 4.4. Tabela Oficial de Custo-Benefício dos Modelos na OpenRouter (Catálogo Ao Vivo `openrouter.ai/models`), A. Modelos de Geração & Edição de Imagens (`output_modalities=image`), B. Modelos de Texto, Roteiro SEO MATCH & Extração Multimodal de *Style Blueprint* (`openRouter.chat.send`) (+2 more)

### Community 52 - "OpenDesignSlideFields"
Cohesion: 0.25
Nodes (8): 5.1. Remoção Definitiva da Integração com o Canva (`OpenDesign-Only`), 5.2. Página de Login com Autenticação Simples para Home Server, 5.3. Regras Explícitas, Rate Limits e Quotas de Uso de API Configuráveis no Painel, 5.4. "Prompt Inspector" — Preview Transparente e Editável dos Prompts (Imagem + OpenDesign), 5.5. Modularização do `DesignStudioTab.tsx` e Fluxo Unificado Multi-Formato, 🔧 Etapa 5: As 5 Sugestões de Refatoração, Auth, Quotas e Preview de Prompt, DesignTemplateId, OpenDesignSlideFields

### Community 53 - "Covered Files & Symbols"
Cohesion: 0.33
Nodes (5): Covered Files & Symbols, Database Layer (SQLite WAL + Drizzle Schema & Migrations), `src/server/db/migrate.ts` (lines 1-22), `src/server/db/sanitize.ts` (lines 1-78), `src/server/db/schema.ts` (lines 1-339)

## Knowledge Gaps
- **16 isolated node(s):** `prowl`, `1. Arquitetura e Stack Obrigatória`, `2.1. Regra de Commits Atômicos Obrigatórios`, `2.2. Regra de Multi-Branches com Subagentes (Git Worktrees)`, `2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 291 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `drizzle-orm` connect `schema.ts` to `dependencies`, `provider.ts`, `schedule-service.ts`, `package.json`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **What connects `prowl`, `1. Arquitetura e Stack Obrigatória`, `2.1. Regra de Commits Atômicos Obrigatórios` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._
- **Why does `Covered Files & Symbols` connect `Covered Files & Symbols` to `INDEX.md`, `provider.ts`, `image-provider.ts`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `provider.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07629288274449565 - nodes in this community are weakly interconnected._
- **Why does `ExposedProvider` connect `provider.ts` to `schema.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `seo-quality.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05939716312056738 - nodes in this community are weakly interconnected._
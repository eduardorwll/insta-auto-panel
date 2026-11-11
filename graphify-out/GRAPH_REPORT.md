# Graph Report - insta-auto-panel  (2026-11-10)

## Corpus Check
- 141 files · ~229,408 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .toml 3, .lock 1)

## Summary
- 952 nodes · 2521 edges · 49 communities (30 shown, 19 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 272 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b20bd722`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- schema.ts
- provider.ts
- Covered Files & Symbols
- 2. Regras Operacionais Mandatórias do Repositório
- image-provider.ts
- quota-guard.ts
- 🌐 Etapa 4: Integração Oficial com OpenRouter (`@openrouter/sdk`), Seleção Dinâmica de Modelos e Custo-Benefício
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- package.json
- schedule-service.ts
- graft.ts
- dependencies
- session.ts
- scripts
- lucide-react
- seo-quality.ts
- template-engine.ts
- Covered Files & Symbols
- AISettingsModal.tsx
- SettingsHub.tsx
- compilerOptions
- CompanyTab.tsx
- vite.config.ts
- @playwright/test
- 🛠️ Execução e Testes
- App.tsx
- SettingsHub.tsx
- Button
- 1. Arquitetura e Stack Obrigatória
- prowl
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
- useStudioWorkflowMachine.ts

## God Nodes (most connected - your core abstractions)
1. `drizzle-orm` - 38 edges
2. `Covered Files & Symbols` - 38 edges
3. `cn()` - 37 edges
4. `Covered Files & Symbols` - 36 edges
5. `react` - 31 edges
6. `companies` - 31 edges
7. `db` - 30 edges
8. `Button` - 29 edges
9. `useCompany()` - 22 edges
10. `BaseAIProvider` - 21 edges

## Surprising Connections (you probably didn't know these)
- ``src/server/services/ai/factory.ts` (lines 1-76)` --references--> `AIProviderFactory`  [INFERRED]
  graft/server-services.md → src/server/services/ai/factory.ts
- ``src/client/types/photo.ts` (lines 1-14)` --references--> `PhotoAsset`  [INFERRED]
  graft/client-ui.md → src/client/types/photo.ts
- `✅ Etapa de Desenvolvimento 4 — Marco M11: Style Blueprints por Empresa (Visão IA) & Composição Generalizada Multi-Camadas [CONCLUÍDO]` --references--> `StyleBlueprint`  [INFERRED]
  docs/checklist-desenvolvimento-marcos-m8-a-m11.md → src/server/db/schema.ts
- ``src/client/lib/utils.ts` (lines 1-7)` --references--> `cn()`  [INFERRED]
  graft/client-ui.md → src/client/lib/utils.ts
- ``src/server/routes/companies.ts` (lines 1-141)` --references--> `handleCompaniesRoutes()`  [INFERRED]
  graft/server-routes.md → src/server/routes/companies.ts

## Import Cycles
- None detected.

## Communities (49 total, 19 thin omitted)

### Community 0 - "cn"
Cohesion: 0.18
Nodes (16): `src/client/components/CompanySwitcher.tsx` (lines 1-147), CompanySwitcher(), CompanySwitcherProps, buttonVariants, CardFooter, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem (+8 more)

### Community 1 - "schema.ts"
Cohesion: 0.06
Nodes (88): 2.10.1. Estado de Implementação das Invariantes (Marcos M12–M15 concluídos — referência para agentes), ✅ Etapa 4 (Marco M11): Style Blueprints por Empresa (Visão IA) & Motor de Composição Multi-Camadas — CONCLUÍDA, Covered Files & Symbols, Database Layer (SQLite WAL + Drizzle Schema & Migrations), `src/server/db/client.ts` (lines 1-146), `src/server/db/migrate.ts` (lines 1-22), `src/server/db/sanitize.ts` (lines 1-78), `src/server/db/seed.ts` (lines 1-508) (+80 more)

### Community 2 - "provider.ts"
Cohesion: 0.07
Nodes (30): 2.7. Diretriz Mandatória de Copywriting, Canais de Conversão & Links no Instagram, Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-102), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-86), `src/server/services/ai/mlstudio.ts` (lines 1-97), `src/server/services/ai/openai.ts` (lines 1-98), `src/server/services/ai/provider.ts` (lines 1-298) (+22 more)

### Community 3 - "Covered Files & Symbols"
Cohesion: 0.04
Nodes (41): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, Domain Services & AI Provider Adapters, Automated Test Suite (Bun Unit/Integration + Playwright E2E), Covered Files & Symbols, `tests/e2e/ai-generation.spec.ts` (lines 1-191), `tests/e2e/companies.spec.ts` (lines 1-100) (+33 more)

### Community 4 - "2. Regras Operacionais Mandatórias do Repositório"
Cohesion: 0.05
Nodes (42): 1. Arquitetura e Stack Obrigatória, 2.10. Diretriz Mandatória de Máquinas de Estado Explícitas & Prevenção de Problemas Arquiteturais "Invisíveis", 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop) & Cláusula Pétrea de Execução Etapa por Etapa, 2.5. Regra Mandatória de UI/UX Engineering para Toda Mudança de Interface, 2.6. Regra Mandatória do Paradigma Why-First & Rotina de Refatoração Contínua (+34 more)

### Community 5 - "image-provider.ts"
Cohesion: 0.10
Nodes (28): 2.1. Diagnóstico Automatizado da Base Atual, 2.2. Matriz Consolidada dos 14 Pontos Falhos Encontrados, 🔍 Etapa 2: Auditoria de Engenharia & Segurança (Cloudflare / OWASP / STRIDE), `src/server/services/design/image-provider.ts` (lines 1-395), `tests/server/image-providers-real.test.ts` (lines 1-121), DESIGN_TEMPLATES, IMAGE_PROVIDERS, ImageProviderName (+20 more)

### Community 6 - "quota-guard.ts"
Cohesion: 0.06
Nodes (54): 📋 Checklist Mestre de Desenvolvimento por Etapas (Marcos M8 a M11), ✅ Etapa de Desenvolvimento 1 — Marco M8: Hardening de Segurança, Correções Críticas & Login Local (Home Server) [CONCLUÍDO], ✅ Etapa de Desenvolvimento 2 — Marco M9: Remoção Completa do Canva, Abstração Multi-Formato (Feed + Stories) & Modularização do Studio [CONCLUÍDO], ✅ Etapa de Desenvolvimento 3 — Marco M10: Integração Oficial `@openrouter/sdk`, Limites/Quotas de API & Prompt Inspector [CONCLUÍDO], ✅ Etapa de Desenvolvimento 4 — Marco M11: Style Blueprints por Empresa (Visão IA) & Composição Generalizada Multi-Camadas [CONCLUÍDO], 10. Diário de Execução por Etapa — Registro Auditável de Modificações, 1.1. Regras de Perímetro e Infraestrutura, 1.2. Ciclo Unificado de Engenharia (+46 more)

### Community 7 - "🌐 Etapa 4: Integração Oficial com OpenRouter (`@openrouter/sdk`), Seleção Dinâmica de Modelos e Custo-Benefício"
Cohesion: 0.20
Nodes (10): 1. Instalação e Inicialização Padronizada no Bun, 2. Os 5 Endpoints/Módulos Oficiais da OpenRouter que Vamos Integrar no Backend, 4.1. Arquitetura Técnica da Integração com `@openrouter/sdk`, 4.2. Planejamento da Interface de Configuração e Seleção de Modelos (`SettingsHub.tsx`), 4.3. As 5 Sugestões Estratégicas para a Geração de Imagens OpenRouter + OpenDesign, 4.4. Tabela Oficial de Custo-Benefício dos Modelos na OpenRouter (Catálogo Ao Vivo `openrouter.ai/models`), A. Modelos de Geração & Edição de Imagens (`output_modalities=image`), B. Modelos de Texto, Roteiro SEO MATCH & Extração Multimodal de *Style Blueprint* (`openRouter.chat.send`) (+2 more)

### Community 8 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.07
Nodes (30): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+22 more)

### Community 9 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.07
Nodes (27): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação, 4.1. Stack Tecnológica (+19 more)

### Community 10 - "package.json"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, @playwright/test@^1.64.1, postcss@^8.5.32, tailwindcss@^4.3.3, @types/bun@^1.4.4, @types/react@^19.3.0 (+10 more)

### Community 11 - "schedule-service.ts"
Cohesion: 0.18
Nodes (23): `src/server/services/schedules/schedule-service.ts` (lines 1-338), dayOfWeekSchema, handleSchedulesRoutes(), postCreateSchema, postUpdateSchema, applySlideUpdates(), CreatePostParams, createSchedulePost() (+15 more)

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "dependencies"
Cohesion: 0.10
Nodes (27): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @openrouter/sdk@^1.5.81, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1 (+19 more)

### Community 14 - "session.ts"
Cohesion: 0.15
Nodes (20): `src/server/routes/auth.ts` (lines 1-123), `src/server/services/auth/session.ts` (lines 1-139), handleRequest(), getClientIp(), handleAuthRoutes(), loginSchema, buildLogoutCookieHeader(), buildSessionCookieHeader() (+12 more)

### Community 15 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, archify, build, caveman, db:generate, db:migrate, db:sanitize, db:seed (+13 more)

### Community 16 - "lucide-react"
Cohesion: 0.27
Nodes (8): `src/client/components/PromptInspectorModal.tsx` (lines 1-309), `src/client/components/SlidePreview.tsx` (lines 1-159), lucide-react, PreviewPayloadsResponse, PromptInspectorModal(), PromptInspectorModalProps, SlidePreview(), SlidePreviewProps

### Community 17 - "seo-quality.ts"
Cohesion: 0.21
Nodes (16): 2.8. Diretriz Mandatória de Instagram SEO 2026 (Framework MATCH), `src/client/components/SeoChecklist.tsx` (lines 1-58), 2.8. Diretriz Mandatória de Instagram SEO 2026 (Framework MATCH), SeoChecklist(), SeoChecklistProps, auditPost(), dropSentencesWithUrls(), fold() (+8 more)

### Community 18 - "template-engine.ts"
Cohesion: 0.06
Nodes (54): 5.1. Remoção Definitiva da Integração com o Canva (`OpenDesign-Only`), 5.2. Página de Login com Autenticação Simples para Home Server, 5.3. Regras Explícitas, Rate Limits e Quotas de Uso de API Configuráveis no Painel, 5.4. "Prompt Inspector" — Preview Transparente e Editável dos Prompts (Imagem + OpenDesign), 5.5. Modularização do `DesignStudioTab.tsx` e Fluxo Unificado Multi-Formato, ✅ Etapa 2 (Marco M9): Remoção Completa do Canva, Abstração Multi-Formato (Feed + Stories) & Modularização do Studio — CONCLUÍDA, 🔧 Etapa 5: As 5 Sugestões de Refatoração, Auth, Quotas e Preview de Prompt, `src/client/hooks/useOpenDesignCanvas.ts` (lines 1-224) (+46 more)

### Community 19 - "Covered Files & Symbols"
Cohesion: 0.12
Nodes (17): Covered Files & Symbols, `src/client/App.tsx` (lines 1-317), `src/client/components/PhotoBank.tsx` (lines 1-295), `src/client/components/PublicationQueue.tsx` (lines 1-391), `src/client/components/ui/button.tsx` (lines 1-53), `src/client/components/ui/card.tsx` (lines 1-51), `src/client/components/ui/dropdown-menu.tsx` (lines 1-172), `src/client/components/ui/input.tsx` (lines 1-24) (+9 more)

### Community 20 - "AISettingsModal.tsx"
Cohesion: 0.15
Nodes (25): `src/client/components/AISettingsModal.tsx` (lines 1-468), `src/client/components/CompanyModal.tsx` (lines 1-338), `src/client/components/DesignStudioTab.tsx` (lines 1-1393), `src/client/components/ui/dialog.tsx` (lines 1-96), AISettingsModal(), AISettingsModalProps, PROVIDER_OPTIONS, CompanyModal() (+17 more)

### Community 21 - "SettingsHub.tsx"
Cohesion: 0.21
Nodes (19): `src/client/components/WeekPlanner.tsx` (lines 1-460), `src/client/types/publication.ts` (lines 1-7), DAY_LABELS, DEFAULT_STATUS, PublicationQueue(), STATUS_CONFIG, SettingsHub(), Card (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 23 - "CompanyTab.tsx"
Cohesion: 0.44
Nodes (6): `src/client/types/company.ts` (lines 1-22), COLOR_PRESETS, CompanyContext, CompanyContextType, Company, CompanyFormData

### Community 24 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 27 - "🛠️ Execução e Testes"
Cohesion: 0.22
Nodes (8): 🚀 Arquitetura & Stack Tecnológica, Checagem de Tipos TypeScript, Executar Testes Unitários, 🛠️ Execução e Testes, 📋 Funcionalidades Principais, Iniciar o Servidor, Instalação, Social Panel (insta-auto-panel)

### Community 28 - "App.tsx"
Cohesion: 0.16
Nodes (16): `src/client/components/SidebarNavigation.tsx` (lines 1-240), react, App(), DashboardContent(), NAV_GROUPS, NavGroup, NavItem, NavTabId (+8 more)

### Community 29 - "SettingsHub.tsx"
Cohesion: 0.24
Nodes (10): `src/client/components/SettingsHub.tsx` (lines 1-1121), `src/client/types/ai.ts` (lines 1-27), CompanySettingsData, IMAGE_PROVIDER_OPTIONS, LLM_PROVIDER_OPTIONS, SettingsHubProps, TEMPLATE_OPTIONS, AIProvider (+2 more)

### Community 30 - "Button"
Cohesion: 0.14
Nodes (25): `src/client/components/CompanyTab.tsx` (lines 1-996), `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/components/LoginScreen.tsx` (lines 1-145), `src/client/components/ui/badge.tsx` (lines 1-33), class-variance-authority, CompanyTab(), companyToFormData(), DesignStudioModal() (+17 more)

### Community 48 - "useStudioWorkflowMachine.ts"
Cohesion: 0.47
Nodes (7): useStudioWorkflowMachine(), canStartStudioOp(), isStudioOpActive(), StudioOp, StudioWorkflowEvent, studioWorkflowReducer(), StudioWorkflowState

## Knowledge Gaps
- **16 isolated node(s):** `1. Arquitetura e Stack Obrigatória`, `prowl`, `2.1. Regra de Commits Atômicos Obrigatórios`, `2.2. Regra de Multi-Branches com Subagentes (Git Worktrees)`, `2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 306 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `drizzle-orm` connect `schema.ts` to `provider.ts`, `schedule-service.ts`, `dependencies`, `quota-guard.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `1. Arquitetura e Stack Obrigatória`, `prowl`, `2.1. Regra de Commits Atômicos Obrigatórios` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05981371338794748 - nodes in this community are weakly interconnected._
- **Why does `Covered Files & Symbols` connect `Covered Files & Symbols` to `provider.ts`, `image-provider.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `provider.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07291666666666667 - nodes in this community are weakly interconnected._
- **Why does `ExposedProvider` connect `provider.ts` to `schema.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `Covered Files & Symbols` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
# Graph Report - insta-auto-panel  (2026-10-30)

## Corpus Check
- 114 files · ~212,726 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .toml 3, .lock 1)

## Summary
- 721 nodes · 1843 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8fdc13a9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DesignStudioTab.tsx
- schema.ts
- factory.ts
- Covered Files & Symbols
- Covered Files & Symbols
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- scripts
- dependencies
- compilerOptions
- devDependencies
- Social Panel PRO (insta-auto-panel)
- main.tsx
- graft.ts
- seo-quality.ts
- Covered Files & Symbols
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- @playwright/test
- package.json
- vite.config.ts
- prowl
- design.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `drizzle-orm` - 32 edges
3. `Covered Files & Symbols` - 32 edges
4. `Covered Files & Symbols` - 29 edges
5. `Button` - 27 edges
6. `react` - 26 edges
7. `db` - 26 edges
8. `companies` - 26 edges
9. `useCompany()` - 24 edges
10. `Badge()` - 23 edges

## Surprising Connections (you probably didn't know these)
- ``src/client/App.tsx` (lines 1-274)` --references--> `DashboardContent()`  [INFERRED]
  graft/client-ui.md → src/client/App.tsx
- ``src/client/components/CompanyTab.tsx` (lines 1-717)` --references--> `CompanyTab()`  [INFERRED]
  graft/client-ui.md → src/client/components/CompanyTab.tsx
- ``src/client/components/PhotoBank.tsx` (lines 1-295)` --references--> `PhotoBank()`  [INFERRED]
  graft/client-ui.md → src/client/components/PhotoBank.tsx
- ``src/client/components/PublicationQueue.tsx` (lines 1-460)` --references--> `PublicationQueue()`  [INFERRED]
  graft/client-ui.md → src/client/components/PublicationQueue.tsx
- `4.1. Stack Tecnológica` --references--> `Badge()`  [INFERRED]
  requisitos-planejamento-automacao-instagram.md → src/client/components/ui/badge.tsx

## Import Cycles
- None detected.

## Communities (22 total, 3 thin omitted)

### Community 0 - "DesignStudioTab.tsx"
Cohesion: 0.06
Nodes (111): `src/client/components/CompanyModal.tsx` (lines 1-348), `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/components/SlidePreview.tsx` (lines 1-157), `src/client/components/ui/dialog.tsx` (lines 1-96), `src/client/components/WeekPlanner.tsx` (lines 1-773), `src/client/context/CompanyContext.tsx` (lines 1-141), `src/client/types/ai.ts` (lines 1-27), `src/client/types/company.ts` (lines 1-19) (+103 more)

### Community 1 - "schema.ts"
Cohesion: 0.07
Nodes (72): Covered Files & Symbols, `src/server/db/client.ts` (lines 1-105), `src/server/db/migrate.ts` (lines 1-22), `src/server/db/sanitize.ts` (lines 1-78), `src/server/db/seed.ts` (lines 1-59), `src/server/services/export/autosocial.ts` (lines 1-166), `src/server/services/export/canva.ts` (lines 1-122), drizzle-orm (+64 more)

### Community 2 - "factory.ts"
Cohesion: 0.08
Nodes (28): 2.7. Diretriz Mandatória de Copywriting, Canais de Conversão & Links no Instagram, Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-105), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-85), `src/server/services/ai/mlstudio.ts` (lines 1-99), `src/server/services/ai/openai.ts` (lines 1-102), `src/server/services/ai/provider.ts` (lines 1-169) (+20 more)

### Community 3 - "Covered Files & Symbols"
Cohesion: 0.06
Nodes (38): Covered Files & Symbols, `src/client/App.tsx` (lines 1-274), `src/client/components/AISettingsModal.tsx` (lines 1-468), `src/client/components/CanvaExportTab.tsx` (lines 1-321), `src/client/components/CompanySwitcher.tsx` (lines 1-147), `src/client/components/CompanyTab.tsx` (lines 1-717), `src/client/components/DesignStudioTab.tsx` (lines 1-1503), `src/client/components/PhotoBank.tsx` (lines 1-295) (+30 more)

### Community 4 - "Covered Files & Symbols"
Cohesion: 0.05
Nodes (35): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, Database Layer (SQLite WAL + Drizzle Schema & Migrations), Domain Services & AI Provider Adapters, Automated Test Suite (Bun Unit/Integration + Playwright E2E), Covered Files & Symbols, `tests/e2e/ai-generation.spec.ts` (lines 1-191) (+27 more)

### Community 5 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.07
Nodes (29): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+21 more)

### Community 6 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, archify, build, caveman, db:generate, db:migrate, db:sanitize, db:seed (+13 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1, @radix-ui/react-label@^2.1.17 (+10 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "devDependencies"
Cohesion: 0.13
Nodes (14): devDependencies, drizzle-kit@^0.31.11, @playwright/test@^1.64.1, postcss@^8.5.32, @types/bun@^1.4.4, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^7.0.2 (+6 more)

### Community 10 - "Social Panel PRO (insta-auto-panel)"
Cohesion: 0.13
Nodes (14): 1. Clonar o Repositório e Instalar Dependências, 1. Testes Unitários e de Integração (Bun Test), 2. Checagem Estática de Tipos (TypeScript), 2. Executar o Servidor de Desenvolvimento, 3. Build de Produção, 3. Testes Ponta a Ponta E2E (Playwright), 🚀 Arquitetura & Stack Tecnológica, 📁 Estrutura de Diretórios (+6 more)

### Community 11 - "main.tsx"
Cohesion: 0.40
Nodes (3): react-dom@^19.3.1, react-dom, rootElement

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "seo-quality.ts"
Cohesion: 0.11
Nodes (27): 2.8. Diretriz Mandatória de Instagram SEO 2026 (Framework MATCH), 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2.5. Regra Mandatória de UI/UX Engineering para Toda Mudança de Interface, 2.6. Regra Mandatória do Paradigma Why-First & Rotina de Refatoração Contínua (+19 more)

### Community 14 - "Covered Files & Symbols"
Cohesion: 0.15
Nodes (14): Covered Files & Symbols, HTTP REST API Routes (Bun.serve Endpoints), `src/server/index.ts` (lines 1-134), `src/server/routes/ai.ts` (lines 1-268), `src/server/routes/companies.ts` (lines 1-90), `src/server/routes/export.ts` (lines 1-92), `src/server/routes/photos.ts` (lines 1-131), `src/server/routes/schedules.ts` (lines 1-369) (+6 more)

### Community 15 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.05
Nodes (39): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2.5. Regra Mandatória de UI/UX Engineering para Toda Mudança de Interface, 2.6. Regra Mandatória do Paradigma Why-First & Rotina de Refatoração Contínua, 2. Regras Operacionais Mandatórias do Repositório (+31 more)

### Community 17 - "package.json"
Cohesion: 0.18
Nodes (10): tailwind-merge@^3.7.0, autoprefixer@^10.6.2, tailwindcss@^4.3.3, name, private, type, version, autoprefixer (+2 more)

### Community 18 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 28 - "design.ts"
Cohesion: 0.07
Nodes (39): `src/server/db/schema.ts` (lines 1-330), `src/server/routes/design.ts` (lines 1-218), `src/server/services/design/image-provider.ts` (lines 1-317), `src/server/services/design/template-engine.ts` (lines 1-322), DayOfWeek, DESIGN_TEMPLATES, DesignTemplateId, IMAGE_PROVIDERS (+31 more)

## Knowledge Gaps
- **3 isolated node(s):** `prowl`, `RFC-4180`, `RFC-4180`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 253 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `drizzle-orm` connect `schema.ts` to `package.json`, `factory.ts`, `dependencies`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **What connects `prowl`, `RFC-4180`, `RFC-4180` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DesignStudioTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.057736489861152734 - nodes in this community are weakly interconnected._
- **Why does `Covered Files & Symbols` connect `Covered Files & Symbols` to `DesignStudioTab.tsx`, `Covered Files & Symbols`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06921618204804046 - nodes in this community are weakly interconnected._
- **Should `factory.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07740112994350283 - nodes in this community are weakly interconnected._
- **Should `Covered Files & Symbols` be split into smaller, more focused modules?**
  _Cohesion score 0.05512820512820513 - nodes in this community are weakly interconnected._
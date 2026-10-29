# Graph Report - insta-auto-panel  (2026-10-29)

## Corpus Check
- 98 files · ~197,400 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .toml 3, .lock 1)

## Summary
- 614 nodes · 1467 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `785459e8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- schema.ts
- factory.ts
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- Covered Files & Symbols
- Covered Files & Symbols
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- scripts
- compilerOptions
- dependencies
- devDependencies
- Social Panel PRO (insta-auto-panel)
- graft.ts
- package.json
- @playwright/test
- prowl
- main.tsx
- @types/react-dom@^19.3.0
- vite
- design.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `Covered Files & Symbols` - 27 edges
3. `drizzle-orm` - 25 edges
4. `react` - 22 edges
5. `Button` - 21 edges
6. `Covered Files & Symbols` - 21 edges
7. `scripts` - 20 edges
8. `db` - 20 edges
9. `companies` - 20 edges
10. `WeekPlanner()` - 19 edges

## Surprising Connections (you probably didn't know these)
- ``src/client/App.tsx` (lines 1-317)` --references--> `DashboardContent()`  [INFERRED]
  graft/client-ui.md → src/client/App.tsx
- ``src/client/components/CompanySwitcher.tsx` (lines 1-120)` --references--> `CompanySwitcher()`  [INFERRED]
  graft/client-ui.md → src/client/components/CompanySwitcher.tsx
- ``src/client/components/PhotoBank.tsx` (lines 1-285)` --references--> `PhotoBank()`  [INFERRED]
  graft/client-ui.md → src/client/components/PhotoBank.tsx
- ``src/client/components/PublicationQueue.tsx` (lines 1-433)` --references--> `PublicationQueue()`  [INFERRED]
  graft/client-ui.md → src/client/components/PublicationQueue.tsx
- ``src/client/components/WeekPlanner.tsx` (lines 1-779)` --references--> `WeekPlanner()`  [INFERRED]
  graft/client-ui.md → src/client/components/WeekPlanner.tsx

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 0 - "cn"
Cohesion: 0.07
Nodes (85): `src/client/components/CompanyModal.tsx` (lines 1-346), `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/components/ui/dialog.tsx` (lines 1-96), `src/client/context/CompanyContext.tsx` (lines 1-141), `src/client/types/ai.ts` (lines 1-27), `src/client/types/company.ts` (lines 1-19), 4.3. Modos de Superfície e Polimento Sistêmico (`pbakaus/impeccable` v4.8.0), 📋 Funcionalidades Principais (+77 more)

### Community 1 - "schema.ts"
Cohesion: 0.07
Nodes (67): `src/server/db/client.ts` (lines 1-86), `src/server/services/export/autosocial.ts` (lines 1-164), `src/server/services/export/canva.ts` (lines 1-122), drizzle-orm, zod, createDatabaseConnection(), createTestDb(), DatabaseConnection (+59 more)

### Community 2 - "factory.ts"
Cohesion: 0.10
Nodes (23): Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-105), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-85), `src/server/services/ai/mlstudio.ts` (lines 1-99), `src/server/services/ai/openai.ts` (lines 1-102), `src/server/services/ai/provider.ts` (lines 1-131), AIProviderName (+15 more)

### Community 3 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.07
Nodes (29): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+21 more)

### Community 4 - "Covered Files & Symbols"
Cohesion: 0.04
Nodes (39): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, Covered Files & Symbols, Database Layer (SQLite WAL + Drizzle Schema & Migrations), `src/server/db/migrate.ts` (lines 1-22), `src/server/db/seed.ts` (lines 1-59), Covered Files & Symbols (+31 more)

### Community 5 - "Covered Files & Symbols"
Cohesion: 0.07
Nodes (35): Covered Files & Symbols, `src/client/App.tsx` (lines 1-317), `src/client/components/AISettingsModal.tsx` (lines 1-437), `src/client/components/CompanySwitcher.tsx` (lines 1-120), `src/client/components/PhotoBank.tsx` (lines 1-285), `src/client/components/PublicationQueue.tsx` (lines 1-433), `src/client/components/SlidePreview.tsx` (lines 1-160), `src/client/components/ui/badge.tsx` (lines 1-32) (+27 more)

### Community 6 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.04
Nodes (43): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente (+35 more)

### Community 7 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, archify, build, caveman, db:generate, db:migrate, db:seed, db:studio (+12 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1, @radix-ui/react-label@^2.1.17 (+10 more)

### Community 10 - "devDependencies"
Cohesion: 0.12
Nodes (15): devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, postcss@^8.5.32, @tailwindcss/vite@^4.3.3, @types/bun@^1.4.4, typescript@^7.0.2, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 11 - "Social Panel PRO (insta-auto-panel)"
Cohesion: 0.14
Nodes (13): 1. Clonar o Repositório e Instalar Dependências, 1. Testes Unitários e de Integração (Bun Test), 2. Checagem Estática de Tipos (TypeScript), 2. Executar o Servidor de Desenvolvimento, 3. Build de Produção, 3. Testes Ponta a Ponta E2E (Playwright), 🚀 Arquitetura & Stack Tecnológica, 📁 Estrutura de Diretórios (+5 more)

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "package.json"
Cohesion: 0.18
Nodes (10): tailwind-merge@^3.7.0, tailwindcss@^4.3.3, @types/react@^19.3.0, name, private, type, version, tailwind-merge (+2 more)

### Community 16 - "main.tsx"
Cohesion: 0.40
Nodes (3): react-dom@^19.3.1, react-dom, rootElement

### Community 28 - "design.ts"
Cohesion: 0.10
Nodes (29): `src/server/services/design/image-provider.ts` (lines 1-317), `src/server/services/design/template-engine.ts` (lines 1-322), DESIGN_TEMPLATES, DesignTemplateId, IMAGE_PROVIDERS, ImageProviderName, handleDesignRoutes(), buildEditorialBackdropDataUri() (+21 more)

## Knowledge Gaps
- **3 isolated node(s):** `prowl`, `RFC-4180`, `RFC-4180`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 217 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `drizzle-orm` connect `schema.ts` to `dependencies`, `factory.ts`, `package.json`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `prowl`, `RFC-4180`, `RFC-4180` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07076167076167077 - nodes in this community are weakly interconnected._
- **Why does `Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite` connect `Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite` to `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06605749095754807 - nodes in this community are weakly interconnected._
- **Why does `Badge()` connect `cn` to `Covered Files & Symbols`, `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `factory.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0996078431372549 - nodes in this community are weakly interconnected._
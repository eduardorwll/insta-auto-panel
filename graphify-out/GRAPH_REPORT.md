# Graph Report - insta-auto-panel  (2026-10-29)

## Corpus Check
- 92 files · ~121,030 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .toml 3, .lock 1)

## Summary
- 595 nodes · 1398 edges · 20 communities (17 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ab1f4a2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- schema.ts
- factory.ts
- Covered Files & Symbols
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- Covered Files & Symbols
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- scripts
- compilerOptions
- devDependencies
- dependencies
- Social Panel PRO (insta-auto-panel)
- graft.ts
- package.json
- @playwright/test
- vite.config.ts
- main.tsx
- prowl
- image-providers.test.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `Covered Files & Symbols` - 27 edges
3. `drizzle-orm` - 24 edges
4. `react` - 21 edges
5. `Covered Files & Symbols` - 21 edges
6. `scripts` - 20 edges
7. `WeekPlanner()` - 19 edges
8. `DashboardContent()` - 19 edges
9. `Button` - 19 edges
10. `db` - 18 edges

## Surprising Connections (you probably didn't know these)
- ``src/client/components/WeekPlanner.tsx` (lines 1-779)` --references--> `WeekPlanner()`  [INFERRED]
  graft/client-ui.md → src/client/components/WeekPlanner.tsx
- ``src/server/routes/design.ts` (lines 1-218)` --references--> `handleDesignRoutes()`  [INFERRED]
  graft/server-routes.md → src/server/routes/design.ts
- ``src/client/App.tsx` (lines 1-267)` --references--> `DashboardContent()`  [INFERRED]
  graft/client-ui.md → src/client/App.tsx
- ``src/client/components/CompanySwitcher.tsx` (lines 1-120)` --references--> `CompanySwitcher()`  [INFERRED]
  graft/client-ui.md → src/client/components/CompanySwitcher.tsx
- ``src/client/components/PhotoBank.tsx` (lines 1-285)` --references--> `PhotoBank()`  [INFERRED]
  graft/client-ui.md → src/client/components/PhotoBank.tsx

## Import Cycles
- None detected.

## Communities (20 total, 3 thin omitted)

### Community 0 - "cn"
Cohesion: 0.08
Nodes (76): `src/client/components/CompanyModal.tsx` (lines 1-346), `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/components/ui/dialog.tsx` (lines 1-96), `src/client/context/CompanyContext.tsx` (lines 1-141), `src/client/types/company.ts` (lines 1-19), 4.3. Modos de Superfície e Polimento Sistêmico (`pbakaus/impeccable` v4.8.0), Marco 6 (M6): Studio Visual Autônomo Sem Canva (`OpenDesign` Template Engine + `Variable Image AI Adapter`), 📋 Funcionalidades Principais (+68 more)

### Community 1 - "schema.ts"
Cohesion: 0.08
Nodes (62): `src/server/db/client.ts` (lines 1-86), `src/server/services/export/autosocial.ts` (lines 1-164), `src/server/services/export/canva.ts` (lines 1-122), drizzle-orm, zod, createDatabaseConnection(), createTestDb(), DatabaseConnection (+54 more)

### Community 2 - "factory.ts"
Cohesion: 0.10
Nodes (23): Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-105), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-85), `src/server/services/ai/mlstudio.ts` (lines 1-99), `src/server/services/ai/openai.ts` (lines 1-102), `src/server/services/ai/provider.ts` (lines 1-131), AIProviderName (+15 more)

### Community 3 - "Covered Files & Symbols"
Cohesion: 0.05
Nodes (43): Covered Files & Symbols, `src/client/App.tsx` (lines 1-267), `src/client/components/AISettingsModal.tsx` (lines 1-437), `src/client/components/CompanySwitcher.tsx` (lines 1-120), `src/client/components/PhotoBank.tsx` (lines 1-285), `src/client/components/PublicationQueue.tsx` (lines 1-433), `src/client/components/SlidePreview.tsx` (lines 1-160), `src/client/components/ui/badge.tsx` (lines 1-32) (+35 more)

### Community 4 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.05
Nodes (41): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente (+33 more)

### Community 5 - "Covered Files & Symbols"
Cohesion: 0.05
Nodes (35): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, Covered Files & Symbols, HTTP REST API Routes (Bun.serve Endpoints), `src/server/index.ts` (lines 1-113), `src/server/routes/ai.ts` (lines 1-195), `src/server/routes/companies.ts` (lines 1-90) (+27 more)

### Community 6 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.07
Nodes (27): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação, 4.1. Stack Tecnológica (+19 more)

### Community 7 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, archify, build, caveman, db:generate, db:migrate, db:seed, db:studio (+12 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (15): devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, postcss@^8.5.32, tailwindcss@^4.3.3, @types/bun@^1.4.4, @types/react@^19.3.0, @types/react-dom@^19.3.0 (+7 more)

### Community 10 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dropdown-menu@^2.2.1, @radix-ui/react-slot@^1.5.0, @radix-ui/react-tabs@^1.2.1 (+8 more)

### Community 11 - "Social Panel PRO (insta-auto-panel)"
Cohesion: 0.14
Nodes (13): 1. Clonar o Repositório e Instalar Dependências, 1. Testes Unitários e de Integração (Bun Test), 2. Checagem Estática de Tipos (TypeScript), 2. Executar o Servidor de Desenvolvimento, 3. Build de Produção, 3. Testes Ponta a Ponta E2E (Playwright), 🚀 Arquitetura & Stack Tecnológica, 📁 Estrutura de Diretórios (+5 more)

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "package.json"
Cohesion: 0.18
Nodes (10): @radix-ui/react-dialog@^1.3.1, @radix-ui/react-label@^2.1.17, typescript@^7.0.2, name, private, type, version, @radix-ui/react-dialog (+2 more)

### Community 15 - "vite.config.ts"
Cohesion: 0.29
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 16 - "main.tsx"
Cohesion: 0.40
Nodes (3): react-dom@^19.3.1, react-dom, rootElement

### Community 28 - "image-providers.test.ts"
Cohesion: 0.10
Nodes (29): `src/server/services/design/image-provider.ts` (lines 1-317), `src/server/services/design/template-engine.ts` (lines 1-322), DESIGN_TEMPLATES, DesignTemplateId, IMAGE_PROVIDERS, ImageProviderName, handleDesignRoutes(), buildEditorialBackdropDataUri() (+21 more)

## Knowledge Gaps
- **3 isolated node(s):** `prowl`, `RFC-4180`, `RFC-4180`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 207 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `drizzle-orm` connect `schema.ts` to `dependencies`, `factory.ts`, `package.json`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **What connects `prowl`, `RFC-4180`, `RFC-4180` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07898989898989899 - nodes in this community are weakly interconnected._
- **Why does `Badge()` connect `cn` to `Covered Files & Symbols`, `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07501194457716197 - nodes in this community are weakly interconnected._
- **Should `factory.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0996078431372549 - nodes in this community are weakly interconnected._
- **Should `Covered Files & Symbols` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._
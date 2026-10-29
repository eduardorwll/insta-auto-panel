# Graph Report - insta-auto-panel  (2026-10-29)

## Corpus Check
- 87 files · ~102,754 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .toml 3, .lock 1)

## Summary
- 511 nodes · 1174 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af9bda10`
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
- compilerOptions
- scripts
- devDependencies
- dependencies
- Social Panel PRO (insta-auto-panel)
- graft.ts
- package.json
- @playwright/test
- vite.config.ts
- main.tsx
- prowl

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `Covered Files & Symbols` - 26 edges
3. `drizzle-orm` - 22 edges
4. `react` - 20 edges
5. `DashboardContent()` - 19 edges
6. `Covered Files & Symbols` - 18 edges
7. `scripts` - 17 edges
8. `Button` - 17 edges
9. `WeekPlanner()` - 16 edges
10. `Badge()` - 16 edges

## Surprising Connections (you probably didn't know these)
- ``src/client/App.tsx` (lines 1-267)` --references--> `DashboardContent()`  [INFERRED]
  graft/client-ui.md → src/client/App.tsx
- ``src/client/components/CompanySwitcher.tsx` (lines 1-120)` --references--> `CompanySwitcher()`  [INFERRED]
  graft/client-ui.md → src/client/components/CompanySwitcher.tsx
- ``src/client/components/PhotoBank.tsx` (lines 1-285)` --references--> `PhotoBank()`  [INFERRED]
  graft/client-ui.md → src/client/components/PhotoBank.tsx
- ``src/client/components/PublicationQueue.tsx` (lines 1-433)` --references--> `PublicationQueue()`  [INFERRED]
  graft/client-ui.md → src/client/components/PublicationQueue.tsx
- ``src/client/components/WeekPlanner.tsx` (lines 1-750)` --references--> `WeekPlanner()`  [INFERRED]
  graft/client-ui.md → src/client/components/WeekPlanner.tsx

## Import Cycles
- None detected.

## Communities (19 total, 3 thin omitted)

### Community 0 - "cn"
Cohesion: 0.09
Nodes (64): `src/client/components/CompanyModal.tsx` (lines 1-346), `src/client/components/ui/dialog.tsx` (lines 1-96), `src/client/context/CompanyContext.tsx` (lines 1-141), `src/client/types/company.ts` (lines 1-19), class-variance-authority, lucide-react, react, App() (+56 more)

### Community 1 - "schema.ts"
Cohesion: 0.08
Nodes (58): `src/server/db/client.ts` (lines 1-76), `src/server/services/export/autosocial.ts` (lines 1-145), `src/server/services/export/canva.ts` (lines 1-122), drizzle-orm, zod, createDatabaseConnection(), createTestDb(), DatabaseConnection (+50 more)

### Community 2 - "factory.ts"
Cohesion: 0.10
Nodes (23): Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-105), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-85), `src/server/services/ai/mlstudio.ts` (lines 1-99), `src/server/services/ai/openai.ts` (lines 1-102), `src/server/services/ai/provider.ts` (lines 1-131), AIProviderName (+15 more)

### Community 3 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.05
Nodes (41): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente (+33 more)

### Community 4 - "Covered Files & Symbols"
Cohesion: 0.06
Nodes (39): Covered Files & Symbols, `src/client/App.tsx` (lines 1-267), `src/client/components/AISettingsModal.tsx` (lines 1-437), `src/client/components/CompanySwitcher.tsx` (lines 1-120), `src/client/components/PhotoBank.tsx` (lines 1-285), `src/client/components/PublicationQueue.tsx` (lines 1-433), `src/client/components/SlidePreview.tsx` (lines 1-160), `src/client/components/ui/badge.tsx` (lines 1-32) (+31 more)

### Community 5 - "Covered Files & Symbols"
Cohesion: 0.05
Nodes (35): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, Covered Files & Symbols, Database Layer (SQLite WAL + Drizzle Schema & Migrations), `src/server/db/migrate.ts` (lines 1-22), `src/server/db/seed.ts` (lines 1-59), Covered Files & Symbols (+27 more)

### Community 6 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.07
Nodes (27): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação, 4.1. Stack Tecnológica (+19 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 8 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, archify, build, db:generate, db:migrate, db:seed, db:studio, dev (+9 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (15): devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, postcss@^8.5.32, @types/bun@^1.4.4, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@^7.0.2 (+7 more)

### Community 10 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0 (+8 more)

### Community 11 - "Social Panel PRO (insta-auto-panel)"
Cohesion: 0.13
Nodes (14): 1. Clonar o Repositório e Instalar Dependências, 1. Testes Unitários e de Integração (Bun Test), 2. Checagem Estática de Tipos (TypeScript), 2. Executar o Servidor de Desenvolvimento, 3. Build de Produção, 3. Testes Ponta a Ponta E2E (Playwright), 🚀 Arquitetura & Stack Tecnológica, 📁 Estrutura de Diretórios (+6 more)

### Community 12 - "graft.ts"
Cohesion: 0.15
Nodes (8): allRepoFiles, buildGraftNodes(), extractSpans(), getRepoSourceFiles(), walk(), GRAFT_DIR, REPO_ROOT, repoBaselineTokens

### Community 13 - "package.json"
Cohesion: 0.18
Nodes (10): @radix-ui/react-dropdown-menu@^2.2.1, tailwind-merge@^3.7.0, tailwindcss@^4.3.3, name, private, type, version, @radix-ui/react-dropdown-menu (+2 more)

### Community 15 - "vite.config.ts"
Cohesion: 0.29
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 16 - "main.tsx"
Cohesion: 0.40
Nodes (3): react-dom@^19.3.1, react-dom, rootElement

## Knowledge Gaps
- **3 isolated node(s):** `prowl`, `RFC-4180`, `RFC-4180`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 183 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Badge()` connect `cn` to `Covered Files & Symbols`, `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram`?**
  _High betweenness centrality (0.231) - this node is a cross-community bridge._
- **What connects `prowl`, `RFC-4180`, `RFC-4180` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.09382518043303929 - nodes in this community are weakly interconnected._
- **Why does `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram` connect `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram` to `Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07852257181942544 - nodes in this community are weakly interconnected._
- **Why does `4.1. Stack Tecnológica` connect `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram` to `cn`?**
  _High betweenness centrality (0.220) - this node is a cross-community bridge._
- **Should `factory.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0996078431372549 - nodes in this community are weakly interconnected._
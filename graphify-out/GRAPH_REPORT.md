# Graph Report - insta-auto-panel  (2026-10-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 406 nodes · 993 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8dd9e5a1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14

## God Nodes (most connected - your core abstractions)
1. `cn()` - 36 edges
2. `drizzle-orm` - 22 edges
3. `react` - 20 edges
4. `DashboardContent()` - 18 edges
5. `Button` - 17 edges
6. `db` - 16 edges
7. `companies` - 16 edges
8. `compilerOptions` - 16 edges
9. `WeekPlanner()` - 15 edges
10. `Badge()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `4.1. Stack Tecnológica` --references--> `Badge()`  [INFERRED]
  requisitos-planejamento-automacao-instagram.md → src/client/components/ui/badge.tsx
- `📋 Funcionalidades Principais` --references--> `AISettingsModal()`  [INFERRED]
  README.md → src/client/components/AISettingsModal.tsx
- `📋 Funcionalidades Principais` --references--> `CompanySwitcher()`  [INFERRED]
  README.md → src/client/components/CompanySwitcher.tsx
- `📋 Funcionalidades Principais` --references--> `SlidePreview()`  [INFERRED]
  README.md → src/client/components/SlidePreview.tsx
- `CompanyModalProps` --references--> `Company`  [EXTRACTED]
  src/client/components/CompanyModal.tsx → src/client/types/company.ts

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (70): 📋 Funcionalidades Principais, class-variance-authority, lucide-react, react, App(), DashboardContent(), AISettingsModal(), AISettingsModalProps (+62 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (55): drizzle-orm, zod, createDatabaseConnection(), createTestDb(), DatabaseConnection, db, getDatabase(), sqlite (+47 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (14): AIProviderName, handleAIRoutes(), AIProviderFactory, GeminiProvider, MLStudioProvider, OpenAIProvider, AIProvider, AISettings (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (27): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação, 4.1. Stack Tecnológica (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (25): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Skill `playwright-agent-tester` (Auto-Teste de Interface Web), 4.2. Skill `bun-vite-tooling` (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (16): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1, @radix-ui/react-label@^2.1.17 (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (15): devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, postcss@^8.5.32, tailwindcss@^4.3.3, @types/bun@^1.4.4, @types/react-dom@^19.3.0, typescript@^7.0.2 (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (14): scripts, archify, build, db:generate, db:migrate, db:seed, db:studio, dev (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (13): 1. Clonar o Repositório e Instalar Dependências, 1. Testes Unitários e de Integração (Bun Test), 2. Checagem Estática de Tipos (TypeScript), 2. Executar o Servidor de Desenvolvimento, 3. Build de Produção, 3. Testes Ponta a Ponta E2E (Playwright), 🚀 Arquitetura & Stack Tecnológica, 📁 Estrutura de Diretórios (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (10): @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, @types/react@^19.3.0, name, private, type, version, @radix-ui/react-slot (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (8): SlidePreviewProps, PhotoAsset, PhotoCategory, Post, PostSlide, WeeklySchedule, DayOfWeek, PostStatus

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4180`, `RFC-4180`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 151 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Badge()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.281) - this node is a cross-community bridge._
- **What connects `RFC-4180`, `RFC-4180` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0781786941580756 - nodes in this community are weakly interconnected._
- **Why does `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram` connect `Community 3` to `Community 5`?**
  _High betweenness centrality (0.280) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08081104907434616 - nodes in this community are weakly interconnected._
- **Why does `4.1. Stack Tecnológica` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.273) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12944523470839261 - nodes in this community are weakly interconnected._
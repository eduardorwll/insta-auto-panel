# Graph Report - insta-auto-panel  (2026-11-10)

## Corpus Check
- 154 files · ~265,948 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .toml 3, .lock 1)

## Summary
- 1034 nodes · 2685 edges · 58 communities (39 shown, 19 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 307 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a850c41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- schema.ts
- provider.ts
- Covered Files & Symbols
- Covered Files & Symbols
- image-provider.ts
- quota-guard.ts
- quotes.py
- 📘 Relatório Consolidado de Engenharia, Segurança, Arquitetura Generalizada (`@openrouter/sdk` + Style Blueprints) e Plano de Negócio — Social Panel (`insta-auto-panel`)
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- package.json
- autosocial.ts
- graft.ts
- dependencies
- session.ts
- scripts
- PromptInspectorModal.tsx
- seo-quality.ts
- design.ts
- Covered Files & Symbols
- AISettingsModal.tsx
- App.tsx
- compilerOptions
- useWeekSchedule.ts
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- @playwright/test
- 🛠️ Execução e Testes
- 🎨 Etapa de Desenvolvimento 8 — Marco M15: Statecharts no Frontend (Fim do *Boolean Soup*), Semana Compartilhada & Sincronia Canvas 1080×1350
- AGENTS.md
- DesignStudioModal.tsx
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
- SidebarNavigation.tsx
- 6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)
- Padrões Mandatórios de UI/UX Engineering (Tríade de Design)
- 📖 Guia de Estudo: Como Enxergar Problemas de Arquitetura "Invisíveis"
- 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação
- 5. Módulos Funcionais e Modelo de Dados
- Regras Operacionais Mandatórias de Engenharia Multiagente
- Paradigma Why-First & Rotina de Refatoração Contínua
- 🏛️ Guia Permanente de Arquitetura: Problemas "Invisíveis", Máquinas de Estado Explícitas & Invariantes de Domínio

## God Nodes (most connected - your core abstractions)
1. `drizzle-orm` - 38 edges
2. `Covered Files & Symbols` - 38 edges
3. `cn()` - 37 edges
4. `Covered Files & Symbols` - 36 edges
5. `companies` - 31 edges
6. `react` - 31 edges
7. `db` - 30 edges
8. `Button` - 29 edges
9. `DesignStudioTab()` - 25 edges
10. `WeekPlanner()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `2.1 Máquina de estado implícita (e "sopa de booleans")` --references--> `DesignStudioTab()`  [INFERRED]
  docs/guides/estudo-arquitetura-invisivel.md → src/client/components/DesignStudioTab.tsx
- `✅ Etapa de Desenvolvimento 4 — Marco M11: Style Blueprints por Empresa (Visão IA) & Composição Generalizada Multi-Camadas [CONCLUÍDO]` --references--> `StyleBlueprint`  [INFERRED]
  docs/plans/checklist-marcos-m8-a-m15.md → src/server/db/schema.ts
- `3.1. Visão Geral da Arquitetura e Evolução Generalizada` --references--> `PhotoBank()`  [INFERRED]
  docs/specs/relatorio-engenharia-negocio.md → src/client/components/PhotoBank.tsx
- `3.2. Cinco Estratégias para Construir o Motor de "Style Blueprint" por Empresa` --references--> `PhotoBank()`  [INFERRED]
  docs/specs/relatorio-engenharia-negocio.md → src/client/components/PhotoBank.tsx
- `6.1. Posicionamento Estratégico: Um Motor Generalizado de Marcas ("Agency-in-a-Box")` --references--> `PhotoBank()`  [INFERRED]
  docs/specs/relatorio-engenharia-negocio.md → src/client/components/PhotoBank.tsx

## Import Cycles
- None detected.

## Communities (58 total, 19 thin omitted)

### Community 0 - "cn"
Cohesion: 0.19
Nodes (16): `src/client/components/CompanySwitcher.tsx` (lines 1-147), CompanySwitcher(), CompanySwitcherProps, CardFooter, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel (+8 more)

### Community 1 - "schema.ts"
Cohesion: 0.09
Nodes (49): Covered Files & Symbols, Database Layer (SQLite WAL + Drizzle Schema & Migrations), `src/server/db/client.ts` (lines 1-146), `src/server/db/migrate.ts` (lines 1-22), `src/server/db/sanitize.ts` (lines 1-78), `src/server/db/seed.ts` (lines 1-508), `src/server/routes/photos.ts` (lines 1-160), drizzle-orm (+41 more)

### Community 2 - "provider.ts"
Cohesion: 0.07
Nodes (32): 1. Canais de Conversão & Proibição de URLs Cruas, 2. Framework MATCH (Instagram SEO 2026), Diretrizes de Copywriting, Conversão & Instagram SEO 2026 (MATCH), Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-102), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-86), `src/server/services/ai/mlstudio.ts` (lines 1-97) (+24 more)

### Community 3 - "Covered Files & Symbols"
Cohesion: 0.04
Nodes (42): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, HTTP REST API Routes (Bun.serve Endpoints), Domain Services & AI Provider Adapters, Automated Test Suite (Bun Unit/Integration + Playwright E2E), Covered Files & Symbols, `tests/e2e/ai-generation.spec.ts` (lines 1-191) (+34 more)

### Community 4 - "Covered Files & Symbols"
Cohesion: 0.08
Nodes (25): 📋 Checklist Mestre de Desenvolvimento por Etapas (Marcos M8 a M11), ✅ Etapa de Desenvolvimento 2 — Marco M9: Remoção Completa do Canva, Abstração Multi-Formato (Feed + Stories) & Modularização do Studio [CONCLUÍDO], ✅ Etapa de Desenvolvimento 4 — Marco M11: Style Blueprints por Empresa (Visão IA) & Composição Generalizada Multi-Camadas [CONCLUÍDO], Covered Files & Symbols, `src/server/index.ts` (lines 1-166), `src/server/routes/ai.ts` (lines 1-515), `src/server/routes/companies.ts` (lines 1-141), `src/server/routes/design.ts` (lines 1-448) (+17 more)

### Community 5 - "image-provider.ts"
Cohesion: 0.11
Nodes (26): 2.2. Matriz Consolidada dos 14 Pontos Falhos Encontrados, `src/server/services/design/image-provider.ts` (lines 1-395), `tests/server/image-providers-real.test.ts` (lines 1-121), DESIGN_TEMPLATES, IMAGE_PROVIDERS, ImageProviderName, buildEditorialBackdropDataUri(), buildImagePrompt() (+18 more)

### Community 6 - "quota-guard.ts"
Cohesion: 0.08
Nodes (47): 2. Catálogo das 7 Máquinas de Estado Implícitas Identificadas na Codebase, ✅ Etapa de Desenvolvimento 1 — Marco M8: Hardening de Segurança, Correções Críticas & Login Local (Home Server) [CONCLUÍDO], ✅ Etapa de Desenvolvimento 3 — Marco M10: Integração Oficial `@openrouter/sdk`, Limites/Quotas de API & Prompt Inspector [CONCLUÍDO], 10. Diário de Execução por Etapa — Registro Auditável de Modificações, ✅ Etapa 1 (Marco M8): Hardening de Segurança, Correções Críticas & Login Local (Home Server) — CONCLUÍDA, ✅ Etapa 3 (Marco M10): Integração Oficial `@openrouter/sdk`, Limites/Quotas de API & Prompt Inspector — CONCLUÍDA, `src/server/routes/settings.ts` (lines 1-433), `src/server/services/ai/openrouter-client.ts` (lines 1-290) (+39 more)

### Community 7 - "quotes.py"
Cohesion: 0.10
Nodes (23): field(), main(), split(), field(), front_matter(), lines_outside_fences(), looks_like_path(), main() (+15 more)

### Community 8 - "📘 Relatório Consolidado de Engenharia, Segurança, Arquitetura Generalizada (`@openrouter/sdk` + Style Blueprints) e Plano de Negócio — Social Panel (`insta-auto-panel`)"
Cohesion: 0.06
Nodes (31): 1.1. Regras de Perímetro e Infraestrutura, 1.2. Ciclo Unificado de Engenharia, 1. Instalação e Inicialização Padronizada no Bun, 2.1. Diagnóstico Automatizado da Base Atual, 2. Os 5 Endpoints/Módulos Oficiais da OpenRouter que Vamos Integrar no Backend, 3.1. Visão Geral da Arquitetura e Evolução Generalizada, 3.2. Cinco Estratégias para Construir o Motor de "Style Blueprint" por Empresa, 4.1. Arquitetura Técnica da Integração com `@openrouter/sdk` (+23 more)

### Community 9 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.07
Nodes (28): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+20 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (30): react-dom@^19.3.1, devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, @playwright/test@^1.64.1, postcss@^8.5.32, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3 (+22 more)

### Community 11 - "autosocial.ts"
Cohesion: 0.07
Nodes (58): 3. Catálogo dos 16 Problemas Arquiteturais "Invisíveis" Encontrados no Código, Categoria A — Atomicidade, Transações & Consistência de Dados (ACID vs. Disco), Categoria B — Acoplamento Temporal & Condições de Corrida Cliente-Servidor, Categoria D — Integridade Referencial, Segurança Multi-Tenant & Observabilidade, 2.1 Máquina de estado implícita (e "sopa de booleans"), 2.2 Escrita parcial (falta de transação), 2.3 Duas fontes da verdade (banco ↔ disco ↔ tela), 2.4 Corridas e acoplamento temporal (+50 more)

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @openrouter/sdk@^1.5.81, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1 (+13 more)

### Community 14 - "session.ts"
Cohesion: 0.15
Nodes (20): `src/server/routes/auth.ts` (lines 1-123), `src/server/services/auth/session.ts` (lines 1-139), handleRequest(), getClientIp(), handleAuthRoutes(), loginSchema, buildLogoutCookieHeader(), buildSessionCookieHeader() (+12 more)

### Community 15 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, archify, build, caveman, db:generate, db:migrate, db:sanitize, db:seed (+13 more)

### Community 16 - "PromptInspectorModal.tsx"
Cohesion: 0.60
Nodes (4): `src/client/components/PromptInspectorModal.tsx` (lines 1-309), PreviewPayloadsResponse, PromptInspectorModal(), PromptInspectorModalProps

### Community 17 - "seo-quality.ts"
Cohesion: 0.21
Nodes (16): 3. Quality Gate Canônico, `src/client/components/SeoChecklist.tsx` (lines 1-58), 2.8. Diretriz Mandatória de Instagram SEO 2026 (Framework MATCH), SeoChecklist(), SeoChecklistProps, auditPost(), dropSentencesWithUrls(), fold() (+8 more)

### Community 18 - "design.ts"
Cohesion: 0.10
Nodes (37): ✅ Etapa 4 (Marco M11): Style Blueprints por Empresa (Visão IA) & Motor de Composição Multi-Camadas — CONCLUÍDA, `src/server/db/schema.ts` (lines 1-422), `src/server/services/design/blueprint-extractor.ts` (lines 1-221), `src/server/services/design/template-engine.ts` (lines 1-395), zod@^4.6.7, zod, company_post_types, companyInsertSchema (+29 more)

### Community 19 - "Covered Files & Symbols"
Cohesion: 0.08
Nodes (25): Covered Files & Symbols, `src/client/App.tsx` (lines 1-317), `src/client/components/LoginScreen.tsx` (lines 1-145), `src/client/components/PhotoBank.tsx` (lines 1-295), `src/client/components/PublicationQueue.tsx` (lines 1-391), `src/client/components/SettingsHub.tsx` (lines 1-1121), `src/client/components/ui/badge.tsx` (lines 1-33), `src/client/components/ui/button.tsx` (lines 1-53) (+17 more)

### Community 20 - "AISettingsModal.tsx"
Cohesion: 0.12
Nodes (31): `src/client/components/AISettingsModal.tsx` (lines 1-468), `src/client/components/CompanyModal.tsx` (lines 1-338), `src/client/components/DesignStudioTab.tsx` (lines 1-1393), `src/client/components/ui/dialog.tsx` (lines 1-96), `src/client/types/ai.ts` (lines 1-27), AISettingsModal(), AISettingsModalProps, PROVIDER_OPTIONS (+23 more)

### Community 21 - "App.tsx"
Cohesion: 0.15
Nodes (40): Categoria C — Fontes da Verdade Duplicadas (*Split-Brain Architecture*), Parte 3 — As 7 máquinas de estado e as 16 falhas, em uma tabela de consulta, Parte 4 — Exercícios práticos no próprio código, Marco 6 (M6): Studio Visual Autônomo Sem Canva (`OpenDesign` Template Engine + `Variable Image AI Adapter`), `src/client/components/CompanyTab.tsx` (lines 1-996), `src/client/components/WeekPlanner.tsx` (lines 1-460), class-variance-authority, lucide-react (+32 more)

### Community 22 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 23 - "useWeekSchedule.ts"
Cohesion: 0.14
Nodes (21): `src/client/components/SlidePreview.tsx` (lines 1-159), `src/client/types/photo.ts` (lines 1-14), `src/client/types/schedule.ts` (lines 1-40), SlidePreview(), SlidePreviewProps, useWeek(), WeekContext, WeekContextValue (+13 more)

### Community 24 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.17
Nodes (11): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 4.1. Stack Tecnológica, 4.2. Banco de Dados Confiável: SQLite Nativo com Drizzle ORM, 4. O Novo Painel de Gestão: Arquitetura Técnica, 7. Schema Relacional do Banco de Dados Confiável (SQLite / Drizzle), 8. Arquitetura de Pastas Proposta para o Novo Projeto, 9. Próximos Passos de Decisão para Fechamento do Planejamento (+3 more)

### Community 27 - "🛠️ Execução e Testes"
Cohesion: 0.22
Nodes (8): 🚀 Arquitetura & Stack Tecnológica, Checagem de Tipos TypeScript, Executar Testes Unitários, 🛠️ Execução e Testes, 📋 Funcionalidades Principais, Iniciar o Servidor, Instalação, Social Panel (insta-auto-panel)

### Community 28 - "🎨 Etapa de Desenvolvimento 8 — Marco M15: Statecharts no Frontend (Fim do *Boolean Soup*), Semana Compartilhada & Sincronia Canvas 1080×1350"
Cohesion: 0.20
Nodes (7): 🎨 Etapa de Desenvolvimento 8 — Marco M15: Statecharts no Frontend (Fim do *Boolean Soup*), Semana Compartilhada & Sincronia Canvas 1080×1350, App(), CompanyProvider(), rootElement, AuthBootEvent, authBootReducer(), AuthBootState

### Community 29 - "AGENTS.md"
Cohesion: 0.39
Nodes (3): docs/ — Estante de Documentação & Conhecimento do Sistema, Mapa da Estante, Regra de Edição

### Community 30 - "DesignStudioModal.tsx"
Cohesion: 0.14
Nodes (22): 4.3. Modos de Superfície e Polimento Sistêmico (`pbakaus/impeccable` v4.8.0), ✅ Etapa 2 (Marco M9): Remoção Completa do Canva, Abstração Multi-Formato (Feed + Stories) & Modularização do Studio — CONCLUÍDA, `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/context/CompanyContext.tsx` (lines 1-141), `src/client/hooks/useOpenDesignCanvas.ts` (lines 1-224), `src/client/types/company.ts` (lines 1-22), DesignStudioModal(), DesignStudioModalProps (+14 more)

### Community 48 - "useStudioWorkflowMachine.ts"
Cohesion: 0.47
Nodes (7): useStudioWorkflowMachine(), canStartStudioOp(), isStudioOpActive(), StudioOp, StudioWorkflowEvent, studioWorkflowReducer(), StudioWorkflowState

### Community 49 - "SidebarNavigation.tsx"
Cohesion: 0.39
Nodes (7): `src/client/components/SidebarNavigation.tsx` (lines 1-240), NAV_GROUPS, NavGroup, NavItem, NavTabId, SidebarNavigation(), SidebarNavigationProps

### Community 50 - "6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)"
Cohesion: 0.33
Nodes (6): 6.1. Gestão de Provedores na Interface do Painel, 6.2. Padrão Arquitetural: Adapter Pattern em TypeScript, 6.3. Garantia de Formato: Saídas Estruturadas (Structured Outputs) e Validação Zod, 6.4. Escopo de Chaves: Global vs. Específica por Empresa, 6.5. O Papel do Canva Pro (Criação Visual de Alto Padrão), 6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)

### Community 51 - "Padrões Mandatórios de UI/UX Engineering (Tríade de Design)"
Cohesion: 0.33
Nodes (5): 1. `taste-skill` (`Leonxlnx/taste-skill`), 2. `emilkowalski/skills` (`emil-design-eng`), 3. `impeccable` (v4.8.0), 4. Conferência Visual Obrigatória, Padrões Mandatórios de UI/UX Engineering (Tríade de Design)

### Community 52 - "📖 Guia de Estudo: Como Enxergar Problemas de Arquitetura "Invisíveis""
Cohesion: 0.40
Nodes (5): 📖 Guia de Estudo: Como Enxergar Problemas de Arquitetura "Invisíveis", Parte 1 — A ideia central em 5 minutos, Parte 5 — Plano de leitura sugerido, Parte 6 — Glossário rápido, Parte 7 — Os cinco hábitos para levar para qualquer projeto

### Community 53 - "3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação"
Cohesion: 0.40
Nodes (5): 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação

### Community 54 - "5. Módulos Funcionais e Modelo de Dados"
Cohesion: 0.40
Nodes (5): 5.1. Módulo 1: Gestão de Múltiplas Contas / Empresas (Multi-Tenant), 5.2. Módulo 2: Banco de Fotos Base Isolado por Empresa, 5.3.1. Regra de Negócio: Número de Slides como Variável Dinâmica (3 a 10), 5.3. Módulo 3: Selecionador Semanal de Assuntos (Segunda a Domingo), 5. Módulos Funcionais e Modelo de Dados

### Community 55 - "Regras Operacionais Mandatórias de Engenharia Multiagente"
Cohesion: 0.40
Nodes (5): 1. Regra de Commits Atômicos Obrigatórios, 2. Regra de Multi-Branches com Subagentes (Git Worktrees), 3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 4. Cláusula Pétrea de Execução Etapa por Etapa (HITL Obrigatório), Regras Operacionais Mandatórias de Engenharia Multiagente

### Community 56 - "Paradigma Why-First & Rotina de Refatoração Contínua"
Cohesion: 0.40
Nodes (4): 1. Paradigma Why-First Mandatório, 2. Rotina Mandatória de Refatoração (`safe-refactor` + `refactoring` + `refactoring-guru`), 3. Ciclo Completo Unificado de Engenharia, Paradigma Why-First & Rotina de Refatoração Contínua

### Community 57 - "🏛️ Guia Permanente de Arquitetura: Problemas "Invisíveis", Máquinas de Estado Explícitas & Invariantes de Domínio"
Cohesion: 0.50
Nodes (4): 1. O Que São Problemas Arquiteturais "Invisíveis"?, 4. Bibliografia de Referência & Lentes Mentais de Engenharia, 5. Os 10 Mandamentos de Auditoria Anti-Bugs Invisíveis (Checklist Permanente), 🏛️ Guia Permanente de Arquitetura: Problemas "Invisíveis", Máquinas de Estado Explícitas & Invariantes de Domínio

## Knowledge Gaps
- **16 isolated node(s):** `1. Arquitetura e Stack Obrigatória`, `prowl`, `2.1. Regra de Commits Atômicos Obrigatórios`, `2.2. Regra de Multi-Branches com Subagentes (Git Worktrees)`, `2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 329 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `drizzle-orm` connect `schema.ts` to `provider.ts`, `quota-guard.ts`, `package.json`, `autosocial.ts`, `dependencies`, `design.ts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `1. Arquitetura e Stack Obrigatória`, `prowl`, `2.1. Regra de Commits Atômicos Obrigatórios` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08812529219261338 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.tsx` to `cn`, `package.json`, `dependencies`, `PromptInspectorModal.tsx`, `SidebarNavigation.tsx`, `useStudioWorkflowMachine.ts`, `AISettingsModal.tsx`, `useWeekSchedule.ts`, `🎨 Etapa de Desenvolvimento 8 — Marco M15: Statecharts no Frontend (Fim do *Boolean Soup*), Semana Compartilhada & Sincronia Canvas 1080×1350`, `DesignStudioModal.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `provider.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06919945725915876 - nodes in this community are weakly interconnected._
- **Why does `Covered Files & Symbols` connect `Covered Files & Symbols` to `provider.ts`, `image-provider.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `Covered Files & Symbols` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
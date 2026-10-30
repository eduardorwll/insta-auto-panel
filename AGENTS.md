# Social Panel (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente

> **Projeto:** Social Panel — Sistema de Automação de Conteúdo Multi-Conta para Instagram  
> **Diretório Oficial do Repositório:** `/home/eduardorwll/Sandbox/src/insta-auto-panel/`  
> **Perímetro de Execução (Sandbox):** `/home/eduardorwll/Sandbox/`  
> **Documentos Mestres:**  
> - [requisitos-planejamento-automacao-instagram.md](./requisitos-planejamento-automacao-instagram.md)  
> - [plano-fluxo-desenvolvimento-e-testes-vite.md](./plano-fluxo-desenvolvimento-e-testes-vite.md)

Este arquivo define as diretrizes operacionais inegociáveis para o **Lead Architect** e todos os **Subagentes** que atuam neste repositório, complementando as regras globais de `~/Sandbox/.agents/rules/`.

---

## 1. Arquitetura e Stack Obrigatória

1. **Runtime & Gerenciador de Pacotes:** **Bun** (`bun run`, `bun test`, `bun install`, `Bun.serve`). É proibido substituir o Bun por `npm`/`yarn` ou SGBDs externos pesados.
2. **Frontend & Design System:** **Vite + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Lucide React**.
3. **Persistência Confiável (ACID):** **SQLite nativo (`bun:sqlite`)** em modo **WAL (`PRAGMA journal_mode = WAL;`)** gerenciado via **Drizzle ORM** em `data/social_panel.db`.
4. **Clean Architecture e Separação em Camadas:**
   - **Camada de Serviços (`src/server/services/`):**
     - `schedules/schedule-service.ts`: Ciclo de vida de cronogramas semanais, cálculo de dias, sincronização dinâmica de lâminas (3 a 10) e auto-healing defensivo de lâminas.
     - `instagram/cookies.ts`: Parser universal e normalizador de cookies de autenticação do Instagram.
     - `ai/`: Adapters agnósticos com suporte nativo ao framework MATCH (Instagram SEO 2026: altText, keywordCluster e prompt de imagem).
     - `design/`: Motor do Studio Visual OpenDesign 4:5 (`template-engine.ts`, `image-provider.ts`).
     - `export/`: Enfileiramento atômico no AutoSocial (`autosocial.ts`) e exportação Canva Pro (`canva.ts`).
   - **Camada de Transporte & Rotas (`src/server/routes/`):** Rotas HTTP desacopladas com validação estrita via schemas Zod e injeção global de headers defensivos de segurança (`applySecurityHeaders`).
   - **Hooks Reativos (`src/client/hooks/`):** `useWeekSchedule.ts` desacopla a gestão de estado do cronograma do componente de renderização `WeekPlanner.tsx`.
5. **Regras de Domínio Essenciais:**
   - **Multi-Tenant (`companies`):** Isolamento estrito de dados, Brand Kit (cores Hex, tipografia, WhatsApp `wa.me`, redes sociais) e banco de fotos base (`photo_assets`) por empresa.
   - **Variável Dinâmica de Lâminas (`slide_count`):** Selecionável por post de **3 a 10 slides** (Slide 1 = Hook/Capa, Slides 2..N-1 = Desenvolvimento proporcional, Slide N = CTA).
   - **IA Generativa Agnóstica (`AIProvider`):** Padrão Adapter em TypeScript suportando ML Studio API local (`localhost:1234`), Google Gemini, OpenAI, Anthropic Claude, Groq, OpenRouter e Ollama, com validação em runtime via **Zod** (Structured Outputs).
   - **Motor Gráfico & Publicação:** Studio Visual OpenDesign nativo 4:5 (1080×1350px) e integração via filesystem sidecar (`.description` + mídia) na fila `data/autosocial/queue/<company_id>/instagram/pending/` do **`Katzca/AutoSocial`**.

---

## 2. Regras Operacionais Mandatórias do Repositório

### 2.1. Regra de Commits Atômicos Obrigatórios
- **1 Ticket = 1 Commit Semântico:** Todo subagente **DEVE** realizar um commit atômico formal utilizando o padrão **Conventional Commits** (`feat(scope): ...`, `test(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`) imediatamente após finalizar e validar sua task com 100% de sucesso nos testes, **antes** de qualquer merge na branch do marco.
- **Critérios Inegociáveis Pré-Commit:**
  1. `bun test` passando com 100% de êxito (código de saída `0`).
  2. `bun x tsc --noEmit` sem nenhum erro de tipagem TypeScript (`strict: true`, zero uso de `any`).
  3. Quando houver interface/E2E aplicável, `bun run test:e2e` (Playwright) passando integralmente com console limpo.
  4. Sincronização de grafos (`graphify update .`) quando arquivos de código forem criados ou modificados.

### 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees)
- **Isolamento via Git Worktrees (`Workspace: 'share'`):** É terminantemente proibido que múltiplos subagentes editem simultaneamente o mesmo diretório de trabalho. Ao invocar subagentes de implementação ou QA concorrentes, utilize `Workspace: 'share'` para isolar cada agente em seu próprio worktree.
- **Topologia Oficial de Branches:**
  - `main`: Código estável de produção, atualizado apenas após aprovação humana (HITL) de cada Marco.
  - `milestone/M<X>-<slug>`: Branch integradora do marco atual (ex: `milestone/M1-foundation`).
  - `feat/M<X>-T<Y>-<slug>`, `test/M<X>-T<Y>-<slug>`, `fix/M<X>-T<Y>-<slug>`: Branches efêmeras de trabalho atômico de cada subagente, integradas na branch do marco via `git merge --no-ff`.

### 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)
- **Validação Autônoma de UI:** O subagente de QA (`playwright-tester`) deve subir o servidor local, conectar o **Playwright** em modo headless e exercitar os fluxos reais da interface usando seletores semânticos acessíveis (`getByRole`, `getByLabel`, `getByText`).
- **Tolerância Zero a Erros de Console:** Todo teste Playwright deve anexar ouvintes para `page.on('console')` (tipo `error`) e `page.on('pageerror')`. Qualquer exceção não tratada do React/JS ou falha de requisição invalida imediatamente a aprovação da task.

### 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop)
- **Pausa Obrigatória entre Etapas/Marcos:** Nenhuma etapa ou marco (Milestone M1 a M5) avança para o próximo sem:
  1. Apresentação do relatório consolidado de evidências (arquivos criados/modificados, resultados de `bun test`, `tsc --noEmit`, testes Playwright e histórico de commits da branch).
  2. Revisão em Dois Eixos (**Spec Match** + **Standards & Quality**).
  3. **Autorização explícita do usuário humano** para prosseguir.

### 2.5. Regra Mandatória de UI/UX Engineering para Toda Mudança de Interface
- **Aplicação Mandatória do Kit de Skills Especializadas:** Qualquer adição, refatoração, migração ou modificação em componentes visuais, abas, modais, formulários ou painéis deve utilizar e cumprir rigorosamente o kit especializado de engenharia UI/UX:
  1. **`taste-skill` (`Leonxlnx/taste-skill`):** Zero estética genérica ("AI slop"), zero roxo/indigo padrão, separação tonal por luminância (`surface-0..2`), fontes `>= 11px` (proibido `text-[9px]`/`text-[10px]`), e validação obrigatória via `taste-skill lint` (meta: **0 FAIL**) e `taste-skill inspect` nas viewports `1440px`, `768px` e `390px`.
  2. **`emilkowalski/skills` (`emil-design-eng`):** Leis físicas de interação: feedback tátil obrigatório em botões interativos (`active:scale-95` ou `active:scale-[0.97]`), proibido `scale(0)` (iniciar em `scale(0.95)` + `opacity: 0`), curvas de transição `ease-out` curtas (`< 300ms`), animações restritas exclusivamente à GPU (`transform`/`opacity`), números dinâmicos e métricas com `tabular-nums`, e stress-testing com textos longos (`break-ui`).
  3. **`impeccable` (v4.8.0):** Classificação explícita de superfície: modo **Operate** para painéis/dashboards/studios de gestão de conteúdo (alta densidade, velocidade, zero distração) e modo **Persuade** para os templates 4:5 de conversão/slides.
  4. **Conferência Visual Obrigatória:** Toda alteração de UI deve abrir os screenshots gerados em `.taste-skill/inspect/*.jpg` via `read_file` para inspecionar alinhamentos, quebras, contrastes e bordas antes de dar a tarefa por concluída.

### 2.6. Regra Mandatória do Paradigma Why-First & Rotina de Refatoração Contínua
- **Paradigma Why-First Mandatório:** Nenhuma modificação de código, ajuste de esquema ou refatoração pode ser executada sem prévia justificativa técnica:
  1. **Justificativa Técnica Explícita:** Fundamentar a razão técnica da escolha (Clean Architecture, SOLID, acoplamento, coesão, performance).
  2. **Análise Formal de Trade-offs:** Documentar os ganhos reais e custos/compromissos técnicos conscientemente assumidos.
  3. **Alternativas Descartadas:** Registrar expressamente quais abordagens alternativas foram cogitadas e por que foram rejeitadas.
  4. **Preservação Documental:** Preservar rigorosamente comentários existentes, docstrings e ADRs sem remoção silenciosa.
  5. **Links Clicáveis:** Citar sempre arquivos e símbolos através de links Markdown clicáveis com esquema `file://` e números de linhas (`file:///path#Lxx-Lyy` ou [`Symbol`](file:///path#Lxx)).
- **Rotina Mandatória de Refatoração de Código (`safe-refactor` + `refactoring` + `refactoring-guru`):**
  1. **Preservação Comportamental Estrita:** Isolar estruturalmente refatoração de qualquer adição de feature ou correção de bug. O comportamento observável deve permanecer 100% inalterado durante refatorações.
  2. **Diagnóstico Prévio de Smells (`refactoring-guru`):** Classificar e nomear formalmente o code smell antes de escolher o tratamento (Bloaters, OO Abusers, Change Preventers, Dispensables, Couplers).
  3. **Menor Tratamento Suficiente & Regra de Três (`refactoring`):** Aplicar o menor movimento atômico capaz de eliminar o smell (`Extract Function`, `Inline Temp`, `Extract Class`, `Parameter Object`, `Guard Clauses`). Tolerar duplicação até a 2ª ocorrência; na 3ª, unificar a responsabilidade.
  4. **Rede de Proteção com Testes de Caracterização (`working-effectively-with-legacy-code`):** Executar os testes antes e garantir 100% de êxito; caso faltem testes, travar o comportamento atual com testes de caracterização antes da intervenção. Proibido enfraquecer testes para concluir refatorações.
  5. **Condição de Parada Rígida:** Interromper a limpeza assim que o smell for sanado, evitando qualquer engenharia especulativa ou redesign prematuro.
- **Ciclo Completo Unificado de Engenharia:**
  `Plan-First` ➔ `Why-First` ➔ `TDD (Red -> Green)` ➔ `Safe-Refactor` ➔ `UI Craft Triad` ➔ `Review-Before-Done (2 Eixos)` ➔ `Tokens Report`.

### 2.7. Diretriz Mandatória de Copywriting, Canais de Conversão & Links no Instagram
- **Links Não Clicáveis no Instagram:** No ecossistema do Instagram, hyperlinks no corpo da legenda e nas imagens de posts orgânicos são inertes (não clicáveis). É expressamente proibido injetar URLs cruas (`wa.me/...`, `http://`, `https://`) tanto na legenda quanto nas lâminas geradas por IA.
- **Função dos Canais de Conversão:** Os dados cadastrais da empresa (WhatsApp Comercial, Website Oficial, Mensagem Padrão de Atendimento) destinam-se exclusivamente a **subsidiar a redação persuasiva do Call-to-Action (CTA)** no último slide e no fechamento da legenda.
- **Direcionamento Orgânico de Tráfego:** Todo CTA gerado pela IA ou formatado pelo backend deve orientar o público para os dois canais oficiais de conversão da plataforma:
  1. Envio de mensagem direta via **Direct**;
  2. Acesso ao WhatsApp ou canais externos através do **link na bio** do perfil da empresa (`@handle`).
- **Defesa em Profundidade (Sanitização no Backend):** O método `formatCaptionWithConversion` em `BaseAIProvider` deve sanitizar preventivamente qualquer URL crua remanescente e garantir a presença do CTA orgânico e da menção ao perfil oficial.

### 2.8. Diretriz Mandatória de Instagram SEO 2026 (Framework MATCH)
- **Instagram como Motor de Busca Semântica:** A busca por palavras-chave substituiu os hashtags como vetor primário de descoberta orgânica no Explore, Feed e Search do Instagram. Toda geração de conteúdo automatizada deve aplicar os 5 pilares do **Framework MATCH** (`.agents/skills/instagram-seo/`):
  1. **M — Metadata do Perfil:** O `seoDisplayName` ("Nome da Marca | Nicho") possui o maior peso algorítmico do perfil, complementado pela `bioText` indexável (Google/Instagram) e links estruturados.
  2. **A — Alt Text & Computer Vision:** Toda capa gerada deve conter `altText` descritivo incluindo a palavra-chave primária do post, garantindo alinhamento semântico auditável entre imagem, OCR visual e legenda.
  3. **T — Topic Authority (Clusters de Conteúdo):** O conteúdo semanal deve ser distribuído em clusters temáticos semânticos (`keywordCluster`), garantindo diversidade e impedindo canibalização da mesma palavra-chave primária entre dias da mesma semana (`usedKeywords`).
  4. **C — Content Semantics (Search-First Captions):** A legenda deve conter a palavra-chave primária já nos primeiros ~125 caracteres (antes do botão "...mais" / truncamento de feed), corpo explicativo substancial (150–300 palavras) e formatação limpa.
  5. **H — Hashtags Focadas (3 a 5 Máximo):** Fica estritamente proibido o uso de blocos extensos de hashtags (10-30 tags). São permitidas exclusivamente de 3 a 5 tags hiper-específicas de nicho e localização.
- **Provedores de Imagem de Alta Fidelidade com Fallback Resiliente:**
  - O sistema disponibiliza 3 provedores agnósticos reais de geração de imagem (`openrouter-image`, `gemini-imagen`, `openai-image`), além do renderizador interno de SVG.
  - As chaves de API dos provedores de imagem residem de forma segura e mascarada no SQLite (`company_settings`), recuperadas exclusivamente server-side (`/api/design/generate-image-ai`).
  - Todas as chamadas de rede possuem timeout estrito de 60 segundos com `AbortController` e tratam falhas, respostas vazias ou falta de créditos caindo graciosamente no fallback de SVG gerado localmente, sem lançar exceções 500 para o cliente.
- **Quality Gate no Backend & UI:**
  - O módulo `src/shared/seo-quality.ts` provê as funções canônicas `normalizeCaption`, `auditPost` e `seoChecks`.
  - A interface web no Studio Visual 4:5 e no Planejador Semanal exibe em tempo real o componente `SeoChecklist` e os selos de conformidade SEO no modo Operate.

---

## 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`)

Todos os agentes operando neste repositório estão simultaneamente submetidos a:
- **Confinamento Estrito (`boundaries.md`):** Nenhuma leitura de segredos do host (`~/.ssh`, `~/.gnupg`) nem escrita fora de `/home/eduardorwll/Sandbox/` (ou `/tmp/`).
- **Prática TDD (`tdd.md`):** Ciclo obrigatório **Red -> Green -> Refactor**. Testes unitários sempre precedem a implementação de regras de negócio, schemas e serviços.
- **Planejamento Mandatório (`planning.md`), Explicação Técnica Why-First (`explanation.md`) & Refatoração Contínua (`refactoring.md`):** Nenhuma modificação estrutural sem plano prévio, mapeamento de *blast radius*, justificativa técnica explícita (*Why-First*), análise de trade-offs, alternativas descartadas e isolamento comportamental.
- **Inteligência em Grafos & Os 4 Token Savers Mandatórios (`graph-intelligence.md`):**
  1. **`graphify` (Macro AST):** `bun run graphify query "<pergunta>"`, `bun run graphify path "<A>" "<B>"`, `bun run graphify update .` (e hooks Git automáticos).
  2. **`graft` + `prowl` (Micro Context):** `bun run graft skeleton <arquivo>`, `bun run graft callers <símbolo> --depth all`, `bun run graft ask "<pergunta>" --source`.
  3. **`caveman` (Compressão de Entrada & `cavecrew`):** `bun run caveman compress <arquivo>` e `bun run caveman shrink-log` estritamente para **entrada** (*briefs*, logs, JSONs extensos e retornos de subagentes em formato `cavecrew`), mantendo a **saída para o usuário no Relatório Padrão completo**.
  4. **`delegate-skills` (`delegate-fleet.v1` em `.delegate/config.json` — Fallback & Lanes em `gemini-3.8-flash-high`):** Orquestração multi-lane via `agy-delegate` onde todas as lanes (`default`, `fallback`, `fast`, `tests`, `feature`, `ui`, `review`) operam com o modelo **`gemini-3.8-flash-high`** em esforço máximo (`"effort": "high"`).
  5. **Telemetria Obrigatória de Fim de Tarefa (`bun run tokens:report`):** Todo relatório final de tarefa ou milestone deve reportar os tokens economizados por todos os motores (`🌱 graft`, `🕸️ graphify`, `🪨 caveman (input)`, `🤝 delegate-skills`).
- **Tríade Mandatória de UI, Design Engineering & Craft Visual (`ui-craft.md`):**
  1. **`taste-skill` (`design-taste-frontend` — `Leonxlnx/taste-skill`):** Direção de arte anti-slop, hierarquia de luminância (`surface-0..2`) e pipeline de inspeção visual (`draw.mjs --app` -> `lint.mjs` -> `inspect.mjs --app` em `1440px`, `768px`, `390px`).
  2. **`emilkowalski/skills` (`emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `animation-performance`, `break-ui`, `mobile-native`):** Feedback tátil em botões (`transform: scale(0.97)` em `:active`), proibido `scale(0)` (usar `scale(0.95)` + `opacity: 0`), curvas `ease-out` customizadas (`cubic-bezier(0.23, 1, 0.32, 1)`) `< 300ms`, zero animação em ações frequentes de teclado, animações restritas à GPU (`transform`/`opacity`), `tabular-nums` em dimensões/contadores e stress-testing de estados extremos (`break-ui`).
  3. **`impeccable` (`pbakaus/impeccable` v4.8.0):** Separação explícita de superfície (**Operate** para o painel/Studio Visual do Social Panel PRO e **Persuade** para os templates de slides 4:5 exportados) e roteamento estruturado (`shape` -> `layout`/`typeset`/`colorize` -> `critique`/`audit` -> `polish`/`harden`).
- **Diagrama Único de Arquitetura (`Archify`):** Mantido em `docs/architecture.html` (especificação em `.archify/architecture/candidate.json`), atualizado a cada milestone via `bun run archify` e servido em `/architecture`.

<!-- prowl-agent -->
## Prowl project context

This repo has a Prowl index of its files, symbols, and how they connect. For any
semantic or structural question -- where code is, what it does, who calls it, or
what a change touches -- **run the read-only prowl CLI first**; do not grep or
read whole files just to locate things. Prowl reindexes what changed before each
query, so answers stay current and are cited to file:line, returned in one call
instead of a grep hit list you then open files to disambiguate.

| Question | First command |
|---|---|
| Map the repository | `prowl overview` |
| Locate a feature or concept | `prowl search "<question>"` |
| Locate a named symbol | `prowl find <name>` |
| Read one symbol's source | `prowl def <name-or-id>` |
| Inspect a file's structure | `prowl outline <path>` |
| Trace who uses a symbol | `prowl references <name-or-id>` |
| Size a change's blast radius | `prowl impact <path>` |
| Inspect uncommitted work | `prowl wip` / `prowl changed` |
| Read a located line range | `prowl peek <file:start-end>` |

Keep grep for exact literal or regex text and glob for filename patterns. CLI
output is token-lean TOON by default; add --format human|toon|json|markdown. If
your harness also wires Prowl as an MCP server, the same index is reachable
there; the CLI needs no server and is the first choice.
<!-- /prowl-agent -->

<!-- prowl-agent:map -->
## Prowl project map

Auto-generated from the Prowl index, refreshed on each `overview`/`init`. Prefer retrieving from Prowl (and reading the cited files) over grepping or relying on training memory; this is the current shape of the repo.

- size: 91 files, 2229 symbols, 356 edges (resolved 219, external deps 128, unresolved 9)
- languages: typescript:56 tsx:20 json:7 markdown:6 css:1 toml:1
- subsystems: src/client(27,tsx) · src/server(22,typescript) · tests/server(16,typescript) · scripts(2,typescript)
- entrypoints: src/server/index.ts · src/client/main.tsx · src/server/db/seed.ts · scripts/graft.ts · src/server/db/migrate.ts
- central files (most depended-on): src/server/db/schema.ts · src/client/lib/utils.ts · src/server/db/client.ts · src/server/services/ai/provider.ts · src/server/index.ts
- read these guides first: README.md · AGENTS.md

Depth on demand: `prowl find|def|outline|references <name>`, `search <text>`, `context search "<question>"`, `sketch <ui>`.
<!-- /prowl-agent:map -->

# 🏛️ Guia Permanente de Arquitetura: Problemas "Invisíveis", Máquinas de Estado Explícitas & Invariantes de Domínio

> **Propósito:** Documento vivo de aprendizado permanente para engenheiros humanos e agentes de IA que atuam no **Social Panel (`insta-auto-panel`)**.  
> **Guia Didático Complementar para Humanos:** [`../guides/estudo-arquitetura-invisivel.md`](../guides/estudo-arquitetura-invisivel.md) (leitura didática dos 7 livros, exercícios práticos e lentes mentais).  
> **Regra Vinculada:** [AGENTS.md](../../AGENTS.md) e [Multi-Agent Contracts](../standards/multi-agent-contracts.md).

---

## 1. O Que São Problemas Arquiteturais "Invisíveis"?

Problemas arquiteturais invisíveis são falhas estruturais onde **100% dos testes unitários de caminho feliz passam**, o compilador não aponta erros de sintaxe, mas o sistema entra em **estados contraditórios, perde dados silenciosamente ou degrada ao longo do tempo** devido a:
1. **Máquinas de Estado Implícitas (*Boolean Soup* & Strings Livres):** Múltiplas flags booleanas independentes (`isLoading`, `isSaving`, `isRendering`, `isGeneratingAI`) ou colunas `status` alteradas sem tabela formal de transições e pré-condições (*guards*).
2. **Acoplamento Temporal (*Temporal Coupling*):** O sucesso de uma operação depende de o chamador executar passos na ordem exata ou dentro de uma janela de tempo sem garantias atômicas.
3. **Fontes da Verdade Duplicadas (*Split-Brain / Dual-Write Drift*):** O mesmo estado reside simultaneamente no SQLite, no sistema de arquivos (`data/autosocial/queue/`) e em múltiplos `useState` do React sem reconciliação transacional.
4. **Falhas Parciais Não-Transacionais (*Partial Failure States*):** Loops de `INSERT`/`UPDATE` fora de `db.transaction()` ou gravações em disco sem compensação (*rollback*) quando o banco falha.

---

## 2. Catálogo das 7 Máquinas de Estado Implícitas Identificadas na Codebase

| # | Máquina de Estado | Onde Estava Implícita | Sintoma / Bug Real | Solução Arquitetural Canônica |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Ciclo de Vida Editorial do Post (`PostStatus`)** | [`schema.ts#L30-L38`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/db/schema.ts#L30-L38), [`schedules.ts#L28`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/schedules.ts#L28), [`useWeekSchedule.ts#L77`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/hooks/useWeekSchedule.ts#L77), [`PublicationQueue.tsx#L37`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/PublicationQueue.tsx#L37) | Divergência `"published"` (schema) vs `"posted"` (rotas e UI), falta do estado `"failed"` e mutações diretas sem validar pré-condições. | FSM pura `post-lifecycle.machine.ts` com estados `draft -> ai_generated -> ready_design -> queued -> published \| failed` e função `transitionPostStatus()`. |
| **2** | **Fila Física AutoSocial vs. SQLite** | [`autosocial.ts#L41-L167`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/export/autosocial.ts#L41-L167), [`PublicationQueue.tsx#L83-L165`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/PublicationQueue.tsx#L83-L165) | Quando o worker move arquivos de `pending/` para `published/` ou `failed/`, o SQLite permanece preso em `queued`; cliques duplos geram arquivos duplicados em `pending/`. | Enfileiramento **idempotente por `postId`** + reconciliador automático `reconcileAutoSocialQueueWithDb(companyId)` ao consultar a fila/cronograma. |
| **3** | **Workflow Assíncrono do Studio Visual (*Boolean Soup*)** | [`DesignStudioTab.tsx#L159-L178`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/DesignStudioTab.tsx#L159-L178) e [`L372-L547`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/DesignStudioTab.tsx#L372-L547) | 7 booleans independentes permitem condições de corrida ao trocar de dia (`selectedDayIndex`) enquanto uma geração de IA está em voo. | Redutor determinístico `useStudioWorkflowMachine` (`idle \| saving \| generating_ai \| generating_bg \| rendering \| error`) com token de versão/postId. |
| **4** | **Boot & Sessão de Autenticação do Home Server** | [`App.tsx#L272-L315`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/App.tsx#L272-L315), [`session.ts#L15-L138`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/auth/session.ts#L15-L138) | Booleano `isLocked` monta `<CompanyProvider>` antes de `/api/auth/me` responder, gerando rajadas `401` no primeiro render se o cookie expirou. | FSM explícita `'bootstrapping' \| 'authenticated' \| 'unauthenticated'` antes de montar os provedores autenticados. |
| **5** | **Saúde & Expiração dos Cookies Instagram** | [`schema.ts#L329`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/db/schema.ts#L329), [`settings.ts#L190-L265`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/settings.ts#L190-L265) | O estado `'expired'` nunca era ativado mesmo quando o timestamp `expires` do `sessionid` já havia vencido ou o arquivo `cookies.json` não existia. | Validador determinístico `evaluateInstagramSessionState()` inspecionando existência física e `expires` real do cookie. |
| **6** | **Modo Operacional & Fallback de Provedores IA** | [`quota-guard.ts#L102-L162`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/ai/quota-guard.ts#L102-L162), [`design.ts#L90-L135`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/design.ts#L90-L135) | Condicionais booleanas aninhadas misturam falta de chave, estouro de orçamento e falha de rede sem estado explícito de degradação. | Estado explícito `executionMode`: `'live_api' \| 'quota_svg_fallback' \| 'missing_key_svg_fallback' \| 'upstream_error_svg_fallback' \| 'blocked_hard_quota'`. |
| **7** | **Ciclo de Edição de Formulários (*Dirty State*)** | [`CompanyTab.tsx#L79-L155`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/CompanyTab.tsx#L79-L155), [`DesignStudioTab.tsx#L319-L410`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/DesignStudioTab.tsx#L319-L410) | Edições não salvas (`dirty`) são descartadas silenciosamente ao trocar de aba/empresa, e timers `setTimeout` não são limpos no unmount. | Estados explícitos `'clean' \| 'dirty' \| 'saving' \| 'saved' \| 'error'` + guarda de navegação e unificação atômica do salvamento. |

---

## 3. Catálogo dos 16 Problemas Arquiteturais "Invisíveis" Encontrados no Código

### Categoria A — Atomicidade, Transações & Consistência de Dados (ACID vs. Disco)
1. **Escrita Multi-Tabela Sem Transação (`Non-Atomic Multi-Step Write`):** Loops de `INSERT`/`UPDATE` fora de `db.transaction()` em [`schedule-service.ts#L84-L114`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/schedules/schedule-service.ts#L84-L114), [`schedule-service.ts#L207-L227`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/schedules/schedule-service.ts#L207-L227) e [`ai.ts#L433-L481`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/ai.ts#L433-L481).
2. **Dual-Write Não-Transacional entre Disco e SQLite (`Dual-Write Drift`):** Gravação de arquivos em disco sem compensação/rollback caso o SQLite falhe em [`photos.ts#L111-L132`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/photos.ts#L111-L132), [`design.ts#L233-L259`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/design.ts#L233-L259) e [`autosocial.ts#L60-L118`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/export/autosocial.ts#L60-L118).
3. **Vazamento de Arquivos Órfãos em Disco no `ON DELETE CASCADE` (`Storage Garbage Leak`):** Exclusão de empresas/posts em [`companies.ts#L130-L138`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/companies.ts#L130-L138) e [`schedule-service.ts#L326-L336`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/schedules/schedule-service.ts#L326-L336) sem remover diretórios físicos em `data/uploads/`, `data/renders/` e `data/autosocial/`.
4. **Lâminas Fantasmas quando a IA Reduz `slideCount` (`Stale Child Records on Resize`):** Em [`ai.ts#L447-L481`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/ai.ts#L447-L481), reduzir um post de 7 para 4 lâminas atualiza `1..4` mas deixa `5..7` antigas vivas no banco.

### Categoria B — Acoplamento Temporal & Condições de Corrida Cliente-Servidor
5. **Perda Silenciosa de Texto em Novas Lâminas no "Salvar" (`Split-Request Save & Temp-ID Bug`):** [`DesignStudioTab.tsx#L337-L400`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/DesignStudioTab.tsx#L337-L400) cria lâminas com `id: "temp_slide_..."` e faz dois `PUT` seguidos; o segundo `PUT /api/posts/:id/slides` tenta atualizar pelo `temp_slide_...` (que não existe no banco) ou falha em casar por `(postId, slideNumber)`.
6. **Corrida `Check-Then-Act` (TOCTOU) na Criação Automática da Semana:** Duas chamadas simultâneas a [`getOrCreateWeeklySchedule` (`schedule-service.ts#L72-L88`)](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/schedules/schedule-service.ts#L72-L88) tentam inserir o mesmo `scheduleId` sem `onConflictDoNothing()`.
7. **Descompasso de Fuso Horário (`UTC` vs `Local Time`) na Função Triplicada `getMonday()`:** Triplicada em [`useWeekSchedule.ts#L9-L15`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/hooks/useWeekSchedule.ts#L9-L15), [`DesignStudioTab.tsx#L130-L136`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/DesignStudioTab.tsx#L130-L136) e [`PublicationQueue.tsx#L40-L46`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/PublicationQueue.tsx#L40-L46), misturando `getDate()` local com `toISOString()` UTC.

### Categoria C — Fontes da Verdade Duplicadas (*Split-Brain Architecture*)
8. **Três Estados Independentes de Semana/Posts entre as Abas (`Disconnected Client State`):** `WeekPlanner`, `DesignStudioTab` e `PublicationQueue` não compartilham `weekStartDate`.
9. **Divergência entre o Motor de Preview (Canvas 2D) e o Motor de Exportação (PNG Server-Side):** [`DesignStudioTab.tsx#L511-L520`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/client/components/DesignStudioTab.tsx#L511-L520) não envia o snapshot do Canvas ou não compartilha o mesmo pipeline de renderização de alta resolução.
10. **Triplicação de Definição de Schema (`Schema Drift`):** Enums e tabelas redefinidos separadamente em `schema.ts`, `schedules.ts`, `client.ts` e testes.

### Categoria D — Integridade Referencial, Segurança Multi-Tenant & Observabilidade
11. **Referências Fantasmas em Colunas JSON Desnormalizadas (`Dangling IDs in JSON Columns`):** `DELETE /api/photos/:id` ([`photos.ts#L136-L155`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/routes/photos.ts#L136-L155)) não remove o ID excluído do array JSON `posts.selected_photo_ids`.
12. **Mutação de Lâminas por ID sem Escopo Composto `(postId, slideNumber)`:** [`updatePostSlidesContent` (`schedule-service.ts#L260-L278`)](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/schedules/schedule-service.ts#L260-L278) faz `WHERE id = item.id` sem filtrar por `post_id = postId`.
13. **Invariante de Domínio Morta (`photo_assets.timesUsed`):** Contador de uso de fotos nunca é incrementado/atualizado quando fotos são vinculadas ou enfileiradas.
14. **Acoplamento ao Singleton Global `db`:** Dificulta a injeção de conexões `:memory:` isoladas em testes de integração.
15. **Crescimento Ilimitado de `Map` em Memória nos Rate-Limiters (`Unbounded Memory Growth`):** `loginAttempts` ([`session.ts#L15`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/auth/session.ts#L15)) e `rpmBuckets` ([`quota-guard.ts#L13`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/services/ai/quota-guard.ts#L13)) sem `eviction` periódico nem limite máximo de chaves.
16. **Blocos `catch {}` Vazios Ocultando Erros Estruturais:** [`db/client.ts#L42 e #L95`](file:///home/eduardorwll/Projects/Sandbox/src/insta-auto-panel/src/server/db/client.ts#L42-L95) ignoram falhas inesperadas sem diferenciar `duplicate column name` de erros reais.

---

## 4. Bibliografia de Referência & Lentes Mentais de Engenharia

1. ***Domain Modeling Made Functional* — Scott Wlaschin:** *Make Illegal States Unrepresentable* com tipos algébricos (unions discriminadas) e máquinas de estado explícitas no sistema de tipos.
2. ***Constructing the User Interface with Statecharts* — Ian Horrocks:** Substituição de flags booleanas espalhadas em UIs por Statecharts determinísticos.
3. ***Designing Data-Intensive Applications (DDIA)* — Martin Kleppmann:** Fontes únicas da verdade, transações ACID, prevenção de *Dual-Write Drift* e condições de corrida (*TOCTOU*).
4. ***A Philosophy of Software Design* — John Ousterhout:** Redução de carga cognitiva, eliminação de acoplamento temporal e *Design Errors Out of Existence*.
5. ***Release It! (2ª Edição)* — Michael T. Nygard:** Estabilidade em produção, limites em coleções em memória (*Bounded Maps*), limpeza de recursos em disco e degradação graciosa explícita.
6. ***Secure by Design* — Dan Bergh Johnsson, Daniel Deogun & Daniel Sawano:** Invariantes de segurança e escopo multi-tenant embutidos diretamente nas queries e contratos de domínio.
7. ***Software Architecture: The Hard Parts* — Neal Ford et al.:** Coordenação transacional entre banco relacional, sistema de arquivos e provedores externos.

---

## 5. Os 10 Mandamentos de Auditoria Anti-Bugs Invisíveis (Checklist Permanente)

Antes de dar qualquer novo recurso ou refatoração por concluído neste repositório, todo agente deve validar estas **10 Invariantes**:

1. **Zero *Boolean Soup*:** Nenhum componente ou serviço pode ter mais de 1 flag booleana para representar etapas do mesmo fluxo; use sempre uma união discriminada (`status: 'idle' | 'loading' | 'saving' | 'error'`).
2. **Transições de Estado com Guarda Explícita:** Nenhuma coluna `status` no banco pode ser alterada sem passar pela máquina de estados correspondente em `src/shared/state-machines/`.
3. **Transações ACID Obrigatórias em Mutações Multi-Passo:** Toda função que executa mais de um `INSERT`/`UPDATE`/`DELETE` no SQLite deve rodar dentro de `db.transaction()` (ou transação síncrona do `bun:sqlite`).
4. **Idempotência e Reconciliação Banco ↔ Disco:** Toda gravação na fila do AutoSocial deve ser idempotente por `postId` e reconciliar estados físicos (`pending/`, `published/`, `failed/`) com o SQLite.
5. **Chave Natural Composta `(postId, slideNumber)` para Lâminas:** Nunca depender de IDs temporários gerados no frontend (`temp_slide_...`); atualizar e sincronizar lâminas sempre pelo par `(postId, slideNumber)` e podar lâminas excedentes (`slideNumber > slideCount`).
6. **Limpeza Física Simétrica ao `ON DELETE CASCADE`:** Excluir um post, foto ou empresa no SQLite deve remover simetricamente seus artefatos físicos em disco (`uploads`, `renders`, `queue`).
7. **Datas Locais Puras sem Mistura `UTC` (`YYYY-MM-DD`):** Operações de calendário (`getMonday`, `addDays`) devem residir em um único utilitário canônico (`src/shared/calendar-dates.ts`) operando puramente em componentes locais (`getFullYear`, `getMonth`, `getDate`), nunca misturando `getDate()` com `toISOString()`.
8. **Escopo Composto em Queries de Filhos:** Todo `UPDATE` ou `DELETE` em tabela filha (`post_slides`, `photo_assets`, `company_post_types`) deve incluir na cláusula `WHERE` o vínculo com o pai/tenant (`postId` / `companyId`).
9. **Coleções em Memória com Teto (`Bounded Maps`):** Todo cache ou rate-limiter em memória deve ter `MAX_ENTRIES` e poda automática de chaves expiradas.
10. **Proibição de `catch {}` Cego em Migrações:** Só ignorar silenciosamente erros esperados e verificados (ex.: `/duplicate column name/i`), registrando qualquer outro erro estrutural.

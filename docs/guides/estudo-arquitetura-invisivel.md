# 📖 Guia de Estudo: Como Enxergar Problemas de Arquitetura "Invisíveis"

> **Para quem é:** você (humano), para ler com calma e aprender a *ver* esta classe de bug em qualquer projeto.
> **Base:** o que foi encontrado e corrigido no Social Panel nos Marcos M12–M15, ligado aos 7 livros indicados.
> **Companheiro de consulta rápida (para agentes):** [`../architecture/invisiveis-e-maquinas-de-estado.md`](../architecture/invisiveis-e-maquinas-de-estado.md) e [AGENTS.md](../../AGENTS.md).

> [!NOTE]
> **Sobre as referências aos livros:** eu citei conceitos e padrões pelo nome, que é o que dá para buscar no índice. **Não** coloquei números de capítulo nem páginas, porque não tenho como conferir a sua edição. Procure pelo termo no sumário ou índice do livro.

---

## Parte 1 — A ideia central em 5 minutos

Um bug "invisível" é um bug que **nenhum teste de caminho feliz pega**. O código compila, a tela funciona na demonstração, e mesmo assim o sistema fica errado em algum momento: dados somem, estados se contradizem, a memória cresce. Quase sempre a causa é uma destas cinco:

| # | Causa-raiz | Pergunta que revela o problema |
| :-: | :--- | :--- |
| 1 | **Máquina de estado implícita**: o estado existe, mas ninguém o desenhou | "Quais valores esse campo pode ter, e de qual para qual ele pode ir?" |
| 2 | **Escrita parcial**: várias escritas que deveriam ser uma só | "Se o processo cair entre a linha 3 e a linha 4, o que fica no banco?" |
| 3 | **Duas fontes da verdade**: banco, disco e tela guardam a mesma coisa | "Se eu mudar um, quem avisa os outros?" |
| 4 | **Corrida (concorrência)**: duas coisas acontecem "ao mesmo tempo" | "E se o usuário clicar duas vezes? E se trocar de aba no meio?" |
| 5 | **Recurso sem teto**: cresce para sempre | "O que limita o tamanho disso depois de 6 meses ligado?" |

O hábito que resolve tudo: **parar de testar o que o código faz e começar a perguntar o que ele permite que aconteça.**

---

## Parte 2 — Os cinco padrões, com o caso real de cada um

### 2.1 Máquina de estado implícita (e "sopa de booleans")

**O que é.** Quando um fluxo tem etapas (ocioso → salvando → pronto), cada etapa vira uma variável `true/false` separada. Com 7 booleans existem 128 combinações, e só umas 8 fazem sentido. As outras 120 são estados impossíveis que o código não impede.

**Caso real (Social Panel).** O `DesignStudioTab` tinha 7 booleans (`isRendering`, `isGeneratingBg`, `isGeneratingAI`, `isSaving`, `saveSuccess`, `isAddingPost`, `isDeletingPost`). Era possível gerar com IA e renderizar ao mesmo tempo, e se você trocava de dia no meio, a resposta da IA caía **no post errado** (a lista era atualizada por índice, não por id).

**Segundo caso, ainda mais sutil.** A coluna `posts.status` usava `"published"` no schema e `"posted"` na interface. Nenhum erro de compilação, porque era só uma string. O estado `"failed"` nem existia.

**A cura.** Desenhar a tabela de transições e fazer o código recusar o que não está nela:
- [`post-lifecycle.machine.ts`](../../src/shared/state-machines/post-lifecycle.machine.ts): `draft → ai_generated → ready_design → queued → published | failed`. Tentar `draft → published` lança erro (a rota devolve **409**).
- [`studio-workflow.machine.ts`](../../src/shared/state-machines/studio-workflow.machine.ts): uma operação por vez; `FINISH` só vale se for da mesma operação.
- [`auth-boot.machine.ts`](../../src/shared/state-machines/auth-boot.machine.ts): `bootstrapping | authenticated | unauthenticated` no lugar de um `isLocked` que mentia durante o carregamento.

**Como treinar o olho.** Quando você vir dois ou mais `useState<boolean>` no mesmo componente, ou uma coluna `status` do tipo texto, pergunte: *"qual é o diagrama de estados disso?"* Se você não consegue desenhar, ele é implícito.

📚 **Onde aprofundar**
- **Wlaschin, *Domain Modeling Made Functional*:** o princípio **"make illegal states unrepresentable"** (tornar estados ilegais impossíveis de representar). Procure por esse termo e por *discriminated unions / choice types*.
- **Horrocks, *Constructing the User Interface with Statecharts*:** por que a interface vira bagunça sem estados explícitos. Procure por *statecharts*, *concurrent states*, *transitions and guards*.
- **Harel, "Statecharts: A Visual Formalism for Complex Systems" (1987):** o artigo original que o livro de Horrocks populariza (é um paper, não um livro).

---

### 2.2 Escrita parcial (falta de transação)

**O que é.** Uma operação lógica ("criar a semana") são, no código, dezenas de `INSERT` em sequência. Se algo falha no meio, sobra uma semana pela metade, e o próximo acesso lê esse lixo como se fosse válido.

**Caso real.** `getOrCreateWeeklySchedule` inseria o cronograma, depois 7 posts, depois 35 lâminas, tudo em `await` solto. Fora a atomicidade, havia a corrida *check-then-act*: duas requisições simultâneas olhavam "existe?", ambas viam "não", e ambas tentavam criar o mesmo id.

**A cura.** [`schedule-service.ts`](../../src/server/services/schedules/schedule-service.ts): `db.transaction(...)` (tudo ou nada) mais `onConflictDoNothing()` (a segunda requisição converge para o mesmo resultado em vez de falhar).

> [!WARNING]
> **Pegadinha que me custou tempo:** o `db.transaction` do `bun:sqlite` é **síncrono**. Dentro dele não se usa `await`; usa-se `.run()`, `.all()` e `.get()`. Se você escrever `await` lá dentro, o código parece certo e a transação já terminou.

**Como treinar o olho.** Procure `for (...) { await db.insert(...) }`. Pergunte: *"se o processo morrer na iteração 4, o que fica?"*

📚 **Onde aprofundar**
- **Kleppmann, *Designing Data-Intensive Applications*:** o capítulo sobre **transações** (procure *ACID*, *atomicity*, *isolation levels*, *write skew*, *lost updates*). A corrida check-then-act aparece sob o nome de *write skew / phantoms*.

---

### 2.3 Duas fontes da verdade (banco ↔ disco ↔ tela)

**O que é.** O mesmo fato mora em dois lugares e não existe nada que os mantenha iguais. Cedo ou tarde divergem.

**Caso real.** A fila do AutoSocial é uma pasta (`pending/`, `published/`, `failed/`), e o status do post é uma coluna no SQLite. Quando o worker movia o arquivo para `published/`, o SQLite continuava dizendo `queued` **para sempre**. Pior: clicar duas vezes em "enfileirar" criava dois arquivos para o mesmo post.

**Variantes que apareceram no mesmo projeto:**
- Foto apagada no banco, mas o id continuava dentro do JSON `posts.selectedPhotoIds` (*referência pendurada*).
- Excluir empresa apagava as linhas, mas deixava renders e uploads no disco (*lixo órfão*).
- Upload gravava o arquivo e depois o `INSERT` falhava, deixando o arquivo sem dono.

**A cura.** [`autosocial.ts`](../../src/server/services/export/autosocial.ts):
- **Idempotência:** enfileirar o mesmo post duas vezes dá o mesmo resultado (remove o anterior antes de gravar).
- **Reconciliação:** `reconcileAutoSocialQueueWithDb` lê o disco e corrige o banco.
- **Compensação:** se algo falha antes do commit, os arquivos já criados são removidos.
- **Limpeza simétrica:** apagar no banco apaga no disco.

**Como treinar o olho.** Para cada dado, pergunte *"onde mais ele está guardado?"*. Se a resposta for "em dois lugares", pergunte *"qual é a verdade quando divergem, e quem corrige?"*. Se ninguém corrige, é um bug esperando acontecer.

📚 **Onde aprofundar**
- **Kleppmann, DDIA:** o trecho sobre **manter sistemas sincronizados** (*dual writes*, *change data capture*, *event sourcing*) e o *end-to-end argument*. Procure **"dual write"**, o problema tem exatamente esse nome.
- **Ford et al., *Software Architecture: The Hard Parts*:** coordenação entre vários recursos sem transação global (*sagas*, *eventual consistency*, *compensating transactions*).

---

### 2.4 Corridas e acoplamento temporal

**O que é.** O código só funciona se as coisas acontecerem numa ordem, ou numa janela de tempo, que ninguém garante.

**Casos reais:**
- **Id temporário do cliente.** Lâminas novas nasciam com `id: "temp_slide_..."`. O "Salvar" fazia dois `PUT` seguidos, e o segundo tentava atualizar uma linha pelo id temporário, que não existe no banco. **O texto digitado sumia sem erro nenhum.** Cura: a chave natural `(postId, slideNumber)`, e os dois `PUT` viraram um só, atômico.
- **Atualizar filho sem checar o pai.** `UPDATE ... WHERE id = ?` sem `AND post_id = ?`: com um id de outro post, a lâmina dele era alterada. Em sistema multi-empresa isso é vazamento entre clientes.
- **Resposta que chega depois.** A IA responde 8 segundos depois, você já trocou de dia, e a resposta sobrescreve o post errado. Cura: toda resposta carrega o `postId` de origem e é descartada ou aplicada **por id**.
- **Fuso horário.** `getDate()` (local) misturado com `toISOString()` (UTC) deslocava a segunda-feira da semana, dependendo da hora do dia. Estava copiado em 3 lugares, agora existe um só ([`calendar-dates.ts`](../../src/shared/calendar-dates.ts)).

**Como treinar o olho.** Pergunte *"e se isso rodar duas vezes?"*, *"e se a resposta chegar depois que o contexto mudou?"*, *"esse id é estável, ou foi inventado pelo cliente?"*.

📚 **Onde aprofundar**
- **Ousterhout, *A Philosophy of Software Design*:** **acoplamento temporal** e **"define errors out of existence"** (projetar para que o erro não possa acontecer, em vez de tratá-lo depois). O save atômico é um exemplo.
- **Kleppmann, DDIA:** o capítulo sobre **problemas em sistemas distribuídos**, para o raciocínio sobre ordem e tempo (relógios, mensagens atrasadas).

---

### 2.5 Recurso sem teto

**O que é.** Um `Map`, uma lista ou um cache que só cresce. Em desenvolvimento nunca aparece; em produção, semanas depois, a memória enche.

**Caso real.** O limitador de tentativas de login (`session.ts`) e o de requisições por minuto (`quota-guard.ts`) guardavam uma entrada por IP/empresa e **nunca removiam**. Um atacante variando o IP enche a memória. Cura: [`bounded-ttl-map.ts`](../../src/shared/state-machines/bounded-ttl-map.ts), com limite de entradas e expiração por tempo.

**Parente próximo: o `catch {}` cego.** Em `db/client.ts`, um `catch {}` engolia **qualquer** erro de migração, inclusive os reais. Hoje só ignora os erros esperados (`duplicate column name`, `already exists`) e registra o resto.

**Como treinar o olho.** Para cada coleção em memória: *"qual é o tamanho máximo?"*. Para cada `catch`: *"que erros eu estou escondendo de propósito, e quais por acidente?"*.

📚 **Onde aprofundar**
- **Nygard, *Release It!* (2ª ed.):** os padrões **Unbounded Result Sets**, **Steady State**, **Fail Fast**, **Timeouts**, **Circuit Breaker**, **Bulkheads**. Eles falam de sistemas que degradam devagar, sem cair.
- **Johnsson, Deogun & Sawano, *Secure by Design*:** **domain primitives** e invariantes dentro do tipo (a ideia de que o valor inválido nem consegue ser construído).

---

## Parte 3 — As 7 máquinas de estado e as 16 falhas, em uma tabela de consulta

| Item | Padrão (Parte 2) | Status |
| :--- | :-: | :--- |
| FSM #1 ciclo de vida do post | 2.1 | ✅ M12/M13 |
| FSM #2 fila AutoSocial ↔ SQLite | 2.3 | ✅ M14 |
| FSM #3 fluxo do Studio (7 booleans) | 2.1 | ✅ M15 |
| FSM #4 boot de autenticação | 2.1 | ✅ M15 |
| FSM #5 sessão Instagram (`expired`) | 2.1 | ✅ M12 |
| FSM #6 modo operacional de IA (`executionMode`) | 2.1 | ⏳ **pendente** |
| FSM #7 *dirty state* de formulários | 2.1 | 🟡 só no Studio; faltam `CompanyTab`, `WeekPlanner`, `SettingsHub` |
| Bugs 1, 4, 6 (transação, lâminas fantasmas, TOCTOU) | 2.2 | ✅ M13 |
| Bugs 2, 3 (dual-write, órfãos) | 2.3 | ✅ M14 |
| Bugs 5, 12 (temp-id, filho sem escopo) | 2.4 | ✅ M13 |
| Bugs 7, 8 (fuso, semana desconectada) | 2.4 | ✅ M12/M15 |
| Bug 9 (preview Canvas ≠ PNG do servidor) | 2.3 | ⏳ **pendente** (`clientSlidePngs`) |
| Bugs 11, 13 (referência pendurada, `timesUsed` morto) | 2.3 | ✅ M13 |
| Bugs 15, 16 (mapas sem teto, `catch {}`) | 2.5 | ✅ M12/M13 |
| Bugs 10, 14 (schema triplicado, `db` global) | — | ⏳ **não tratados** |

> [!NOTE]
> Os bugs **10** (definição de schema duplicada) e **14** (singleton `db` global) não entraram em nenhum marco. São dívida técnica registrada, não corrigida.

---

## Parte 4 — Exercícios práticos no próprio código

Cada exercício leva uns 15 a 30 minutos e treina um olhar específico.

1. **Desenhe o diagrama de estados do post à mão** e compare com [`POST_STATUS_TRANSITIONS`](../../src/shared/state-machines/post-lifecycle.machine.ts). Há alguma transição que você discordaria? (Ex.: `failed → queued` é "tentar de novo", faz sentido?)
2. **Quebre a transação de propósito.** Em [`updatePostWithSlides`](../../src/server/services/schedules/schedule-service.ts), lance um erro depois da poda de lâminas e rode o teste `integrity-m13.test.ts`. O que o teste diz? Isso mostra a diferença entre "falhar" e "falhar sem deixar lixo".
3. **Reproduza a corrida da IA.** Imagine o `DesignStudioTab` antigo: dispare a geração, troque o dia, espere a resposta. Escreva em papel o que `updatedPosts[selectedDayIndex] = updatedPost` fazia.
4. **Procure o próximo `catch {}`.** `grep -rn "catch {}" src/` e classifique cada um: *esperado* ou *acidental*?
5. **Caça ao booleano.** `grep -rn "useState<boolean>\|useState(false)" src/client` e agrupe por componente. Onde há 3 ou mais no mesmo fluxo, desenhe os estados reais. (Candidatos: `CompanyTab`, `SettingsHub`.)
6. **Pergunte "e se rodar duas vezes?"** para cada rota `POST` em `src/server/routes/`. Quais são idempotentes? Quais criam duplicata?

---

## Parte 5 — Plano de leitura sugerido

Não leia tudo. Ordene pelo que mais dói no seu projeto agora.

| Ordem | Livro | Leia isto primeiro | Por quê agora |
| :-: | :--- | :--- | :--- |
| 1 | **Wlaschin**, *Domain Modeling Made Functional* | A parte sobre modelar com tipos e *illegal states* | Resolve a causa nº 1 e é a mais fácil de aplicar já |
| 2 | **Horrocks**, *Statecharts* (e/ou o paper de Harel) | Estados concorrentes e guardas | Você ainda tem formulários sem *dirty state* |
| 3 | **Kleppmann**, *DDIA* | Transações; manter sistemas sincronizados | É a base de M13 e M14 |
| 4 | **Nygard**, *Release It!* | Padrões de estabilidade | Para quando o painel rodar 24/7 em home server |
| 5 | **Ousterhout**, *A Philosophy of Software Design* | Complexidade; "define errors out of existence" | Melhora o design de cada módulo novo |
| 6 | **Secure by Design** | *Domain primitives*; validação no domínio | Multi-tenant e credenciais do Instagram |
| 7 | **Ford et al.**, *The Hard Parts* | Sagas e consistência eventual | Só se o sistema for dividido em serviços |

**Ritmo sugerido:** 1 livro a cada 2 ou 3 semanas, lendo só o trecho indicado. Aplique no código **antes** de passar ao próximo.

---

## Parte 6 — Glossário rápido

| Termo | Em uma frase |
| :--- | :--- |
| **FSM** | Máquina de estados finitos: estados + transições permitidas. |
| **Guard** | Condição que decide se uma transição pode acontecer. |
| **Boolean soup** | Vários booleans soltos fingindo ser uma máquina de estados. |
| **ACID** | Atomicidade, Consistência, Isolamento, Durabilidade: as garantias de uma transação. |
| **TOCTOU** | *Time-of-check to time-of-use*: checar e agir em momentos diferentes. |
| **Idempotente** | Executar uma, duas ou dez vezes dá o mesmo resultado. |
| **Dual-write** | Escrever o mesmo fato em dois lugares sem garantia de que ambos terminam. |
| **Reconciliação** | Rotina que compara duas fontes e corrige a que está errada. |
| **Compensação** | Desfazer manualmente o que já foi feito quando um passo seguinte falha. |
| **Chave natural** | Identificador que vem do próprio domínio (`postId + slideNumber`), não inventado pelo cliente. |
| **Bounded map** | Mapa com tamanho máximo e expiração. |
| **Domain primitive** | Tipo pequeno que só aceita valores válidos. |

---

## Parte 7 — Os cinco hábitos para levar para qualquer projeto

1. **Desenhe o estado antes de escrever o `if`.** Se dá para desenhar, vira união discriminada; se não dá, ainda não está entendido.
2. **Para cada escrita, pergunte "e se parar aqui?"**
3. **Para cada dado, pergunte "onde mais ele mora?"**
4. **Para cada ação, pergunte "e se rodar duas vezes, ou chegar atrasada?"**
5. **Para cada coleção, pergunte "qual é o teto?"**

> [!TIP]
> Esses cinco hábitos viram uma revisão de código de 5 minutos. Faça-os em voz alta na próxima vez que revisar um PR, seu ou de outra pessoa.

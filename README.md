# Social Panel (insta-auto-panel)

> Painel web moderno, autônomo e de alta performance para planejamento editorial, geração assistida por IA agnóstica (ML Studio API, Gemini, OpenAI, Claude), Studio Visual OpenDesign 4:5 (1080×1350px) nativo sem Canva, checklist Instagram SEO (Framework MATCH 2026), exportação Canva Pro e enfileiramento autônomo multi-tenant no motor de publicação **`Katzca/AutoSocial`**.

---

## 🚀 Arquitetura & Stack Tecnológica

- **Runtime & Package Manager:** [Bun v1.4+](https://bun.com)
- **Frontend SPA:** [Vite](https://vitejs.dev) + [React 19](https://react.dev) + TypeScript
- **Estilização & Design System:** [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) + Lucide Icons + Sidebar colapsável moderna.
- **Banco de Dados Relacional:** SQLite ACID com [`bun:sqlite`](https://bun.com/docs/api/sqlite) e [Drizzle ORM](https://orm.drizzle.team) operando em modo **WAL (Write-Ahead Logging)** com `foreign_keys = ON`.
- **Arquitetura em Camadas (Clean Architecture):**
  - **Domínio & Serviços:** `src/server/services/schedules/schedule-service.ts` (gerenciamento de semanas e slides), `src/server/services/instagram/cookies.ts` (parser de cookies do Instagram), `src/server/services/design/` (templates e provedores de imagem), `src/server/services/export/autosocial.ts` (enfileiramento com isolamento estrito de fotos).
  - **Rotas & Controladores:** `src/server/routes/` enxutos, focados na camada de transporte HTTP e validação com Zod schemas.
  - **Hooks Reativos:** `src/client/hooks/useWeekSchedule.ts` desacoplando regras de estado do cronograma da camada de visualização.
- **Inteligência Artificial Agnóstica:**
  - **ML Studio API / LM Studio** local (`http://localhost:1234/v1`)
  - Google Gemini (`gemini-2.5-flash` / Pro)
  - OpenAI (`gpt-4o` / `gpt-4o-mini`)
  - Anthropic Claude (`claude-3-5-sonnet`)
  - Groq (`llama-3.3-70b`) e Ollama local
  - **Instagram SEO 2026 (Framework MATCH):** Alt text gerado para acessibilidade, cluster de palavras-chave, abertura indexável e legenda otimizada com 3 a 5 hashtags sem URLs cruas.
- **Studio Visual OpenDesign 4:5:**
  - Renderizador nativo de carrosséis 4:5 (1080×1350px) com múltiplos temas visuais (Editorial Bold, Clean Minimal, Dark Tech, Modern Gradient).
  - Provedores de imagem: OpenAI DALL-E, OpenRouter, Gemini Imagen e SVG Local de fallback offline.
- **Publicação Autônoma AutoSocial:**
  - Fila estrita e isolada por tenant (`data/autosocial/queue/<company_id>/instagram/pending/`) com sidecars `.description`, mídias numeradas e horário programado.
- **Segurança Defensiva:**
  - Injeção global de headers (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, `Permissions-Policy`).
  - Proteção estrita contra Path Traversal em uploads e renders.
- **Garantia de Qualidade:**
  - 92 testes unitários herméticos com Bun Test (`bun test`).
  - Verificação de tipos TypeScript sem erros (`bun x tsc --noEmit`).

---

## 📋 Funcionalidades Principais

1. **Gestão Multi-Empresa & Brand Kit Isolado:**
   - Troca instantânea de tenant no topo via `CompanySwitcher`.
   - Brand Kit com 4 cores da marca (Primária, Secundária, Fundo, Destaque), nicho, redes sociais e tipografia.
   - Isolamento atômico estrito: fotos, posts, cronogramas, cookies e configurações são 100% particionados por empresa.
2. **Acervo de Fotos Base da Marca:**
   - Upload com validação de imagem e categorização de nicho (`Especialista`, `Produto`, `Logo`, `Fundo`).
   - Servidor estático seguro (`/uploads/*`) com proteção de isolamento de tenant.
3. **Planejador Semanal com Separação por Horário:**
   - Grade semanal de 7 dias com auto-inicialização e navegação de semanas.
   - Definição do horário agendado com badge de período (Manhã, Tarde, Noite).
   - Botão direto para abrir o post selecionado no Studio Visual 4:5.
4. **Studio Visual OpenDesign 4:5:**
   - Edição e visualização em tempo real de carrosséis de 3 a 10 lâminas.
   - Alternância de templates visuais responsivos às cores do Brand Kit.
   - Geração de imagens via IA ou backgrounds SVG sem dependência externa.
5. **Hub Central de Configurações (`SettingsHub`):**
   - Cookies de sessão do Instagram por empresa com parser universal (EditThisCookie, Cookie-Editor, Playwright storageState, Netscape).
   - Seleção e teste de provedores de imagem e templates visuais padrão.
6. **Fila de Publicação AutoSocial:**
   - Enfileiramento direto com sidecar `.description` contendo legenda e horário.
   - Monitor em tempo real de itens Pendentes, Publicados e Falhas no disco.

---

## 🛠️ Execução e Testes

### Instalação
```bash
git clone git@github.com:eduardorwll/insta-auto-panel.git
cd insta-auto-panel
bun install
```

### Iniciar o Servidor
```bash
PORT=3000 bun run src/server/index.ts
```
Acesse no navegador: `http://localhost:3000`

### Executar Testes Unitários
```bash
bun test
```

### Checagem de Tipos TypeScript
```bash
bun x tsc --noEmit
```

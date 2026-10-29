# Social Panel PRO (insta-auto-panel)

> Painel web moderno, autônomo e de alta performance para planejamento editorial, geração assistida por IA agnóstica (com suporte nativo a ML Studio API), visualização em mockup Instagram 4:5, exportação em lote para Canva Pro (Bulk Create) e enfileiramento autônomo no motor de publicação **`Katzca/AutoSocial`**.

---

## 🚀 Arquitetura & Stack Tecnológica

- **Runtime & Package Manager:** [Bun v1.4+](https://bun.com)
- **Frontend SPA:** [Vite](https://vitejs.dev) + [React 19](https://react.dev) + TypeScript
- **Estilização & Design System:** [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) + Lucide Icons
- **Banco de Dados Relacional:** SQLite ACID com [`bun:sqlite`](https://bun.com/docs/api/sqlite) e [Drizzle ORM](https://orm.drizzle.team) operando obrigatoriamente em modo **WAL (Write-Ahead Logging)** com `foreign_keys = ON`.
- **Inteligência Artificial:** Módulo agnóstico com *Adapter Pattern* com suporte a:
  - **ML Studio API / LM Studio** (`http://localhost:1234/v1` ou cloud)
  - Google Gemini (`gemini-2.5-flash` / Pro)
  - OpenAI (`gpt-4o` / `gpt-4o-mini`)
  - Anthropic Claude (`claude-3-5-sonnet`)
  - Groq (`llama-3.3-70b`)
  - Ollama (`llama3.1` local)
  - OpenRouter
- **Motor Visual:** Exportação CSV estruturado com codificação **UTF-8 com BOM (`\uFEFF`)** e escape RFC 4180 para o aplicativo **Bulk Create** do Canva Pro.
- **Motor de Publicação Autônoma:** Pipeline de fila no sistema de arquivos para integração direta com **`Katzca/AutoSocial`** (`queue/<company_id>/instagram/pending/` com sidecars `.description` e mídias associadas).
- **Garantia de Qualidade:** Testes unitários com `bun test` e suíte ponta a ponta (E2E) com [Playwright](https://playwright.dev) com **tolerância zero a erros no console do navegador**.

---

## 📋 Funcionalidades Principais

1. **Gestão Multi-Empresa & Brand Kit Completo:**
   - Troca dinâmica no topo via `CompanySwitcher`.
   - Cadastro e edição de 4 cores de marca (Hex primário, secundário, fundo e destaque), tipografia, WhatsApp (`wa.me`), Bio/Site e Canva Template ID.
   - Deleção em cascata (Cascade Delete) via Foreign Keys no SQLite.

2. **Acervo de Fotos Base Isolado:**
   - Upload de fotos reais (Multipart FormData) salvas em `data/uploads/` com tracking no SQLite.
   - Categorização por nicho (`Especialista`, `Produto`, `Logo`, `Fundo`).
   - Tags e badge de contagem de reutilização (`times_used`).

3. **Planejador Semanal Dinâmico (3 a 10 Slides):**
   - Grade semanal de Segunda a Domingo com auto-inicialização e navegação de semanas.
   - Seletor de categorias editoriais (*Dica Prática, Quebra de Mito, Prova Social, Tutorial, Bastidores, Venda Direta*).
   - Stepper dinâmico de lâminas (de 3 a 10 slides) sincronizando automaticamente capa, miolo e CTA final.
   - Associação visual de fotos do acervo para cada lâmina ou para o post.

4. **Mockup Instagram 4:5 em Tempo Real (`SlidePreview`):**
   - Proporção exata 4:5 (1080×1350px) simulando o feed do Instagram.
   - Aplicação dinâmica das cores do Brand Kit da empresa ativa.
   - Indicador de carrossel (ex: `1/8`), cabeçalho de perfil, título, corpo, CTA e botões de engajamento do Instagram.

5. **IA Generativa Agnóstica com Adapter Pattern:**
   - Modal de configurações (`AISettingsModal`) com teste de conectividade em tempo real.
   - Suporte nativo a **ML Studio API** para modelos locais (ex: `llama-3.1-8b-instruct`) e nuvem sem dependência de chaves pagas.
   - Botão **"Gerar com IA"** que preenche todas as lâminas estruturadas e gera legenda persuasiva com injeção de link do WhatsApp (`https://wa.me/...`) e botão de cópia rápida (*"Copiar Legenda"*).

6. **Exportação Canva Pro & Fila AutoSocial:**
   - Download de arquivo `canva_bulk_create_<company>_<date>.csv` formatado para o Criar em Lote do Canva Pro.
   - Disparo individual ou semanal para a pasta de execução do AutoSocial (`queue/<company>/instagram/pending/`).
   - Monitor de status de fila no sistema de arquivos em tempo real (Pendentes, Publicados e Falhas).

---

## 🛠️ Instalação e Execução Local

### Pré-requisitos
- [Bun](https://bun.com) (versão 1.4 ou superior)
- Navegadores Playwright instalados (`bunx playwright install chromium`)

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone git@github.com:eduardorwll/insta-auto-panel.git
cd insta-auto-panel
bun install
```

### 2. Executar o Servidor de Desenvolvimento
```bash
# Executa servidor Bun backend com API REST e serve os arquivos compilados
bun run dev
```
Acesse no navegador: `http://localhost:3000`

### 3. Build de Produção
```bash
bun run build
```

---

## 🧪 Suíte de Testes e Qualidade

O projeto adota a prática de **TDD (Test-Driven Development)** e o protocolo de **Revisão em Dois Eixos (Spec Match + Standards)**:

### 1. Testes Unitários e de Integração (Bun Test)
Executa todas as 42 asserções cobrindo banco de dados, Drizzle migrations, schemas Zod, Brand Kit, rotas REST, adaptadores de IA, exportação Canva e fila AutoSocial:
```bash
bun test
```

### 2. Checagem Estática de Tipos (TypeScript)
```bash
bun run typecheck
```

### 3. Testes Ponta a Ponta E2E (Playwright)
Executa em navegador headless Chromium com verificação estrita de console limpo (zero erros de JavaScript ou React):
```bash
bun run test:e2e
```

---

## 📁 Estrutura de Diretórios

```
insta-auto-panel/
├── data/
│   ├── app.db                # SQLite ACID em modo WAL
│   ├── uploads/              # Acervo de fotos base
│   └── autosocial/queue/     # Fila de publicação Katzca/AutoSocial
├── drizzle/                  # Migrações versionadas do Drizzle ORM
├── src/
│   ├── client/               # SPA Vite + React 19 + shadcn/ui
│   │   ├── components/       # Componentes de interface (WeekPlanner, SlidePreview, etc.)
│   │   ├── context/          # CompanyContext para multi-tenant
│   │   ├── types/            # Tipos TypeScript do cliente
│   │   └── App.tsx
│   └── server/               # Backend Bun.serve
│       ├── db/               # Cliente SQLite WAL & Schemas Drizzle
│       ├── routes/           # Rotas REST (/companies, /photos, /schedules, /ai, /export)
│       └── services/         # Adapters de IA, Canva CSV e AutoSocial queue
├── tests/
│   ├── e2e/                  # Testes Playwright (tolerância zero a erros de console)
│   └── server/               # Testes unitários Bun Test
└── README.md
```

---

## 📄 Licença
Distribuído sob licença MIT. Desenvolvido para governança autônoma e geração de conteúdo escalável para o Instagram.

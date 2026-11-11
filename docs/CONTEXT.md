# docs/ — Estante de Documentação & Conhecimento do Sistema

Contém as especificações, planos de marcos, arquitetura de máquinas de estado, padrões de engenharia e guias humanos do **Social Panel**.

## Mapa da Estante

| Prateleira | Conteúdo | Contrato / Arquivo |
| :--- | :--- | :--- |
| [`architecture/`](architecture/invisiveis-e-maquinas-de-estado.md) | Catálogo de FSMs e 16 bugs arquiteturais | `invisiveis-e-maquinas-de-estado.md` |
| [`specs/`](specs/requisitos-planejamento.md) | PRD mestre e relatório de engenharia | `requisitos-planejamento.md`, `relatorio-engenharia-negocio.md` |
| [`plans/`](plans/checklist-marcos-m8-a-m15.md) | Checklists de marcos e fluxo de testes Vite | `checklist-marcos-m8-a-m15.md`, `fluxo-desenvolvimento-e-testes.md` |
| [`standards/`](standards/multi-agent-contracts.md) | Padrões de engenharia, UI/UX, TDD e SEO | `multi-agent-contracts.md`, `ui-ux-craft.md`, `tdd-refactoring.md`, `instagram-seo.md` |
| [`guides/`](guides/estudo-arquitetura-invisivel.md) | Guia didático para humanos dos 7 livros | `estudo-arquitetura-invisivel.md` |

## Regra de Edição
- Nenhum documento nesta pasta carrega estado em duplicata.
- Links e caminhos são relativos e auditados por `python3 _tools/links.py`.

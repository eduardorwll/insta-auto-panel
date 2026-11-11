# Padrões Mandatórios de UI/UX Engineering (Tríade de Design)

> **Contexto:** Social Panel (`insta-auto-panel`)  
> **Contrato Vinculado:** [AGENTS.md](../../AGENTS.md) (Seção de Padrões)

Qualquer adição, refatoração, migração ou modificação em componentes visuais, abas, modais, formulários ou painéis deve utilizar e cumprir rigorosamente o kit especializado de engenharia UI/UX:

## 1. `taste-skill` (`Leonxlnx/taste-skill`)
- Zero estética genérica ("AI slop") e zero roxo/indigo padrão.
- Separação tonal por luminância (`surface-0..2`).
- Fontes `>= 11px` (estritamente proibido `text-[9px]`/`text-[10px]`).
- Validação obrigatória via `taste-skill lint` (meta: **0 FAIL**) e `taste-skill inspect` nas viewports `1440px`, `768px` e `390px`.

## 2. `emilkowalski/skills` (`emil-design-eng`)
- Leis físicas de interação: feedback tátil obrigatório em botões interativos (`active:scale-95` ou `active:scale-[0.97]`).
- Proibido `scale(0)` (iniciar em `scale(0.95)` + `opacity: 0`).
- Curvas de transição `ease-out` curtas (`< 300ms`).
- Animações restritas exclusivamente à GPU (`transform`/`opacity`).
- Números dinâmicos e métricas com `tabular-nums`.
- Stress-testing obrigatório com textos longos (`break-ui`).

## 3. `impeccable` (v4.8.0)
- Classificação explícita de superfície:
  - **Modo Operate:** painéis, dashboards e studios de gestão de conteúdo (alta densidade, velocidade, zero distração).
  - **Modo Persuade:** templates 4:5 de conversão/slides.

## 4. Conferência Visual Obrigatória
Toda alteração de UI deve abrir os screenshots gerados em `.taste-skill/inspect/*.jpg` via `read_file` para inspecionar alinhamentos, quebras, contrastes e bordas antes de dar a tarefa por concluída.

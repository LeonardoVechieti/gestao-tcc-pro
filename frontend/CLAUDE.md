# Frontend — GestãoTCC Pro

Instruções específicas para trabalhar neste diretório (`frontend/`). Contexto geral do projeto está no `README.md` da raiz; setup e scripts estão em `frontend/README.md`.

## Foco atual

O trabalho em andamento é a **persona Aluno**: dashboard e a funcionalidade de registro de tema (`src/features/dashboard`, `src/features/student-topic`), com dados mocados até a integração completa com o backend. As telas de referência estão em `../design/` (`dash-aluno.png`, `aluno-registrar-tema.png`, `login.png`).

## Atomic Design

A UI está sendo migrada de CSS monolítico por página para componentes reutilizáveis em `src/shared/ui/`, seguindo Atomic Design:

```
src/shared/ui/
  atoms/       # IconBadge, ThemeToggle...
  molecules/   # StatCard, TimelineItem, AlertRow, DescriptionList, FormField...
  organisms/   # SummaryCards, TimelinePanel, AlertsPanel, InfoPanel...
```

**Regra de extração**: não crie um componente em `shared/ui` antecipando reuso futuro. Extraia quando uma peça já se repete (2+ vezes) dentro da própria feature ou entre features — foi assim que `IconBadge`, `StatCard`, `InfoPanel` etc. nasceram, extraídos de `DashboardPage` e `StudentTopicPage`. Uma feature nova pode (e deve) começar com markup inline; só promova para `shared/ui` quando o padrão se confirmar.

Camadas:
- **atoms**: menor unidade visual com uma única responsabilidade (um badge, um botão de tema). Não conhecem dado de domínio.
- **molecules**: combinam poucos atoms para um propósito (um card de estatística, uma linha de timeline).
- **organisms**: blocos completos de tela, geralmente uma `<section>` inteira (grid de cards, painel de timeline). Recebem dados via props vindos da feature; não fazem fetch.

O fetch de dados e a lógica de página continuam na pasta da feature (`src/features/*`); os componentes de `shared/ui` são "burros" (recebem props, não chamam API nem stores de domínio).

## Estilo: tokens, breakpoints e tema claro/escuro

- **Cores**: `src/styles/_tokens.scss` — `--color-*`, `--tint-*`. Não usar cor "crua" (hex) em CSS novo fora desse arquivo; adicione um token se precisar de uma cor nova.
- **Espaçamento**: `--space-1` a `--space-16`, escala de 4px (`--space-1` = 4px, `--space-2` = 8px, ...). Use em `padding`, `margin` e `gap` sempre — não escreva `1.25rem` direto, use `var(--space-5)`. Dimensões fixas de componente (largura da sidebar, diâmetro de um ícone circular) não fazem parte dessa escala; continuam como `rem` literal.
- **Font-size**: `--font-size-xs` a `--font-size-4xl`. Use em vez de valores soltos (`1.2rem` etc.).
- **Border radius**: `--radius-sm` (8px) para caixas aninhadas dentro de um card (ex.: `draft-status`, item de lista, ícone de cabeçalho), `--radius-lg` (12px) para o card/painel externo (`stat-card`, `work-panel`, `form-panel`), `--radius-pill` (999px) para badges/avatares circulares.
- **Breakpoints**: `src/styles/_breakpoints.scss` — mixins `mq($name)` (mobile-first, `min-width`) e `mq-down($name)` (`max-width`), com `$breakpoints: (sm, md, lg, xl)`. Use os mixins em vez de escrever `@media` com pixels fixos.
- **Tema claro/escuro**: os tokens têm um bloco `[data-theme='dark']` que sobrescreve as variáveis. O tema inicial respeita `prefers-color-scheme` do sistema; o usuário pode alternar via `ThemeToggle` (persistido em `localStorage`, ver `src/shared/stores/theme-store.ts`). Ao estilizar algo novo, use os tokens (`var(--color-text)`, etc.) para que funcione nos dois temas automaticamente — não faça overrides manuais de `[data-theme='dark']` espalhados pelo código.
- **Limitação conhecida**: os componentes do PrimeReact usam o tema pré-compilado `lara-light-cyan` (claro fixo). Os elementos "nossos" (fora do PrimeReact) já respeitam claro/escuro; adaptar os componentes PrimeReact ao tema escuro é um passo futuro (provavelmente via `@primeuix/themes`, que já está instalado mas não em uso).
- **Cuidado com seletores `span`/`i` genéricos**: o Tag e o Button do PrimeReact renderizam `<span>` internamente (`.p-tag`, `.p-tag-value`, `.p-button-icon`). Uma regra tipo `.container span { color: ... }` vaza para dentro deles e quebra a cor/tamanho pretendidos pelo PrimeReact (foi a causa de um bug real de contraste no tema escuro — texto de status quase invisível). Sempre que precisar estilizar um texto específico, dê a ele uma classe própria (ex.: `.muted-text`) em vez de mirar a tag genérica.

## Responsividade

Mobile e desktop são tratados na mesma implementação (não há telas separadas). Ao construir uma tela nova:
1. Comece pelo layout mobile (uma coluna).
2. Adicione `@include mq(md) { … }` / `@include mq(lg) { … }` para expandir grids em telas maiores (ver exemplos em `src/index.scss`, seção final).
3. Teste sempre nos dois extremos — o layout do sidebar já colapsa para menu mobile abaixo de `md` (860px), então esse é o breakpoint crítico de qualquer tela nova.

## Dados fictícios e a flag `VITE_BACKEND_ACTIVE`

Com `VITE_BACKEND_ACTIVE` diferente de `'true'` (padrão), as chamadas de API caem em dados fictícios de `src/assets/mocks/*.json` em vez de bater no backend. Ver `src/shared/config/env.ts` (`isBackendActive()`), `src/shared/api/dashboard-api.ts` e `src/shared/api/tema-tcc-api.ts` para o padrão: a função de API sempre existe e tem a mesma assinatura/retorno independente da flag; só o corpo troca entre `return mock` e a chamada `apiClient` real. Ao criar uma nova chamada de API, siga esse padrão em vez de deixar mock e integração real divergentes.

## Autenticação (planejada, não implementada)

Login via OAuth2 (Google) — ver `design/login.png`. O front enviará o token de sessão ao backend; o backend expõe um middleware de autenticação hoje desabilitado enquanto essa integração não existe.

# GestãoTCC Pro — Frontend

Aplicação web (SPA) do GestãoTCC Pro, plataforma de gestão de Trabalhos de Conclusão de Curso para alunos, professores/orientadores e coordenação.

## Stack

- **React 19** + **TypeScript** + **Vite** (build/dev server)
- **React Router** — navegação client-side
- **TanStack Query** — cache e sincronização de dados assíncronos com a API
- **Zustand** — estado de UI local (ex.: `layout-store` do sidebar)
- **React Hook Form** + **Zod** — formulários e validação
- **PrimeReact** + **PrimeIcons** — biblioteca de componentes de UI
- **Axios** — cliente HTTP
- **Sass** — tokens de design e mixins de breakpoint
- **Oxlint** — lint

## Pré-requisitos

- Node 24 (ver `.nvmrc` do backend; o frontend não fixa versão própria, mas segue a mesma)
- Backend (`api-tcc-pro`) rodando — ver README na raiz do projeto

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Variáveis de ambiente

| Variável               | Descrição                                                            | Exemplo                  |
|------------------------|------------------------------------------------------------------------|---------------------------|
| `VITE_API_URL`         | URL base da API (backend AdonisJS)                                    | `http://localhost:3333`   |
| `VITE_BACKEND_ACTIVE`  | `'true'` usa a API real; qualquer outro valor usa dados fictícios (`src/assets/mocks/`) | `false` |

Sem `.env`, o `apiClient` cai no fallback `http://localhost:3333` (ver [api-client.ts](src/shared/api/api-client.ts)).

## Scripts

| Comando           | Descrição                                  |
|-------------------|---------------------------------------------|
| `npm run dev`     | Sobe o servidor de desenvolvimento (Vite)   |
| `npm run build`   | Type-check (`tsc -b`) + build de produção   |
| `npm run preview` | Serve o build de produção localmente        |
| `npm run lint`    | Roda o Oxlint                               |

## Estrutura de pastas

```
src/
  app/                # bootstrap da aplicação
    providers/         # providers globais (React Query, PrimeReact, Router)
    routes/             # definição de rotas
  features/            # uma pasta por domínio/tela (dashboard, tema, tccs...)
  shared/
    api/                # cliente HTTP e chamadas à API por recurso
    layout/             # layout compartilhado (sidebar, topbar)
    stores/             # estado global leve (Zustand): sidebar, tema claro/escuro
    ui/                  # componentes de Atomic Design (atoms/molecules/organisms)
  styles/
    _tokens.scss         # design tokens (cores, sombra, dimensões) — claro e escuro
    _breakpoints.scss    # mixins de breakpoint (mq/mq-down: sm, md, lg, xl)
  index.scss            # estilos globais, importa tokens e breakpoints
  vite-env.d.ts         # tipagem das env vars do Vite
```

### Convenção de UI: Atomic Design

A UI está sendo migrada do CSS por página em `index.scss` para componentes reutilizáveis em `src/shared/ui/`, organizados por tamanho de responsabilidade:

- **atoms/** — menor unidade visual reutilizável (`IconBadge`, `ThemeToggle`)
- **molecules/** — combinação de poucos átomos com um propósito (`StatCard`, `TimelineItem`, `AlertRow`, `DescriptionList`, `FormField`)
- **organisms/** — blocos completos de tela (`SummaryCards`, `TimelinePanel`, `AlertsPanel`, `InfoPanel`)

Regra prática: **não extrair componente antecipadamente**. Uma peça só migra para `shared/ui` quando passa a se repetir de fato — foi assim que os componentes acima nasceram, extraídos do Dashboard e da tela de registro de tema. Evitar criar uma camada de design system completa antes de haver uso real. Detalhes de convenção (o que é atom/molecule/organism, quando extrair) estão em [`CLAUDE.md`](CLAUDE.md).

### Tokens, breakpoints e tema claro/escuro

- Cores, espaçamento (`--space-1`...`--space-16`, base 4px), font-size (`--font-size-xs`...`--font-size-4xl`) e border radius (`--radius-sm`/`--radius-lg`/`--radius-pill`) são CSS custom properties definidas em [`src/styles/_tokens.scss`](src/styles/_tokens.scss) — usar `var(--color-*)`, `var(--space-*)`, `var(--font-size-*)` em vez de valores soltos.
- Breakpoints (`sm`, `md`, `lg`, `xl`) viram mixins Sass em [`src/styles/_breakpoints.scss`](src/styles/_breakpoints.scss): `@include mq(lg) { ... }` (mobile-first) e `@include mq-down(md) { ... }` (até um breakpoint).
- Tema claro/escuro: os tokens têm uma variante `[data-theme='dark']`. O tema inicial segue `prefers-color-scheme` do sistema e pode ser alternado pelo `ThemeToggle` no topbar (persistido em `localStorage` via `src/shared/stores/theme-store.ts`). Os componentes do PrimeReact ainda usam o tema pré-compilado claro (`lara-light-cyan`) — adaptá-los ao escuro fica para uma próxima etapa.

### Dados fictícios

Com `VITE_BACKEND_ACTIVE` diferente de `'true'`, as funções em `src/shared/api/*` retornam dados fictícios de `src/assets/mocks/*.json` em vez de chamar o backend — assim dá para desenvolver a UI sem depender da API estar no ar. Ver detalhes em [`CLAUDE.md`](CLAUDE.md).

As referências visuais ficam em [`../design/`](../design/) (login, dashboards de aluno/professor/coordenação, fluxos de TCC).

### Autenticação (planejada)

O login será via OAuth2 (Google, conforme tela `design/login.png`). O fluxo: o front recebe o token de sessão do provedor OAuth2 e o backend expõe um middleware de autenticação para validá-lo — hoje esse middleware está desabilitado no backend enquanto o frontend não está pronto para enviá-lo.

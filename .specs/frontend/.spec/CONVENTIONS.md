# Conventions — frontend

Shipped (was "not yet implemented" as of 2026-07-01). Source of truth is
`frontend/CLAUDE.md` — this file summarizes it; if they ever disagree, trust
`frontend/CLAUDE.md`.

## Atomic Design — extract on repetition, not in advance

`src/shared/ui/{atoms,molecules,organisms}/`. **Don't** create a `shared/ui` component
anticipating future reuse — extract only once a pattern already repeats 2+ times within
a feature or across features (this is how `IconBadge`, `StatCard`, `InfoPanel`, etc.
were born, extracted from `DashboardPage`/`StudentTopicPage`). A new feature can and
should start with inline markup.

- **atoms** — smallest visual unit, single responsibility, no domain data
  (`IconBadge`, `ThemeToggle`).
- **molecules** — a few atoms combined for one purpose (`StatCard`, `TimelineItem`,
  `AlertRow`, `DescriptionList`, `FormField`).
- **organisms** — a full screen block, usually a whole `<section>` (`SummaryCards`,
  `TimelinePanel`, `AlertsPanel`, `InfoPanel`). Receive data via props from the feature
  — they don't fetch.

Data fetching and page logic stay in `src/features/<feature>/`; `shared/ui` components
are "dumb" (props in, no API/store calls).

## Styling: tokens, breakpoints, dark/light

- **Colors**: `src/styles/_tokens.scss` (`--color-*`, `--tint-*`). No raw hex in new
  CSS outside that file — add a token if you need a new color.
- **Spacing**: `--space-1`…`--space-16`, 4px scale (`--space-1` = 4px, `--space-2` =
  8px, …). Always use these in `padding`/`margin`/`gap` — never a literal `1.25rem`.
- **Font-size**: `--font-size-xs`…`--font-size-4xl`.
- **Border radius**: `--radius-sm` (8px, nested boxes inside a card),
  `--radius-lg` (12px, the outer card/panel), `--radius-pill` (999px, circular
  badges/avatars).
- **Breakpoints**: `src/styles/_breakpoints.scss` — `mq($name)` (mobile-first,
  `min-width`) and `mq-down($name)` (`max-width`), `$breakpoints: (sm, md, lg, xl)`.
  Use these mixins instead of hand-written `@media` with pixel values.
- **Dark/light theme**: tokens have a `[data-theme='dark']` override block. Initial
  theme follows `prefers-color-scheme`; user toggle persists to `localStorage` via
  `theme-store.ts`. Style new things through the tokens (`var(--color-text)`, etc.) so
  both themes work automatically — don't scatter manual `[data-theme='dark']`
  overrides.
- **Known limitation**: PrimeReact components use the precompiled `lara-light-cyan`
  theme (light-only) — not yet adapted to dark mode (`@primeuix/themes` is installed
  but unused for this). Everything outside PrimeReact already respects both themes.
- **Avoid generic `span`/`i` selectors**: PrimeReact's `Tag`/`Button` render internal
  `<span>`s (`.p-tag`, `.p-tag-value`, `.p-button-icon`). A rule like
  `.container span { color: ... }` leaks into them and breaks PrimeReact's intended
  styling (caused a real dark-mode contrast bug — status text nearly invisible). Give
  text you want to style its own class (e.g. `.muted-text`) instead of targeting the
  bare tag.

## Responsiveness

Mobile and desktop share one implementation (no separate screens). Build mobile-first
(single column), then expand with `@include mq(md)` / `@include mq(lg)`. The sidebar
already collapses to a mobile menu below `md` (860px) — treat that as the critical
breakpoint for any new screen.

## Mock data / `VITE_BACKEND_ACTIVE`

Every API function in `src/shared/api/*.ts` keeps the same signature and switches
between a real `apiClient` call and a static fixture in `src/assets/mocks/*.json` based
on `isBackendActive()` (`src/shared/config/env.ts`). Follow this pattern for new API
calls instead of letting mock and real-integration code diverge — see
`.specs/frontend/.spec/INTEGRATIONS.md`.

## Language

UI copy and identifiers are PT-BR, matching the entirely-PT-BR backend domain (see
`.specs/backend-api/.spec/CONVENTIONS.md`).

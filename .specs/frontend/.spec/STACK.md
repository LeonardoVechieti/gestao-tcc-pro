# Stack — frontend (`frontend/`)

Shipped (was "decided, not scaffolded" as of 2026-07-01 — fully built now).

- **Framework**: React 19 (`react`/`react-dom` ^19.2.7), built with Vite ^8.1.1
  (`@vitejs/plugin-react`), dev server via `vite --host 127.0.0.1` on **port 4002**
  (`vite.config.ts`).
- **Language**: TypeScript ~6.0.2, `tsc -b` as part of `npm run build`.
- **UI component library**: PrimeReact ^10.9.8 + PrimeIcons. Uses the pre-compiled
  `lara-light-cyan` theme (light-only) — `@primeuix/themes` is installed but not yet
  wired up, so PrimeReact components don't follow the app's dark/light theme toggle
  (known limitation, see `frontend/CLAUDE.md`).
- **Component architecture**: Atomic Design (`atoms/molecules/organisms` under
  `src/shared/ui/`), adopted **incrementally** — don't build a `shared/ui` component
  anticipating reuse; extract once a pattern already repeats 2+ times. See
  `.specs/frontend/.spec/CONVENTIONS.md`.
- **Routing**: `react-router-dom` ^7.18.1 (`src/app/routes/AppRoutes.tsx`).
- **Server state / data fetching**: `@tanstack/react-query` ^5.101.2.
- **Client state**: `zustand` ^5.0.14 — `auth-store.ts` (session/JWT, persisted to
  `localStorage`), `theme-store.ts` (light/dark), `layout-store.ts` (sidebar).
- **Forms/validation**: `react-hook-form` ^7.80.0 + `@hookform/resolvers` ^5.4.0 +
  `zod` ^4.4.3.
- **HTTP**: `axios` ^1.18.1 (`src/shared/api/api-client.ts`).
- **Styling**: Sass ^1.101.0, CSS custom-property design tokens
  (`src/styles/_tokens.scss`), responsive mixins (`src/styles/_breakpoints.scss`).
- **Other UI libs**: `@dnd-kit/*` (drag-and-drop), `react-pdf` ^10.4.1.
- **Lint**: `oxlint` ^1.71.0 (**not** ESLint) — `npm run lint`.
- **Testing**: none configured — no Vitest/Jest/Playwright in `devDependencies`. See
  `.specs/frontend/.spec/TESTING.md`.
- **Env vars** (`.env`, see `.env.example`): `VITE_API_URL` (backend base URL, default
  `http://localhost:3003`), `VITE_BACKEND_ACTIVE` (`'true'` = hit the real API,
  anything else = fall back to `src/assets/mocks/*.json`), `VITE_OAUTH_GOOGLE_CLIENT_ID`
  (must match the backend's `GOOGLE_CLIENT_ID`), `VITE_API_REDIRECT_URI`,
  `VITE_DEV_ALUNO_EMAIL` / `VITE_DEV_ALUNO_SENHA` (dev convenience login).

Backend CORS (`api-tcc-pro/config/cors.ts`) already allowlists `localhost:4002` —
matches this app's dev port, no CORS config change needed.

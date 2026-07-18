# Integrations — frontend

Shipped (was "not yet implemented" as of 2026-07-01).

## Backend API (`api-tcc-pro`)

- `src/shared/api/api-client.ts` — Axios instance, base URL from `VITE_API_URL`
  (default `http://localhost:3003`), auto-attaches `Authorization: Bearer <token>` from
  the Zustand `auth-store`. `api-errors.ts` normalizes error responses.
- One file per backend resource under `src/shared/api/`: `auth-api.ts`, `admin-api.ts`
  (usuarios/roles/perfis/alunos/professores CRUD), `dashboard-api.ts`, `tcc-api.ts`,
  `tcc-documento-api.ts`, `tema-tcc-api.ts`, `orientation-api.ts`,
  `cronograma-api.ts`, `notificacao-api.ts`, `professor-api.ts`, `feriado-api.ts`.
  Nearly every backend module has a matching frontend API file.
- Swagger docs at `/tcc-pro/swagger` on the backend (see
  `.specs/backend-api/.spec/STACK.md`) — check there for exact request/response
  shapes before wiring a new call.

## Mock-data fallback

Every function above keeps the same signature whether `VITE_BACKEND_ACTIVE=true` or
not; when not `'true'`, it returns a fixture from `src/assets/mocks/*.json`
(`perfil.mock.json`, `feriados.mock.json`, `tccs.mock.json`,
`dashboard-professor.mock.json`, `dashboard-aluno.mock.json`, `temas.mock.json`,
`orientacoes.mock.json`) instead of calling the API. Lets frontend work proceed
without a live backend — see `.specs/frontend/.spec/CONVENTIONS.md`.

## Auth

- Email/password: `POST /tcc-pro/auth/login`, `POST /tcc-pro/auth/register` via
  `auth-api.ts`.
- Google OAuth: frontend loads the Google Identity Services script
  (`https://accounts.google.com/gsi/client`) client-side using
  `VITE_OAUTH_GOOGLE_CLIENT_ID` (**must match** the backend's `GOOGLE_CLIENT_ID` env
  var — a mismatch or missing value leaves the "Carregando Google…" button stuck
  forever, since the script never gets requested), gets an ID token, and POSTs it to
  `POST /tcc-pro/auth/google`.
- Session: JWT stored via `auth-store.ts` (Zustand, persisted to `localStorage` under
  `gestaotcc:auth-user`). The frontend **decodes** the JWT client-side (`atob`, no
  signature verification) only to read role claims for UI purposes — the backend
  remains the real authorization boundary (which itself doesn't fully enforce
  Role/Perfil yet, see `.specs/backend-api/.spec/CONCERNS.md`).
- `RequireAuth` in `AppRoutes.tsx` re-validates the stored token against
  `GET /tcc-pro/auth/me` on mount and logs out on a 401/403.

## Known integration gaps

- Professor identity is resolved by email lookup in some screens (`/perfil`,
  `/orientacoes`) instead of coming from the JWT — tracked as **ORIENT-013**, see
  `.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.
- `/documentos` has no real upload integration yet (ORIENT-008).

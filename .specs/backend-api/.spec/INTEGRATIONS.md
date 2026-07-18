# Integrations — backend-api

## External HTTP

- **Feriados API** (`FERIADOS_API_URL` env var) — consumed by
  `app/services/feriado_service.ts` / `app/interfaces/feriado.ts`, likely used to skip
  holidays when scheduling agenda/apresentação dates. Check this service before adding
  any date-scheduling logic (`agenda_service.ts`, `agenda_controller.ts`).

## Auth providers

- `google-auth-library` is **live**: `app/services/auth_service.ts` →
  `verifyGoogleIdToken` uses `OAuth2Client.verifyIdToken` (audience = `GOOGLE_CLIENT_ID`
  env var) from `AuthController.loginWithGoogle` (`POST /tcc-pro/auth/google`).
  First-time Google login auto-provisions a `Usuario` with `GOOGLE_DEFAULT_PERFIL_UUID`
  and a random placeholder password.
- `apple-signin-auth` is in `dependencies` but has **no controller/route wiring
  anywhere** — planned-but-unused, confirm before building on it.

## Scheduling

- `adonisjs-scheduler` + `node-cron` — likely drives periodic feriado sync or
  notificação generation. Confirm the cron definition location before adding new
  scheduled jobs (not found under `app/` during this pass — check `providers/app_provider.ts`
  or a `start/` preload).

## Database

- PostgreSQL only (`pg` client), single connection named `pg` in `config/database.ts`.
  Hosted on **Neon** (serverless Postgres, `sa-east-1` region — confirmed via
  `DB_HOST` in `api-tcc-pro/.env`). No read replicas, no queue/cache layer (no Redis
  dep present), despite `adonisjs-scheduler` + `node-cron` being installed with no
  cron job registered anywhere in the codebase.

## Frontend integration

- `config/cors.ts` allowlists `http://localhost:4002`, `http://localhost:4003`,
  `http://localhost:4200`, `http://127.0.0.1:4002`. The frontend's actual Vite dev
  port (`frontend/vite.config.ts`) is **4002** — already covered. Frontend calls the
  API via `frontend/src/shared/api/api-client.ts` (Axios, base URL from
  `VITE_API_URL`, auto-attaches `Authorization: Bearer <token>`). See
  `.specs/frontend/.spec/INTEGRATIONS.md`.

# Integrations — backend-api

## External HTTP

- **Feriados API** (`FERIADOS_API_URL` env var) — consumed by
  `app/services/feriado_service.ts` / `app/interfaces/feriado.ts`, likely used to skip
  holidays when scheduling agenda/apresentação dates. Check this service before adding
  any date-scheduling logic (`agenda_service.ts`, `agenda_controller.ts`).

## Auth providers (deps present, usage not yet confirmed in code read so far)

- `google-auth-library`, `apple-signin-auth` are in `dependencies` — suggests
  planned Google/Apple social login, but no controller/route wiring was found during
  this mapping pass. Grep for actual usage before assuming these are live.

## Scheduling

- `adonisjs-scheduler` + `node-cron` — likely drives periodic feriado sync or
  notificação generation. Confirm the cron definition location before adding new
  scheduled jobs (not found under `app/` during this pass — check `providers/app_provider.ts`
  or a `start/` preload).

## Database

- PostgreSQL only (`pg` client), single connection named `pg` in `config/database.ts`.
  No read replicas, no queue/cache layer (no Redis dep present).

## Frontend integration

- `config/cors.ts` allowlists `http://localhost:4002`, `http://localhost:4200`,
  `http://127.0.0.1:4002` — these are the expected future frontend dev server ports.
  No frontend app exists yet (see `.specs/frontend/.spec/`).

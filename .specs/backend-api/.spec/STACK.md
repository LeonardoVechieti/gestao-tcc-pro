# Stack — backend-api (`api-tcc-pro/`)

- **Runtime**: Node 22.3.0 (`.nvmrc`), ESM (`"type": "module"`), package manager `yarn`.
- **Framework**: AdonisJS 6 (`@adonisjs/core` ^6.12.1), HMR dev server via
  `@adonisjs/assembler` (`node ace serve --hmr`).
- **Language**: TypeScript ~5.4, `tsc --noEmit` for typecheck. Subpath imports via
  Node `imports` map in `package.json` (e.g. `#controllers/*`, `#models/*`,
  `#repositories/*`, `#validators/*`, `#services/*`, `#interfaces/*`, `#swagger/*`) —
  use these instead of relative `../../` paths where possible (existing code is
  inconsistent — some files use relative imports, prefer the `#alias` form for new
  code).
- **ORM / DB**: `@adonisjs/lucid` ^21 on PostgreSQL (`pg`). Single connection `pg`
  configured in `config/database.ts`, credentials from env.
- **Validation**: `@vinejs/vine` — one validator file per resource under
  `app/validators/<resource>/<resource>_validator.ts`, usually exporting a
  `<Resource>Validator` (create/update) and `<Resource>IndexValidator` (list/filter,
  spreads `DataIndexPaginateValidatorBase` from `app/validators/index_validator.ts` for
  `pageNumber`/`pageSize`/`sortColumn`/`sortDirection`).
- **Auth**: custom `AuthMiddleware` (`app/middleware/auth_middleware.ts`) — static
  Bearer token compared to `API_AUTH_TOKEN` env var. Not per-user auth (see
  `CONCERNS.md`).
- **CORS**: `@adonisjs/cors`, allowlisted origins in `config/cors.ts`
  (`localhost:4002`, `localhost:4200`, `127.0.0.1:4002` — likely the future frontend
  dev ports).
- **API docs**: Swagger UI served from `app/swagger/openapi.ts` at the `/swagger`
  route (`start/routes/swagger.ts`).
- **Scheduling**: `adonisjs-scheduler` + `node-cron` present as deps (used for feriado
  sync — verify usage in `app/services/feriado_service.ts` before extending).
- **Testing**: Japa (`@japa/runner`, `@japa/api-client`, `@japa/assert`,
  `@japa/plugin-adonisjs`), run via `node ace test`. Suites split `unit` /
  `functional` (see `TESTING.md`).
- **Lint/format**: ESLint (`@adonisjs/eslint-config`) + Prettier (`@adonisjs/prettier-config`).
  `yarn lint` fixes, `yarn build` runs lint + prettier + prod build.
- **Env vars** (see `start/env.ts` for the full schema): `NODE_ENV`, `PORT`, `APP_KEY`,
  `HOST`, `LOG_LEVEL`, `API_AUTH_TOKEN`, `FERIADOS_API_URL`, `DB_CONNECTION`,
  `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`.

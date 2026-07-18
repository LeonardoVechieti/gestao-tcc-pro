# Concerns / tech debt — backend-api

## Auth coverage is inconsistent across routes (resolved: per-user identity; open: coverage + authorization)

Per-user JWT auth shipped (`.specs/project/DECISIONS.md`) — `ctx.request.user` is a
real `Usuario` when `middleware.auth()` runs. What's still open:

1. **Coverage is per-route-group, opt-in, not global.** ~9 of ~15 resource modules
   have no `middleware.auth()` at all (aluno, professor, tcc, agenda, feriado, role,
   perfil, all 3 dashboards) — any client can read/write those without a token. See
   the full list in `.specs/backend-api/.spec/ARCHITECTURE.md` → "Auth boundary".
2. **Role/Perfil (RBAC) is modeled but not enforced anywhere.** `Role`, `Perfil`,
   `PerfilRole` tables/models exist and the JWT carries `role`/`roles`/`perfil` claims,
   but no middleware/policy checks them before allowing an action — even on routes
   that already require a valid token. Treat any "only coordenação can do X"
   requirement as **not yet implemented** at the framework level.

Tracked as **ORIENT-012** in
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md` — read that
file before touching auth/authorization, it has the current recommended scope
(middleware/policy per role, 403 on scope violation, tests).

## Inconsistent import style

Some files use the `#alias/*` subpath-import map (`#models/DAO/tcc`), others use
relative paths (`../repositories/tcc_repository.js` in `tcc_controller.ts`). Not a
blocker, but don't assume one style is canonical — check the file you're editing.

## No unit tests

`tests/unit/` doesn't even exist as a directory (only referenced in `adonisrc.ts`'s
suite config); only one functional test file exists
(`tests/functional/auth_middleware.spec.ts`, still testing the old bearer-token
behavior — verify it still matches the current per-user JWT middleware before trusting
it as documentation). Business logic in repositories/services (filtering, pagination,
dashboard aggregation, the orientação state machine) is currently untested.

## JWT doesn't carry `uuidProfessor`

The JWT/`/auth/me` payload carries `uuidAluno` but not `uuidProfessor`, so several
frontend screens (`/perfil`, `/orientacoes`) resolve the current professor's identity
by looking up their `Professor` record by email instead. Tracked as **ORIENT-013** in
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.

## `cordenacao` spelling

"Coordenação" is misspelled as `cordenacao` throughout filenames and identifiers
(`dash_cordenacao_controller.ts`, `dash_cordenacao_service.ts`). This is now the
established convention — match it rather than silently "fixing" it, since a partial
rename would break routes/imports.

## Naming drift risk: uuid field names

Foreign keys don't always match the pattern `uuid_<TargetEntity>` — e.g. `Tcc` has
`uuidOrientador` (not `uuidProfessor`) pointing at `Professor`. Check
`DIAGRAMA_CLASSES.md` for the actual FK name per relation rather than guessing from the
entity name.

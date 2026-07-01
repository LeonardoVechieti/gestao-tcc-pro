# Concerns / tech debt — backend-api

## Auth is not per-user

`auth_middleware.ts` validates a single static `API_AUTH_TOKEN` shared across all
clients — it does not authenticate a specific `Usuario`. `Usuario` has `email`/
`password`/`emailVerified` fields but there is no visible login endpoint. Any feature
that needs "who is the current user" (e.g. attributing a TccNotificacao to a user,
enforcing that only the owning aluno can edit their TemaTcc) cannot rely on the request
context today — this needs to be designed before building user-facing authorization.

## Authorization (Role/Perfil) is modeled but not enforced

`Role`, `Perfil`, `PerfilRole` tables and models exist, but no middleware/policy was
found that checks a user's role before allowing an action. Treat any "only coordenação
can do X" requirement as **not yet implemented** at the framework level — it would need
new middleware.

## Inconsistent import style

Some files use the `#alias/*` subpath-import map (`#models/DAO/tcc`), others use
relative paths (`../repositories/tcc_repository.js` in `tcc_controller.ts`). Not a
blocker, but don't assume one style is canonical — check the file you're editing.

## No unit tests

`tests/unit/` is empty; only one functional test file exists (auth middleware). Business
logic in repositories/services (filtering, pagination, dashboard aggregation) is
currently untested.

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

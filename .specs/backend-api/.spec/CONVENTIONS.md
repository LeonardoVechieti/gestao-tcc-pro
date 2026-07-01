# Conventions — backend-api

## File naming

- `snake_case` filenames throughout: `tcc_controller.ts`, `tema_tcc_repository.ts`,
  `dash_cordenacao_service.ts` (note: "coordenação" is spelled `cordenacao` in this
  codebase — missing "o" — match the existing spelling for consistency, don't "fix" it
  mid-PR).
- One file per class; class name is PascalCase of the filename
  (`tcc_repository.ts` → `TccRepository`).

## Controllers

- Method names match REST semantics: `store` (create), `show` (get one), `index`
  (list), `update`, `delete`. Keep this exact vocabulary for new controllers.
- Always destructure only what's needed from `HttpContext` (`{ request }`, `{ params }`).
- Return types are explicit (`Promise<Tcc>`, `Promise<ModelPaginatorContract<Tcc> | Tcc[]>`).

## Validators

- One file per resource under `app/validators/<resource>/`, using `vine.compile(vine.object({...}))`.
- List/index validators spread `DataIndexPaginateValidatorBase` for consistent
  pagination/sorting params (`pageNumber`, `pageSize`, `sortColumn`, `sortDirection`).
- Optional fields use `.optional()`; no custom error messages configured yet — errors
  surface via VineJS defaults through the exception handler.

## Repositories

- Repository methods are not injected with an interface/abstract base — each resource
  gets a plain concrete class. Keep the five-method shape (`store`/`show`/`index`/`update`/`delete`)
  consistent unless the resource genuinely doesn't need one (e.g. read-only
  `notificacao`).

## Models

- Located in `app/models/DAO/`. UUID primary keys named `uuid<Entity>` (e.g.
  `uuidTcc`, `uuidAluno`).

## Formatting

- Prettier config from `@adonisjs/prettier-config` (no local overrides found) — don't
  hand-tune formatting, run `yarn format`.
- ESLint config from `@adonisjs/eslint-config/app` — run `yarn lint` before considering
  a change done (see `.specs/backend-api/.spec/TESTING.md` for the full gate).

## Comments

- Existing code favors Portuguese doc comments on middleware/complex logic (see
  `auth_middleware.ts`). Match the surrounding file's language (PT-BR) when adding
  comments to backend code — the whole domain (routes, migrations, entity names) is in
  Portuguese.

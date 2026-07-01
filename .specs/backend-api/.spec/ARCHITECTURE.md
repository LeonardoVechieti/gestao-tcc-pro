# Architecture — backend-api

## Request flow

```
routes (start/routes/<resource>.ts)
  → Controller (app/controllers/<resource>_controller.ts)
    → Validator (app/validators/<resource>/<resource>_validator.ts, VineJS)
    → Repository (app/repositories/<resource>_repository.ts)  [plain CRUD]
      or Service (app/services/<resource>_service.ts)          [cross-entity / aggregation]
        → Lucid Model (app/models/DAO/<resource>.ts)
```

- Controllers are thin: validate input, delegate to a repository (or service), return
  the result — no business logic in controllers.
- `@inject()` decorator + constructor injection is used to get repositories into
  controllers (AdonisJS IoC container), e.g. `TccController(private tccRepository: TccRepository)`.
- Repositories wrap Lucid `Model.query()` calls: `store` (create), `show` (find by
  UUID PK, `firstOrFail`), `index` (filtered/paginated list), `update`
  (`findOrFail` + `merge` + `save`), `delete` (`findOrFail` + `delete`). New resources
  should follow this same five-method shape unless there's a reason not to.
- Services are used where logic doesn't map to a single resource's CRUD: dashboards
  (`dash_alunos_service.ts`, `dash_cordenacao_service.ts`, `dash_professor_service.ts`),
  cross-cutting notificação/feriado logic.
- Models live under `app/models/DAO/` (note the `DAO` subfolder — not directly under
  `app/models/`).

## Routing

- `start/routes.ts` is a pure aggregator — imports one file per resource from
  `start/routes/<resource>.ts`. Add new resources by creating a new route file there
  and importing it in `routes.ts`.
- Each route file groups its resource's routes and applies a `.prefix(...)`, e.g. `tcc`
  routes are prefixed `tcc-pro`. Prefixes are not fully consistent across resources —
  check the neighboring route file for the resource you're extending rather than
  assuming a global prefix.
- IDs are UUIDs (`uuid_<entity>` as PK), passed as `:id` route params.

## Auth boundary

`AuthMiddleware` is applied per-route-group (not globally) — check `start/kernel.ts`
and individual route files to see which groups are protected. It validates a single
shared bearer token, not a per-user identity — `ctx` does not carry an authenticated
user.

## Error handling

`app/exceptions/generic_response_exception.ts` — throw `GenericResponseException(message,
statusCode, data?)` for controlled error responses; it's caught by `app/exceptions/handler.ts`
and serialized as `{ message, code, datetime }`.

## Naming/DB mapping

DB columns are snake_case (migrations), Lucid model properties are camelCase.
`app/function/camel_to_snake.ts` and `convert_to_snake_case.ts` handle the conversion
where needed (e.g. building dynamic `where` clauses from camelCase query params).

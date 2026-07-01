# Structure — backend-api (`api-tcc-pro/`)

```
api-tcc-pro/
├── app/
│   ├── controllers/        # one per resource: agenda, aluno, dash_*, notificacao,
│   │                        perfil, professor, role, tcc, tema_tcc
│   ├── exceptions/         # generic_response_exception.ts, handler.ts
│   ├── function/           # small pure helpers: camel_to_snake, convert_to_snake_case,
│   │                        sequence, uuidv4
│   ├── helpers/            # convert_files_to_base64, dashboard_helpers, get_current_date
│   ├── interfaces/         # dash_aluno.ts, feriado.ts
│   ├── middleware/         # auth_middleware.ts
│   ├── models/DAO/         # Lucid models — one per entity (see DIAGRAMA_CLASSES.md)
│   ├── repositories/       # plain-CRUD data access per resource
│   ├── services/           # cross-entity logic: dashboards, notificacao, feriado
│   ├── swagger/            # openapi.ts — Swagger/OpenAPI doc definition
│   └── validators/         # VineJS validators, one subfolder per resource
├── config/                 # app, bodyparser, cors, database, hash, logger
├── database/migrations/    # one file per table, timestamp-prefixed
├── providers/               # app_provider.ts
├── start/
│   ├── routes.ts           # aggregator — imports start/routes/<resource>.ts
│   ├── routes/              # one file per resource
│   ├── kernel.ts            # middleware registration
│   └── env.ts               # env var schema (source of truth for required env vars)
├── tests/
│   ├── bootstrap.ts
│   ├── functional/          # currently just auth_middleware.spec.ts
│   └── unit/                # suite configured in adonisrc.ts, currently empty
├── DIAGRAMA_CLASSES.md      # entity/relationship reference — read before modeling data
├── adonisrc.ts               # providers, preloads, test suite config
└── package.json
```

## Where to add things

- New resource (entity + CRUD): migration → model (`app/models/DAO/`) → validator
  (`app/validators/<resource>/`) → repository → controller → route file → import route
  file in `start/routes.ts`.
- Cross-entity logic (dashboards, aggregations, external API calls): `app/services/`.
- Small reusable pure functions: `app/function/`. Larger domain helpers: `app/helpers/`.

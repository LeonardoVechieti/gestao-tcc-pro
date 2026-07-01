# Architectural Decisions

## Frontend stack: React + PrimeReact

Decided 2026-07-01. Frontend will be built with React and the PrimeReact component
library ("react-prime"). A teammate owns the atomic-design breakdown (atoms/molecules/
organisms) on top of this — `.specs/frontend/.spec/` documents screens and their
backend dependencies, not the component hierarchy. When the atomic design system
lands, extend `.specs/frontend/.spec/ARCHITECTURE.md` and `CONVENTIONS.md` rather than
duplicating it here.

## Layering: Controller → Repository → Model (services for cross-entity/dashboard logic)

Backend follows Controller → Repository → Lucid Model for straight CRUD resources
(e.g. `tcc_controller.ts` → `tcc_repository.ts` → `models/DAO/tcc.ts`). A separate
`app/services/` layer exists for logic that spans entities or doesn't map 1:1 to a
resource (dashboards, notificações, feriado). Follow the same split for new resources:
plain CRUD → repository; cross-cutting/aggregation logic → service.

## Auth: static shared bearer token, not per-user sessions

`auth_middleware.ts` checks the `Authorization: Bearer <token>` header against a single
`API_AUTH_TOKEN` env var — it does not identify a user. `Usuario` has email/password
fields but there is no login endpoint yet. Do not assume `ctx` has an authenticated
user until a real auth flow is built.

## DB: PostgreSQL via Lucid, snake_case columns / camelCase models

Migrations create snake_case columns (e.g. `uuid_aluno`); Lucid models expose camelCase
properties (e.g. `uuidAluno`). Helper functions `camel_to_snake.ts` /
`convert_to_snake_case.ts` exist in `app/function/` for this mapping — reuse them
rather than writing new conversion logic.

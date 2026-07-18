# Architectural Decisions

## Frontend stack: React + PrimeReact

Decided 2026-07-01, shipped. Frontend is a React 19 + Vite + TypeScript app using the
PrimeReact component library, at `frontend/`. Component hierarchy follows Atomic
Design (`atoms/molecules/organisms` in `src/shared/ui/`), extracted incrementally —
see `.specs/frontend/.spec/CONVENTIONS.md` and `frontend/CLAUDE.md` for the extraction
rule ("don't build a component in `shared/ui` anticipating reuse — extract once it
already repeats 2+ times").

## Layering: Controller → Repository → Model (services for cross-entity/dashboard logic)

Backend follows Controller → Repository → Lucid Model for straight CRUD resources
(e.g. `tcc_controller.ts` → `tcc_repository.ts` → `models/DAO/tcc.ts`). A separate
`app/services/` layer exists for logic that spans entities or doesn't map 1:1 to a
resource (dashboards, orientação, notificações, feriado, auth). Follow the same split
for new resources: plain CRUD → repository; cross-cutting/aggregation logic → service.

## Auth: per-user JWT + Google OAuth (supersedes the earlier static shared-token model)

Shipped. `app/controllers/auth_controller.ts` exposes `POST /tcc-pro/auth/register`,
`POST /tcc-pro/auth/login`, `POST /tcc-pro/auth/google`, `GET /tcc-pro/auth/me`.
`app/services/auth_service.ts` issues a JWT (`jsonwebtoken`, 1h expiry, claims:
`sub`/`email`/`nome`/`uuidAluno`/`role`/`roles`/`perfil`) and verifies Google ID Tokens
via `google-auth-library` for social login (auto-provisions a `Usuario` with a random
placeholder password + `GOOGLE_DEFAULT_PERFIL_UUID` on first Google login).
`app/middleware/auth_middleware.ts` now validates this per-user JWT (`Bearer <token>`),
loads the `Usuario` by the `sub` claim, and attaches it to `ctx.request.user` — it no
longer checks a shared static token.

The old `API_AUTH_TOKEN` env var still exists in `start/env.ts`'s schema but is **no
longer referenced anywhere in `app/` or `config/`** — it's vestigial, safe to remove
once confirmed nothing external depends on it.

**Still open** (see `.specs/backend-api/.spec/CONCERNS.md`): `middleware.auth()` is
applied per-route-group, not globally, and roughly 9 of ~15 resource modules have no
auth check at all (aluno, professor, tcc, agenda, feriado, role, perfil, and the three
dashboards). Role/Perfil are modeled and carried in the JWT, but no policy/middleware
enforces them — any authenticated user can currently act on any resource. This is
tracked as ORIENT-012 in `.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.

## DB: PostgreSQL via Lucid, snake_case columns / camelCase models

Migrations create snake_case columns (e.g. `uuid_aluno`); Lucid models expose camelCase
properties (e.g. `uuidAluno`). Helper functions `camel_to_snake.ts` /
`convert_to_snake_case.ts` exist in `app/function/` for this mapping — reuse them
rather than writing new conversion logic. DB is hosted on Neon (serverless Postgres,
`sa-east-1`), confirmed via `api-tcc-pro/.env` `DB_HOST`.

## `tema_tcc` vs `tcc`: proposal-then-approval, not a single record

A student's initial submission is a `tema_tcc` row (proposal), not a `tcc`. A `tcc`
record (plus its `tcc_timeline` stages) is only created once the assigned professor
approves the theme with deadlines (`POST /orientacoes/:id/aprovar-tema-com-prazos`).
Don't assume every `tema_tcc` has a corresponding `tcc` — check `status` first. Full
state machine documented in
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.

## Frontend mock-data fallback via `VITE_BACKEND_ACTIVE`

Every frontend API function (`src/shared/api/*.ts`) keeps the same signature and
switches between a real `apiClient` call and a static fixture in `src/assets/mocks/`
based on this env flag, so the frontend can be developed/demoed without a live backend.
When adding a new API function, follow this existing pattern instead of letting mock
and real-integration code diverge.

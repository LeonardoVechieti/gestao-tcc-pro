# Specs Changelog

Summary log of changes to `.specs/`. One entry per session/PR that touches specs —
not a line-by-line diff, just enough for someone to know *what* changed and *why*
without re-reading every file. Newest entry on top.

Add an entry here **every time** any file under `.specs/` is added, rewritten, or
materially edited — see the rule in the root `claude.md` → "Keeping specs honest".

---

## 2026-07-18 — Updated root `claude.md`

Fixed the drift flagged in the entry below: `front-tcc-pro/` → `frontend/` (shipped,
not "not yet scaffolded"), auth sharp-edge rewritten to reflect per-user JWT + Google
OAuth with inconsistent route coverage (ORIENT-012) instead of the old static-token
model.

## 2026-07-18 — Brought `.specs/` back in line with the actual code

`.specs/project/`, `.specs/backend-api/.spec/`, and `.specs/frontend/.spec/` had
drifted badly since the 2026-07-01 brownfield mapping — updated 19 files against a
direct read of the current codebase.

- **Auth**: was documented as a single static shared `API_AUTH_TOKEN` with no login
  endpoint. Now documented as per-user JWT (register/login) + Google OAuth
  (`auth_controller.ts`, `auth_service.ts`), shipped and live. `API_AUTH_TOKEN` noted
  as vestigial (still in `start/env.ts`'s schema, unreferenced in code).
- **Frontend**: was documented as "not yet scaffolded, stack decided only". Now fully
  rewritten — it's a shipped React 19 + Vite + PrimeReact app covering auth,
  dashboards, and the full aluno↔professor orientação flow.
  `.specs/frontend/.spec/{ARCHITECTURE,CONVENTIONS,INTEGRATIONS,STACK,STRUCTURE}.md`
  effectively rewritten from scratch.
- **Auth coverage**: documented precisely which of the ~15 backend route modules have
  `middleware.auth()` applied (protected/partial/open), and that Role/Perfil are
  modeled + carried in the JWT but not enforced anywhere yet
  (`.specs/backend-api/.spec/CONCERNS.md`, `.specs/project/DECISIONS.md`).
  Tracked as **ORIENT-012** going forward.
- **Roadmap/TODOs**: replaced stale "build login", "scaffold frontend" items with the
  real current backlog (ORIENT-008 through ORIENT-013, sourced from
  `.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`, which was
  already accurate and untouched by this pass).
- Left unchanged (already accurate): `.specs/backend-api/.spec/CONVENTIONS.md`,
  `.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.
- **Not done in this pass**: root `claude.md` still references `front-tcc-pro/`
  (renamed `frontend/`), "not yet scaffolded", and the old static-token auth model —
  needs its own update.

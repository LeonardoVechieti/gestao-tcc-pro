# State (live memory)

## Decisions

See `.specs/project/DECISIONS.md` for cross-cutting decisions (layering, auth model,
snake_case/camelCase DB mapping).

## Blockers

None currently tracked.

## Lessons

- WSL2 + Docker on this dev machine: if the DB throws "MySQL server has gone away" /
  "connection refused" while the DB container runs inside WSL2, suspect WSL
  auto-shutdown before touching query timeouts or reconnect logic (this project uses
  Postgres, but the same WSL idle-shutdown issue applies to any container-based DB).
  Fix documented in user's global CLAUDE.md.

## Todos

See `.specs/project/GENERAL_TODOS.md` (cross-cutting) and
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md` (ORIENT-00x
backlog for the aluno-orientador flow — recommended next: ORIENT-008, entregas/documentos).

## Preferences

- Model guidance: lightweight tasks (validation, state updates, session handoff) work
  well with faster/cheaper models — not yet confirmed with user, mention once when
  relevant.

## Freshness note

`.specs/project/`, `.specs/backend-api/.spec/`, and `.specs/frontend/.spec/` were
brought back in line with the actual code on 2026-07-18 (they had drifted since the
2026-07-01 brownfield mapping — frontend went from "not scaffolded" to fully built,
auth went from a static shared token to per-user JWT + Google OAuth). Re-verify against
the code before trusting any of these docs if it's been a while since the last update —
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md` (dated
2026-07-16) is the most current single source for the aluno-orientador flow.

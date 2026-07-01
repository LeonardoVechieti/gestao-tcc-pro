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

See `.specs/project/GENERAL_TODOS.md`.

## Preferences

- Model guidance: lightweight tasks (validation, state updates, session handoff) work
  well with faster/cheaper models — not yet confirmed with user, mention once when
  relevant.

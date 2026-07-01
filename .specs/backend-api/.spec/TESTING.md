# Testing — backend-api

## Runner

Japa (`@japa/runner`), invoked via `node ace test` (= `yarn test`).

## Suites (from `adonisrc.ts`)

- `unit`: `tests/unit/**/*.spec(.ts|.js)` — currently empty, no unit tests exist yet.
- `functional`: presumably `tests/functional/**/*.spec(.ts|.js)` (mirrors the one
  existing file) — verify exact glob in `adonisrc.ts` before assuming.

## Existing coverage

Only `tests/functional/auth_middleware.spec.ts` exists today, covering the static
bearer-token middleware (401 paths + happy path + public health route). No
controller/repository/service tests exist yet — new resource work should add
functional tests following this file's pattern (`@japa/api-client`'s `client` fixture,
`response.assertStatus` / `assertBodyContains`).

## Gate to run before considering backend work done

1. `yarn typecheck` (`tsc --noEmit`)
2. `yarn lint`
3. `yarn test`

Per the global spec-driven workflow: run tests in simple/non-verbose mode first; only
switch to verbose mode to diagnose a failure, don't default to verbose.

## DB for tests

`config/database.ts` uses a single `pg` connection from env vars — no separate test DB
config was found. `package.json` has a `postgres` script that spins up a disposable
Postgres container (`docker run ... -p 5434:5432 ... postgres`) — check whether tests
expect `DB_PORT=5434` in a `.env.test` before running `yarn test` against a fresh DB.

# gestao-tcc-pro

Institutional platform ("GestãoTCC Pro") for managing the full university TCC
(Trabalho de Conclusão de Curso) lifecycle: eligible-student registration, advisor
assignment, mandatory deliverables, evaluation panels (bancas), presentation
scheduling, grades/minutes, and management reports. Originates from an academic case
study (Grupo 3) being implemented as a real system.

## Start here

This repo uses **Spec-Driven Development** — read `.claude/skills/spec-driven/SKILL.md`
(vendored so the whole team can use it from Claude, Codex, or Gemini CLI — canonical
copy lives there; `.codex/prompts/spec-driven.md` and
`.gemini/commands/spec-driven.toml` mirror it).

Before working on anything, load what's relevant from `.specs/`:

- `.specs/project/PROJECT.md` — vision, actors, MVP scope, **domain-model gap
  analysis** (case concepts like Curso/Banca/Entrega/Ata not yet in the backend)
- `.specs/project/ROADMAP.md`, `DECISIONS.md`, `STATE.md`, `GENERAL_TODOS.md`
- `.specs/backend-api/.spec/` — stack, architecture, conventions for `api-tcc-pro/`
- `.specs/frontend/.spec/` — stack, architecture for `front-tcc-pro/` (not scaffolded yet)
- `.specs/features/<use-case>/` — one folder per case use case (currently empty,
  ready for `spec.md` when a use case is picked up)

## Parts

- **`api-tcc-pro/`** — AdonisJS 6 + TypeScript + PostgreSQL (Lucid ORM) REST API.
  Working code. Controller → Repository/Service → Model layering. Domain is
  Portuguese (`Aluno`, `Professor`, `Tcc`, `TemaTcc`, `Agenda`...). See
  `api-tcc-pro/DIAGRAMA_CLASSES.md` for the entity diagram.
- **`front-tcc-pro/`** — React + PrimeReact (decided, not yet scaffolded). Component
  architecture is atomic design, owned by a teammate. `front-tcc-pro/design/*.png`
  has the UI mockups.

## Sharp edges (see `.specs/backend-api/.spec/CONCERNS.md` for full detail)

- **Auth is not per-user.** `AuthMiddleware` checks one static shared `API_AUTH_TOKEN`
  bearer token — there's no login endpoint and no authenticated-user context yet. Any
  feature needing "who is the current user" is blocked on this.
- Role/Perfil authorization is modeled in the DB but not enforced per-route.
- The case's domain model (Curso, Banca, Entrega, Documento, Ata, Relatório,
  multi-evaluator Avaliação consolidation) is only partially implemented — check
  `PROJECT.md`'s gap table before assuming an entity/flow exists.
- DB columns are snake_case, Lucid model properties are camelCase — use the
  `app/function/camel_to_snake.ts` / `convert_to_snake_case.ts` helpers, don't
  hand-roll conversion.
- `cordenacao` (missing "o" in "coordenação") is the established spelling in
  filenames/identifiers — match it, don't "fix" it mid-PR.

## Commands (backend-api)

Run from `api-tcc-pro/`: `yarn dev` (HMR server), `yarn typecheck`, `yarn lint`,
`yarn test`, `yarn build`. Gate before calling backend work done: typecheck → lint →
test.

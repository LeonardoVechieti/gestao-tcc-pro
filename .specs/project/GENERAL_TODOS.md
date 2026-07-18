# Cross-cutting TODOs

Detailed backlog for the aluno-orientador flow lives in
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md` (ORIENT-00x
items) — this file only tracks items not already covered there or spanning outside
that flow.

- [ ] **ORIENT-008** (highest priority, recommended next step) — Model
      entregas/documentos: real file upload, per-stage document tracking,
      professor approve/reject. `/documentos` is currently a frontend placeholder.
- [ ] **ORIENT-009** — Model Banca as an explicit entity (orientador + avaliadores +
      conflict checking), separate from the generic `Agenda`.
- [ ] **ORIENT-010** — Multi-evaluator Avaliação: draft/publish per evaluator,
      consolidate the final result only once all required evaluations are published.
- [ ] **ORIENT-012** (transversal, can be picked up any time) — Real backend
      authorization: role-based policy per route. Today most modules (aluno,
      professor, tcc, agenda, feriado, role, perfil, all 3 dashboards) accept
      requests with no auth check at all, and even protected routes don't verify
      Role/Perfil scope — see `.specs/backend-api/.spec/CONCERNS.md`.
- [ ] **ORIENT-013** — Stop resolving professor/aluno identity by email lookup in the
      frontend; carry `uuidProfessor` in the JWT/`/auth/me` response the same way
      `uuidAluno` already is.
- [ ] Model missing case-domain entities as they're picked up: Curso (with per-course
      rules), Ata, Relatório gerencial. See `.specs/project/PROJECT.md` gap analysis.
- [ ] Decide on deployment target and add a Dockerfile/CI workflow — none exists
      today; only local dev scripts (`npm run dev` in both `api-tcc-pro/` and
      `frontend/`).
- [ ] Remove the vestigial `API_AUTH_TOKEN` env var (still in `start/env.ts`'s
      schema, no longer referenced anywhere in `app/`/`config/` since the JWT auth
      migration) once confirmed nothing external still sets it.
- [ ] Reconcile system clock/NTP issues on the dev machine if Google login starts
      failing with "Token used too early" — UDP/123 (NTP) is blocked on this network,
      so `systemd-timesyncd` can't self-correct; the clock was manually set once via
      an HTTPS `Date` header on 2026-07-18 but will drift again over time.

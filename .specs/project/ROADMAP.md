# Roadmap

## Shipped

- **Auth**: per-user JWT (register/login) + Google OAuth login
  (`auth_controller.ts`, `auth_service.ts`) — supersedes the old static-token model.
  See `.specs/project/DECISIONS.md`.
- **Frontend app** (`frontend/`, React 19 + Vite + PrimeReact): fully scaffolded, not
  just mockups. Features shipped: auth (login/register), dashboards (aluno/professor/
  coordenação), `/tema` (registrar tema + acompanhamento), `/orientacoes` (gestão de
  orientação pelo professor/coordenação/admin), `/tccs`, `/cronograma`, `/mensagens`
  (notificações), `/perfil`, `/admin/*` (usuários, roles, perfis, alunos, professores).
  `/documentos` and `/apresentacao` exist in the nav but are **placeholders**.
- **Fluxo aluno ↔ professor orientador** (proposal → acceptance/refusal → theme
  approval with deadlines → `tcc` + `tcc_timeline` creation → stage tracking →
  comments/adjustments → notifications): implemented end-to-end. Full detail in
  `.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md` — treat
  that file as the source of truth for this flow, more current than this roadmap.
- Core CRUD for: Role, Perfil (+ PerfilRole), Usuario, Aluno, Professor
  (+ recommendations), TemaTcc, Tcc, TccDocumento, Agenda (+ AgendaParticipante),
  Notificação, Avaliação (simplified, single-evaluator).
- Dashboards: dash aluno, dash coordenação, dash professor, all backed by real data
  (no mocked alerts when the backend is active).
- Swagger docs (`app/swagger/openapi.ts`, `/tcc-pro/swagger` route).
- Feriado (holiday) integration service, external API via `FERIADOS_API_URL`
  (BrasilAPI).

## In progress / partial

- **Post-refusal flow** (ORIENT-014): implemented — a refused proposal doesn't block
  a new one; student can reuse refused-proposal data as a draft.
- **Agenda/Banca**: `Agenda`/`AgendaParticipante` exist but there's no formal `Banca`
  entity yet (no orientador/avaliador/suplente distinction, no conflict checking).
- **Avaliação**: simplified, tied to the orientador only when the "Banca" timeline
  stage is completed with a grade — not the case's multi-evaluator model.

## Not started (see `.specs/project/PROJECT.md` gap analysis + `GENERAL_TODOS.md`)

- **ORIENT-008 — Entregas/Documentos**: no document upload/tracking exists yet beyond
  the `TccDocumento` CRUD skeleton; `/documentos` is a frontend placeholder. Marked as
  the recommended next step in the implementation plan (highest MVP priority).
- **ORIENT-009 — Banca formal**: dedicated `banca`/`banca_participante` tables,
  role distinction (orientador/avaliador interno/externo/suplente), agenda conflict
  validation.
- **ORIENT-010 — Avaliação multiavaliador**: draft/publish per evaluator, final result
  only consolidated once all required evaluations are published.
- **ORIENT-011 — Resultado do aluno**: published-result view, blocked until publication.
- **ORIENT-012 — Autorização real no backend**: role-based policy per route (today,
  scope enforcement is mostly frontend-only — see `.specs/project/DECISIONS.md`).
- **ORIENT-013 — Remover dependência de busca por e-mail**: `/auth/me` and the JWT
  should carry `uuidProfessor` (it already carries `uuidAluno`) so the frontend stops
  resolving professor identity by email lookup.
- **Curso** entity — courses aren't modeled; `Aluno.curso` is free text only, no
  per-course rules (max orientandos, required stages, per-course reports).
- **Ata / relatório gerencial** generation — no minutes persistence or management
  report generation exists.
- Deployment/CI — no Dockerfile, CI workflow, or hosting provider config anywhere in
  the repo; only local dev scripts exist.

## How to use this file

Update when a feature moves between planned → in progress → shipped. Keep entries
terse; the aluno-orientador flow's day-to-day detail belongs in
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`, not here.

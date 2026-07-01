# Roadmap

## Shipped (backend-api)

- Core CRUD for: Role, Perfil (+ PerfilRole), Aluno, Professor, TemaTcc, Tcc, Agenda
  (+ AgendaParticipante), Notificação (read-only list).
- Dashboards: dash aluno, dash coordenação, dash professor (`app/controllers/dash_*`,
  `app/services/dash_*`).
- Static Bearer-token auth middleware (single shared `API_AUTH_TOKEN`, not per-user).
- Swagger docs (`app/swagger/openapi.ts`, `/swagger` route).
- Feriado (holiday) integration service, external API via `FERIADOS_API_URL`.

## Not started

- **frontend** — no app code yet, only design mockups in `front-tcc-pro/design/`.
  Stack decided: React + PrimeReact (see `.specs/project/DECISIONS.md`).
- Per-user authentication/login (Usuario model exists with password/email fields, but
  no login/session/JWT-issuing endpoint found yet — current middleware only checks a
  static shared token).
- Real authorization (Role/Perfil are modeled but not enforced per-route).
- **Curso** entity — courses aren't modeled; needed for per-course rules (max
  orientandos, required stages, reports "por curso").
- **Banca** as an explicit concept (orientador + avaliadores + conflict checking) —
  today only `Agenda`/`AgendaParticipante` exist.
- **Entrega/Documento** — mandatory-deliverable + document-upload tracking beyond
  `TccTimeline`.
- **Ata / relatório gerencial** generation.
- Multi-evaluator avaliação consolidation (TCC result finalized once all required
  avaliações are registered).

See `.specs/project/PROJECT.md` → "Domain model (case) vs. implemented entities" for
the full gap analysis, and the case's MVP list for prioritization once work resumes.

## How to use this file

Update when a feature moves between planned → in progress → shipped. Keep entries
terse; details belong in `.specs/features/<feature>/spec.md`.

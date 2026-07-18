# gestao-tcc-pro

## Vision

**GestãoTCC Pro** — an institutional platform for the university "AprenderTech" to
manage the full TCC (Trabalho de Conclusão de Curso / final-year thesis) lifecycle
across multiple courses: registering eligible students, assigning advisors, tracking
mandatory deliverables, forming evaluation panels (bancas), scheduling presentations
without conflicts, recording grades/minutes/opinions, and producing management reports.
Today this is done via spreadsheets and email, causing schedule clashes, overloaded
advisors, students without a defined banca, and late/lost documents.

This is a real academic case study (Especialização em Engenharia de Software —
Análise e Modelagem de Sistemas, Grupo 3: Henrique Delazeri, Leonardo Vechieti, Lucas
Bauer, Rodrigo Libraga, Vinicius Rubin) being implemented as a working system. Treat
the case document as the requirements source of truth; this repo is a chosen-subset
implementation of it (see "Backend vs. case domain gap" below).

### SMART goal (from the case)

Ship an initial version before the next academic semester, centralizing TCC control
for at least 3 courses: register eligible students, link advisors, control mandatory
deliverables, form bancas, schedule presentations, and emit management reports —
reducing scheduling/tracking errors (vs. today's spreadsheets/email) by at least 50%.

### MVP scope (from the case)

In scope for v1: cadastro de alunos aptos, cadastro de professores orientadores,
registro de temas e orientadores, controle de entregas obrigatórias, formação de
bancas, agendamento de apresentações, verificação básica de conflito de horário,
registro de notas e pareceres, relatório simples por curso/semestre.

Explicitly deferred: geração automática avançada de certificados, integração completa
com o sistema acadêmico institucional, dashboards complexos, automações mais
sofisticadas.

## Parts

- **backend-api** (`api-tcc-pro/`) — AdonisJS 6 + TypeScript REST API. Owns all domain
  logic, persistence (PostgreSQL via Lucid ORM), and Swagger-documented endpoints.
  Working code today, covers a subset of the full case domain (see gap below).
- **frontend** (`frontend/`) — **React 19 + Vite + TypeScript + PrimeReact**, shipped
  (see `.specs/project/DECISIONS.md`, `.specs/frontend/.spec/`). Covers auth,
  dashboards, the full aluno↔professor orientação flow, and admin CRUD screens.
  `design/*.png` (repo root) still holds the original UI mockups for reference.
  Component hierarchy follows Atomic Design, extracted incrementally — see
  `frontend/CLAUDE.md` and `.specs/frontend/.spec/CONVENTIONS.md`.

## Actors / stakeholders (from the case)

- **Aluno** — tracks TCC stage/deadlines, sees orientador and banca date, gets
  pending-item notifications, uploads documents securely.
- **Professor Orientador** — sees orientandos, approves stages, has a max-orientandos
  limit (avoid overload), joins bancas without agenda conflicts.
- **Coordenação de Curso** — distributes orientadores, controls deadlines/deliverables,
  forms bancas, wants per-course/turma/semester reports.
- **Avaliador de Banca** — a professor role: accesses final work, sees evaluation
  criteria, registers grade + parecer, confirms availability.
- **Secretaria Acadêmica** — archives atas/termos/final documents, wants fewer manual
  errors, needs historical record lookup.
- **Diretoria** — wants standardized process across courses, reliable indicators,
  lower admin cost, higher conclusion rate.
- **TI** — flags technical limits, suggests staged integration with the existing
  academic system, cares about security/backup/scalability, prefers phased delivery.

Role/permission modeling exists at the DB level (Role, Perfil, PerfilRole) and per-user
auth (JWT + Google OAuth login) is implemented and shipped — see
`.specs/project/DECISIONS.md`. What's still missing is **enforcement**: no
backend policy/middleware checks Role/Perfil before allowing an action, so scope rules
("professor only sees their own orientandos", "only coordenação sees the global list")
are currently applied in the frontend only. See `.specs/backend-api/.spec/CONCERNS.md`
and ORIENT-012 in
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.

## Domain model (case) vs. implemented entities (backend-api)

Case domain model: Curso, Aluno, Professor (orientador/avaliador), TCC, Entrega
(etapa obrigatória: projeto / parcial / final), Documento (arquivo por entrega), Banca
(evento formal de avaliação — orientador + avaliadores), Avaliação (nota + parecer por
professor), Ata (registro final da banca), Relatório (consolidação gerencial).

Implemented in `api-tcc-pro` today (`DIAGRAMA_CLASSES.md`): Aluno, Professor,
TemaTcc, Tcc, TccTimeline, TccNotificacao, TccDocumento, TccOrientacaoComentario,
Usuario, Perfil, Role, PerfilRole, Agenda, AgendaParticipante, Avaliacao (simplified).

**Gaps** (case concepts with no corresponding backend entity yet):
- **Curso** — no course entity; Aluno has a free-text `curso` field only, no
  per-course rules (e.g. max orientandos, required stages) can be modeled.
- **Banca** — `Agenda`/`AgendaParticipante` model a single meeting + participants, but
  there's no explicit "banca" concept distinguishing orientador vs. avaliadores or
  enforcing "no conflict" checks described in the case's `Agendar apresentação de TCC`
  use case (FE_01 conflito de agenda).
- **Entrega / Documento** — `TccTimeline` tracks stage/deadline/status; a
  `TccDocumento` model + `tcc_documento_controller.ts` exist as a CRUD skeleton, but
  there's no real upload flow wired to a timeline stage yet, and `/documentos` in the
  frontend is a placeholder. Tracked as **ORIENT-008** (highest MVP priority) in
  `.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.
- **Ata / Relatório** — no ata (minutes) persistence or management-report generation
  exists; `dash_*` controllers cover dashboards, not the case's reporting requirement.
- **Banca** — still no explicit "banca" entity distinguishing orientador vs.
  avaliadores or enforcing agenda-conflict checks (case's FE_01); tracked as
  **ORIENT-009**.
- **Avaliação multiplicity** — confirmed: the current `Avaliacao` is simplified and
  single-evaluator, created/updated when the "Banca" `tcc_timeline` stage is completed
  with a grade by the orientador. The case's multi-evaluator consolidation (result
  finalized only once all required avaliações are published) is not implemented.
  Tracked as **ORIENT-010** / **ORIENT-011**.

Track closing these gaps as features under `.specs/features/` as they're picked up;
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md` already
tracks ORIENT-008 through ORIENT-013 for this cluster of gaps — check there before
assuming a gap is unplanned.

## Core use cases (from the case, ≥8 required)

1. Cadastrar alunos aptos ao TCC (Coordenação)
2. Registrar tema de TCC (Aluno)
3. Vincular orientador (Coordenação)
4. Controlar entregas obrigatórias (Coordenação)
5. Enviar documentos do TCC (Aluno)
6. Formar banca avaliadora (Coordenação)
7. Agendar apresentação de TCC (Coordenação) — detailed flow in the case, including
   FE_01 conflito de agenda
8. Registrar avaliação final (Professor Avaliador) — detailed flow in the case,
   including FA_01 salvar parcialmente and FE_01 nota fora da faixa

Full actor/pre-condition/post-condition/main-flow/alternate-flow/exception-flow specs
for use cases 7 (Agendar apresentação) and 8 (Registrar avaliação final), plus 1
(Cadastrar alunos) and 2 (Registrar tema), came from the case document — ask the user
for the source doc if you need the complete text (not stored verbatim in `.specs/` to
avoid drift; re-derive detailed flows into `.specs/features/<use-case>/spec.md` when
that use case is actually being built).

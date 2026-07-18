# Architecture — frontend

Shipped (was "not yet scaffolded" as of 2026-07-01 — fully built now, see
`.specs/project/DECISIONS.md`).

## Shell

`src/app/App.tsx` → `AppProviders` (React Query client, PrimeReact theme, Router) →
`AppRoutes.tsx`, which wraps protected routes in `RequireAuth` (redirects to `/login`
if no valid session; re-validates the token against `GET /tcc-pro/auth/me` on mount)
and `AppLayout` (sidebar nav from `src/shared/layout/nav-items.ts`, filtered per-role by
`hasAnyRole`). Routes not yet built render `ComingSoon` via an `implementedPaths` set.

## Screens (routes) — mapped to backend support and current status

Source of truth for day-to-day detail:
`.specs/features/fluxo-aluno-professor-orientador/PLANO_IMPLEMENTACAO.md`.

| Route | Actor(s) | State | Backend |
|---|---|---|---|
| `/login`, `/register` | all | Real | `auth_controller.ts` (JWT + Google OAuth) |
| `/` (dashboard) | all, per-role | Real | `dash_alunos` / `dash_professor` / `dash_cordenacao` |
| `/tema` | Aluno | Real | `tema_tcc_controller.ts`, `orientacao_controller.ts` |
| `/orientacoes` | Professor / Coordenador / Admin | Real | `orientacao_controller.ts` |
| `/tccs`, `/tccs/:id` | all, scoped per role | Real | `tcc_controller.ts` |
| `/cronograma` | all, scoped per role | Real | `orientacao_controller.ts` (via `tcc_timeline`) |
| `/mensagens` | all | Real | `notificacao_controller.ts` |
| `/perfil` | all | Real | `usuario_controller.ts`, `professor_controller.ts` |
| `/documentos` | Aluno | **Placeholder** | `TccDocumento` model/controller exist as a CRUD skeleton, no real upload flow wired yet (ORIENT-008) |
| `/apresentacao` | all, scoped per role | **Placeholder** | No formal Banca entity yet (ORIENT-009) |
| `/admin` (usuarios, alunos, professores, roles, perfis + forms) | Admin / Coordenador per role | Real | `usuario`, `aluno`, `professor`, `role`, `perfil` controllers |

Original design mockups (pre-implementation) live in the repo-root `design/*.png` —
useful for visual reference, not for routing/status (this table supersedes them).

## Role/visibility model

Roles come from the JWT (`role`/`roles`/`perfil` claims, see
`.specs/project/DECISIONS.md`) and gate both nav items (`nav-items.ts`) and route access
(`RequireRole`/`hasAnyRole`). Enforcement today is **frontend-only** — the backend
doesn't verify these roles per-route (see `.specs/backend-api/.spec/CONCERNS.md`), so
don't treat frontend role-gating as a real security boundary.

| Perfil | Key roles | Sees |
|---|---|---|
| Administrador | all seeded roles | Everything, incl. `/admin/*` |
| Aluno | `ROLE_TEMA_VIEW`, `ROLE_TCC_VIEW`, `ROLE_AGENDA_VIEW`, `ROLE_DASH_ALUNO`, `ROLE_MENU_MEU_TCC`, `ROLE_MENU_AGENDA` | Own dashboard, `/tema`, `/tccs`, `/cronograma` (own scope) |
| Professor | `ROLE_TCC_VIEW`, `ROLE_AGENDA_VIEW`, `ROLE_DASH_PROFESSOR`, `ROLE_MENU_AGENDA` | Own dashboard, `/orientacoes`, `/tccs`, `/cronograma` (filtered to own orientandos) |
| Coordenador | `ROLE_ALUNO_VIEW`, `ROLE_TEMA_VIEW`, `ROLE_TCC_VIEW`, `ROLE_AGENDA_VIEW`, `ROLE_PROFESSOR_VIEW`, `ROLE_DASH_COORDENADOR`, `ROLE_MENU_ADM`, `ROLE_MENU_AGENDA` | Coordination/admin screens, global listings |

## Not yet mocked up / built

Vincular orientador is folded into the `/tema` + `/orientacoes` flow rather than being
a separate screen. Still fully unbuilt: **Formar banca avaliadora** as a distinct step
(ORIENT-009), **Enviar documentos do TCC** beyond the `/documentos` placeholder
(ORIENT-008), multi-evaluator **Registrar avaliação final** (ORIENT-010/011).

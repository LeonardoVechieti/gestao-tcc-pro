# Architecture — frontend

**Not yet scaffolded.** Stack decided (React + PrimeReact, see
`.specs/project/DECISIONS.md`); atomic-design component architecture owned by a
teammate — not documented here yet.

## Screens (`front-tcc-pro/design/`) mapped to case use cases and backend support

| Mockup | Screen | Case use case | Actor | Backend today |
|---|---|---|---|---|
| `1_login.png` | Login | (implied by all actor pre-conditions: "está autenticado") | all | **missing** — only static shared-token middleware, no per-user login (`.specs/backend-api/.spec/CONCERNS.md`) |
| `2_dashboard_coordenacao.png` | Coordenação dashboard | — (overview) | Coordenação | `dash_cordenacao_controller.ts` / `dash_cordenacao_service.ts` |
| `3_coordenacao_agendar_apresentacao_tcc.png` | Agendar apresentação de TCC | Agendar apresentação de TCC (incl. FA_01 virtual, FE_01 conflito de agenda) | Coordenação | partial — `agenda_controller.ts`/`agenda_service.ts` exist; explicit conflict-checking and modalidade-virtual flow not confirmed, no explicit "Banca" concept (see `PROJECT.md` gap analysis) |
| `4_coordenacao_alunos_aptos_tcc.png` | Alunos aptos ao TCC (list) | Cadastrar alunos aptos ao TCC (list view) | Coordenação | `aluno_controller.ts` |
| `5_professor_dashboard.png` | Professor dashboard | — (overview) | Professor | `dash_professor_controller.ts` |
| `6_coordnacao_cadastrar_aluno.png` | Cadastrar aluno | Cadastrar alunos aptos ao TCC (incl. FA_01 import, FE_01 matrícula duplicada) | Coordenação | `aluno_controller.ts` — bulk-import (FA_01) not confirmed to exist |
| `7_aluno_registrar_tema_tcc.png` | Registrar tema de TCC | Registrar tema de TCC (incl. FA_01 rascunho, FE_01 dados obrigatórios) | Aluno | `tema_tcc_controller.ts` — draft/rascunho status support not confirmed |
| `8_professor_registrar_avaliacao_final.png` | Registrar avaliação final | Registrar avaliação final (incl. FA_01 parcial, FE_01 nota fora da faixa) | Professor Avaliador | `Avaliacao` model exists in diagram; multi-evaluator consolidation logic not confirmed in `app/services/` — verify before building |
| `9_aluno_resultado_tcc.png` | Resultado do TCC | — (result of Registrar avaliação final, once all avaliações done) | Aluno | depends on avaliação consolidation above |
| `10_aluno_dashboard.png` | Aluno dashboard | — (overview) | Aluno | `dash_alunos_controller.ts` |

Not yet mocked up but required by the case: **Vincular orientador**, **Controlar
entregas obrigatórias**, **Enviar documentos do TCC**, **Formar banca avaliadora**
(as a distinct step from scheduling). Flag to the design teammate if these need
screens before implementation.

Update this file once the atomic-design breakdown and routing/navigation structure
are decided.

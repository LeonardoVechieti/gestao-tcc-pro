# Evolução do TDD — Agendar apresentação de TCC

Diário dos ciclos vermelho → verde → refatora, na ordem em que aconteceram.
Comando de teste: `node ace test unit` (em `api-tcc-pro/`).
No projeto extraído do .zip, o mesmo conjunto roda com `npm test` (Japa, o equivalente
ao JUnit no ecossistema TypeScript).

## Lista de tarefas (passo 1 da dica B)

Definida antes do primeiro teste e quebrada em tarefas menores quando necessário.
A ordem começa pela banca porque os outros cenários dependem dela.

| # | Tarefa | Subtarefas | Cenário | Ciclo |
|---|---|---|---|---|
| T1 | Formar banca válida | — | pré-condição do 1 | 1 |
| T2 | Recusar banca inválida | sem orientador; 1 avaliador; professor repetido | 7, 8, 9 | 2 |
| T3 | Agendar apresentação válida | criar caso de uso; portas com dublês | 1 | 3 |
| T4 | Exigir dados da modalidade | virtual → link; presencial → sala | 5, 6 | 4 |
| T5 | Recusar feriado | — | 10 | 5 |
| T6 | Recusar conflito de professor | 6a: sobreposição de horários; 6b: professor em duas bancas | 2 | 6 |
| T7 | Recusar conflito de sala e de aluno | sala ocupada; aluno com outra apresentação | 3, 4 | 7 |

## Ciclo 1 — Formação da banca (pré-condição do cenário 1)

- 🔴 **Vermelho**: teste `Banca.formar([orientadora, bruno, carla])` escrito antes da
  classe existir. Falha: `Cannot find module .../apresentacao/banca.js`.
- 🟢 **Verde**: `MembroBanca` (fábricas `orientador`/`avaliador`) e `Banca.formar` mínimo,
  que só separa orientador e avaliadores. `Tests 1 passed (1)`.

## Ciclo 2 — Cenários 7, 8 e 9: banca inválida

- 🔴 **Vermelho**: 3 testes (sem orientador, 1 avaliador, orientador repetido como
  avaliador) esperando `AgendamentoError` com código `BANCA_INVALIDA`. Criada só a classe
  de erro, sem regra. Falha: `Tests 1 passed, 3 failed (4)` — o `formar` aceitava tudo.
- 🟢 **Verde**: `Banca.formar` valida orientador único, mínimo de 2 avaliadores e
  professores sem repetição. `Tests 4 passed (4)`.

## Ciclo 3 — Cenário 1: agendamento válido

- 🔴 **Vermelho**: teste do caso de uso `AgendarApresentacao` com dublês em memória
  (`CalendarioFake`, `AgendaEmMemoria`). Falha: `Cannot find module
  .../apresentacao/agendar_apresentacao.js`.
- 🟢 **Verde**: `Horario`, `Apresentacao`, portas `CalendarioFeriados` e
  `ApresentacoesAgendadas`, e `AgendarApresentacao.executar` que só cria a apresentação.
  `Tests 5 passed (5)`.

## Ciclo 4 — Cenários 5 e 6: dados da modalidade

- 🔴 **Vermelho**: virtual sem link → `LINK_OBRIGATORIO`; presencial sem sala →
  `SALA_OBRIGATORIA`. Falha: `Tests 5 passed, 2 failed (7)`.
- 🟢 **Verde**: dois `if` direto em `AgendarApresentacao.executar`. `Tests 7 passed (7)`.
- 🔵 **Refatora (SRP)**: a regra pertence à própria apresentação — movida para a fábrica
  `Apresentacao.criar(dados)`, que também elimina o construtor com 7 parâmetros
  posicionais. O caso de uso só orquestra. `Tests 7 passed (7)`.

## Ciclo 5 — Cenário 10: feriado

- 🔴 **Vermelho**: `CalendarioFake(['2026-11-02'])` + agendamento em 02/11 → `FERIADO`.
  Falha: `Tests 7 passed, 1 failed (8)`.
- 🟢 **Verde**: o caso de uso consulta a porta `CalendarioFeriados`. `Tests 8 passed (8)`.

## Ciclo 6 — Cenário 2: conflito de professor

Tarefa quebrada em duas menores (dica B):

- 🔴 **Vermelho (6a)**: 4 testes de `Horario.sobrepoe` (mesma hora; começa no meio;
  começa quando a outra termina; outro dia). Falha: `Tests 8 passed, 4 failed (12)`.
- 🟢 **Verde (6a)**: `Horario` com duração padrão de 60 min e comparação de intervalos em
  minutos. `Tests 12 passed (12)`.
- 🔴 **Vermelho (6b)**: Bruno já avalia outra banca às 14h → `CONFLITO_PROFESSOR`, com o
  nome do professor na mensagem. Falha: `Tests 12 passed, 1 failed (13)`.
- 🟢 **Verde (6b)**: `Banca.membros` + laço nas apresentações do dia. `Tests 13 passed (13)`.

## Ciclo 7 — Cenários 3 e 4: conflito de sala e de aluno

- 🔴 **Vermelho**: sala 204 ocupada → `CONFLITO_SALA`; aluno com outra apresentação →
  `CONFLITO_ALUNO`. Falha: `Tests 13 passed, 2 failed (15)`.
- 🟢 **Verde**: mais dois `if` no mesmo laço — código feio, mas passando
  (`refatoracao/agendar_apresentacao.antes-da-refatoracao.ts`). `Tests 15 passed (15)`.
- 🔵 **Refatora (OCP)**: cada conflito virou uma estratégia `RegraConflito`
  (`ConflitoDeProfessor`, `ConflitoDeSala`, `ConflitoDeAluno`) injetada no caso de uso.
  Uma nova regra entra como nova classe, sem alterar `AgendarApresentacao`.
  Teste do cenário 1 passou a usar `dadosValidos()` (remove duplicação).
  `Tests 15 passed (15)`.

## Ajuste final — numeração 1:1 entre cenários e testes

Sem mudança de comportamento: o antigo "cenário 7" (banca inválida, com três variações) foi
separado nos cenários 7, 8 e 9, e o feriado passou a ser o cenário 10, para seguir à risca o
formato "Cenário <número>: Dado / Quando / Então". Os grupos de teste foram renomeados para
o mesmo número e título de cada cenário. `Tests 15 passed (15)`.

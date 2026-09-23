# Agendar apresentação de TCC (R7, R8, R9)

## Objetivo

Permitir que a coordenação agende a apresentação de um TCC com sua banca, garantindo que
não haja conflito de horário entre professores, aluno e sala antes da confirmação
(resposta ao risco "Conflitos de agenda não resolvidos" do PM Canvas). Cobre os pacotes
5.1, 5.3, 5.4 e 5.5 da EAP. A regra de negócio vive em um domínio puro, desenvolvido com
TDD, que também serve de entrega da disciplina de testes (cenários Dado/Quando/Então).

## Casos de uso (frontend)

1. Coordenador/administrador abre **Apresentação**, escolhe um TCC, monta a banca
   (orientador + avaliadores), define data, hora, modalidade e sala/link, e agenda.
2. Coordenador vê a recusa com o motivo exato (ex.: "Prof. X já participa de outra banca
   em 10/11 às 14:00") e ajusta o agendamento.
3. Aluno e professor abrem **Apresentação** e veem as apresentações em que participam
   (somente leitura).

## Regras (cenários de aceitação)

Duração padrão de uma apresentação: 60 minutos. Dois horários conflitam se os intervalos
se sobrepõem no mesmo dia.

| # | Dado | Quando | Então |
|---|---|---|---|
| 1 | Banca válida, sala livre, dia útil | agenda presencial | apresentação `agendada` |
| 2 | Avaliador já em outra banca no horário | agenda | recusa `CONFLITO_PROFESSOR` |
| 3 | Sala já reservada no horário | agenda presencial | recusa `CONFLITO_SALA` |
| 4 | Aluno já tem apresentação no horário | agenda | recusa `CONFLITO_ALUNO` |
| 5 | Modalidade virtual sem link | agenda | recusa `LINK_OBRIGATORIO` |
| 6 | Modalidade presencial sem sala | agenda | recusa `SALA_OBRIGATORIA` |
| 7 | Banca sem orientador | forma banca | recusa `BANCA_INVALIDA` |
| 8 | Banca com só 1 avaliador | forma banca | recusa `BANCA_INVALIDA` |
| 9 | Professor repetido na banca | forma banca | recusa `BANCA_INVALIDA` |
| 10 | Data é feriado | agenda | recusa `FERIADO` |

## Design

- Domínio em `api-tcc-pro/app/domain/apresentacao/`: sem imports de Adonis, Lucid ou
  Luxon (precisa rodar isolado para a entrega em .zip).
- Conceitos: `Horario`, `MembroBanca`, `Banca`, `Apresentacao`, `AgendamentoError`
  (com `codigo`), `AgendarApresentacao` (caso de uso).
- Portas (DIP): `CalendarioFeriados` e `ApresentacoesAgendadas`. Adaptadores reais usam
  `FeriadoService` e as tabelas `agenda`/`agenda_participante`.
- Regras de conflito como estratégias (`RegraConflito`), para abrir novas regras sem
  alterar o caso de uso (OCP).
- Persistência: `agenda` (data, hora, modalidade, `local` = sala, `link_reuniao`,
  `uuid_professor` = orientador) + `agenda_participante` (`cargo` = papel na banca).

## Guard-rails

- Tocar: `app/domain/apresentacao/**`, `tests/unit/apresentacao/**`,
  `app/services/agenda_service.ts`, controller/rotas/validator de agenda,
  `tests/bootstrap.ts`, `bin/test.ts` (liberar suíte `unit` sem banco), e no frontend
  a feature `apresentacao` + rota/nav.
- Não alterar o fluxo de orientação (`orientacao_service.ts`) nem a timeline.
- Proibido: regra de negócio de agendamento fora do domínio; domínio importando
  framework; testes unitários acessando banco ou rede.
- Migrations só com aprovação explícita (o banco de dev é compartilhado no Neon).

## Tarefas

- [x] T1 Liberar suíte `unit` sem banco de testes (`bin/console.ts`, `bin/test.ts`,
  `tests/bootstrap.ts`)
- [x] T2 Domínio via TDD, ciclos vermelho → verde → refatora cobrindo os cenários 1–10
  (15 testes; diário em `entrega-tdd/evolucao-tdd.md`)
- [x] T3 `POST`/`GET /tcc-pro/apresentacoes` com auth; só coordenação/admin agenda
- [x] T4 Tela Apresentação no frontend (`features/apresentacao/`)
- [x] T5 `entrega-tdd/gerar_entrega.py` monta o .zip (PDF, diagrama, projeto isolado,
  antes/depois)

## Pendências

- Migration `1782696000000_add_professor_to_agenda_participante` **escrita, não executada**
  (decisão do time). Até rodar `node ace migration:run`, `POST`/`GET /apresentacoes`
  falham (coluna `uuid_professor` inexistente).
- Sem teste funcional da API: não há banco de testes dedicado configurado.
- Remarcação/cancelamento (EAP 5.7) e convite de avaliadores (5.6) fora do escopo; um TCC
  pode receber mais de uma apresentação em horários diferentes.

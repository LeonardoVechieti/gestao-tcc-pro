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
| 7 | Banca sem orientador, com < 2 avaliadores ou com membro repetido | forma banca | recusa `BANCA_INVALIDA` |
| 8 | Data é feriado | agenda | recusa `FERIADO` |

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

- [ ] T1 Liberar suíte `unit` sem banco de testes
- [ ] T2 Domínio via TDD, um ciclo vermelho → verde → refatora por cenário (1–8)
- [ ] T3 Integrar `AgendaService`/controller ao domínio (rota protegida por auth)
- [ ] T4 Tela Apresentação no frontend
- [ ] T5 Script de extração da entrega (antes/depois, cenários, diagrama)

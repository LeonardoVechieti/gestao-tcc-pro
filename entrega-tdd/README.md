# Grupo 3 — TDD: Agendar apresentação de TCC (GestãoTCC Pro)

**Integrantes:** Henrique Werner Delazeri · Leonardo Gomes Vechieti · Lucas Bauer de Souza ·
Rodrigo Libraga Fernandes · Vinicius Rubin

**Requisito:** R7/R8/R9 — formar a banca, verificar conflitos de horário e agendar a
apresentação do TCC (EAP 5.1, 5.3, 5.4, 5.5).

## Conteúdo do .zip

| Item | O que é |
|---|---|
| `cenarios-testes-aceitacao.pdf` (e `.md`) | **Documento principal:** integrantes, história de usuário, 10 cenários (Dado/Quando/Então), rastreabilidade cenário → teste, diagrama e SOLID |
| `diagrama-conceitual.png` / `.svg` | Diagrama conceitual: conceitos, associações e multiplicidades |
| `projeto/` | Projeto OO (TypeScript) com as classes do requisito e os testes unitários |
| `evolucao-tdd.md` | Diário dos ciclos vermelho → verde → refatora, com a saída dos testes em cada passo |
| `refatoracao/` | Versão "código feio, mas passando" do caso de uso, antes da refatoração para OCP |
| `antes/` | Código do sistema real **antes** do trabalho, tirado da branch `main` (`agenda_service.ts` só checava feriado) |
| `depois/` | Código do sistema real **depois**: serviço, adaptadores e controller usando o domínio |
| `antes-depois.diff` | Diferença entre `antes/` e `depois/` nos arquivos alterados |

## Como rodar os testes

Requer Node.js 20 ou superior.

```bash
cd projeto
npm install
npm test
```

Resultado esperado: `Tests 15 passed (15)`. Os testes não acessam banco nem rede: o
calendário de feriados e a agenda são dublês em memória (`tests/unit/apresentacao/dubles.ts`).

## Do domínio ao sistema real

O domínio foi desenvolvido **dentro do repositório do GestãoTCC Pro**
(`api-tcc-pro/app/domain/apresentacao/`) e extraído para este projeto sem nenhuma alteração.
No sistema, a tela **Apresentação** chama `POST /tcc-pro/apresentacoes`. O
`AgendaService` carrega TCC e professores do banco, monta a `Banca` e delega as regras ao
caso de uso `AgendarApresentacao`. A persistência e a API de feriados (BrasilAPI) entram
como implementações das portas do domínio.

## Princípios SOLID aplicados

| Princípio | Onde |
|---|---|
| **S** — Responsabilidade única | `Banca` valida a própria composição; `Apresentacao.criar` valida os dados da modalidade; `Horario` só sabe comparar intervalos; o caso de uso apenas orquestra. |
| **O** — Aberto/fechado | Cada conflito é uma `RegraConflito` (`ConflitoDeProfessor`, `ConflitoDeSala`, `ConflitoDeAluno`). Uma regra nova é uma classe nova injetada; `AgendarApresentacao` não muda. |
| **L** — Substituição de Liskov | Qualquer implementação das portas (dublê em memória nos testes, Lucid/BrasilAPI no sistema) funciona no caso de uso sem mudar o comportamento esperado. |
| **I** — Segregação de interfaces | Portas pequenas e específicas: `CalendarioFeriados` (1 método) e `ApresentacoesAgendadas` (1 método). |
| **D** — Inversão de dependência | `AgendarApresentacao` depende das abstrações em `portas.ts`, nunca de banco, HTTP ou framework. |

## Estrutura do projeto

```
projeto/
  app/domain/apresentacao/
    membro_banca.ts        MembroBanca (orientador | avaliador)
    banca.ts               Banca.formar(): regras de composição
    horario.ts             Horario: intervalo de 60 min e sobreposição
    apresentacao.ts        Apresentacao.criar(): regras de modalidade
    agendamento_error.ts   AgendamentoError com código de recusa
    portas.ts              CalendarioFeriados, ApresentacoesAgendadas
    regras_conflito.ts     RegraConflito + regras de professor, sala e aluno
    agendar_apresentacao.ts  Caso de uso AgendarApresentacao
  tests/unit/apresentacao/
    banca.spec.ts, horario.spec.ts, agendar_apresentacao.spec.ts, dubles.ts
```

# Grupo 3 — Trabalho de TDD: o que foi feito e o que falta

Guia rápido para o grupo. A entrega para o professor é o arquivo
**`Grupo3-TDD-AgendarApresentacao.zip`**. Este arquivo aqui é só para nós.

## O que escolhemos

**Agendar apresentação de TCC** (requisitos R7, R8 e R9; pacotes 5.1, 5.3, 5.4 e 5.5 da
nossa EAP). A coordenação monta a banca (orientador + avaliadores) e agenda data, hora,
sala ou link. O sistema recusa conflitos de professor, sala e aluno, além de feriados. O
tema responde a um risco que nós mesmos colocamos no PM Canvas ("conflitos de agenda não
resolvidos").

## O que está no .zip (atende todos os itens do enunciado)

| Pedido no enunciado | Onde está |
|---|---|
| Documento com cenários e testes de aceitação | `cenarios-testes-aceitacao.pdf`: história de usuário + **10 cenários** Dado/Quando/Então |
| Diagrama conceitual (conceitos, associações e multiplicidades) | `diagrama-conceitual.png` (também dentro do PDF) |
| Projeto OO com classes e testes unitários = testes de aceitação | `projeto/`: TypeScript, 15 testes, cada cenário vira um grupo de teste com o mesmo número |
| TDD + refatoração + SOLID | `evolucao-tdd.md` (lista de tarefas e cada ciclo vermelho → verde → refatora), `refatoracao/`, seção 6 do PDF |
| Nome de todos os membros | Topo do PDF e do README |

Extra (não pedido, mas conta a história): `antes/` e `depois/` mostram o código do sistema
real antes e depois do trabalho.

## Rodar os testes (façam isso antes da apresentação)

```bash
cd projeto
npm install
npm test          # esperado: Tests 15 passed (15)
```

No repositório, os mesmos testes rodam com `node ace test unit` dentro de `api-tcc-pro/`.

## O que mudou no sistema (branch `feat/agendar-apresentacao`)

- **Domínio puro com TDD:** `api-tcc-pro/app/domain/apresentacao/`. É o mesmo código que
  vai no .zip, sem mudar nada.
- **API:** `POST /tcc-pro/apresentacoes` (só coordenação/admin) e `GET
  /tcc-pro/apresentacoes` (coordenação vê tudo; aluno vê as suas; professor vê as bancas de
  que participa). As duas rotas exigem login.
- **Frontend:** a tela **Apresentação**, que antes era "em breve", agora agenda e lista.
- **Testes:** `node ace test unit` roda sem banco de testes. A trava que impede rodar os
  testes contra o banco de dev continua valendo para as suítes `functional`.
- **Migration nova, NÃO executada:**
  `1782696000000_add_professor_to_agenda_participante.ts`. Ela deixa um professor sem
  usuário entrar na banca. Enquanto ninguém rodar `node ace migration:run`, a tela
  Apresentação dá erro ao carregar e ao agendar. O banco do Neon é compartilhado:
  combinem antes quem roda.

## Pendências do grupo

- [ ] **Tamanho do grupo:** o enunciado diz "até 4 alunos" e somos 5. Ele permite manter o
  grupo das disciplinas anteriores, mas confirmem com o professor.
- [ ] Decidir se e quando rodar a migration (necessária só para a demo na tela real).
- [ ] Revisar o PDF e o diagrama. Se mudarem algum `.md`, gerem o zip de novo (abaixo).
- [ ] Ensaiar a apresentação (roteiro abaixo) e rodar `npm install` com antecedência.

## Gerar o .zip de novo

Na raiz do repositório: `python entrega-tdd/gerar_entrega.py`. O script:

- pega o domínio e os testes direto de `api-tcc-pro/`;
- gera o PDF a partir de `cenarios-testes-aceitacao.md` (usa o Microsoft Edge);
- monta `antes/` a partir da branch `main`.

Não editem arquivos dentro do .zip à mão: editem as fontes em `entrega-tdd/` e rodem o
script.

## Roteiro da apresentação (10 minutos)

| Tempo | Parte | O que mostrar |
|---|---|---|
| 0:00–1:00 | Problema | Canvas: bancas marcadas à mão e conflitos de horário. R7/R8/R9. |
| 1:00–2:30 | História de usuário | "Como coordenador(a)… quero agendar… para garantir… sem conflitos." Critérios de aceitação. |
| 2:30–4:30 | Cenários | 3 exemplos: 1 (válido), 2 (conflito de professor), 5 (virtual sem link). São 10 no total. Mostrar o diagrama. |
| 4:30–7:00 | TDD | Rodar `npm test`. Abrir `evolucao-tdd.md` no ciclo 7: vermelho (`13 passed, 2 failed`) → verde com `if`s → refatoração. Comparar `refatoracao/` com `regras_conflito.ts`. |
| 7:00–8:30 | SOLID | OCP: regra nova = classe nova. DIP: `portas.ts` com dublês nos testes e BrasilAPI/banco no sistema. |
| 8:30–10:00 | Sistema real | Tela Apresentação: agendar e depois provocar um conflito ("Bruno já participa de outra banca…"). Sem ambiente: mostrar `antes/` × `depois/`. |

**Para a demo na tela real:** migration aplicada, login de coordenador ou admin, um TCC
com orientador (o tema precisa ter sido aprovado com prazos) e pelo menos 2 outros
professores cadastrados.

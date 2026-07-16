# Fluxo Aluno x Professor Orientador - Plano de Implementacao

Ultima atualizacao: 2026-07-16

Este documento descreve o fluxo real entre aluno e professor orientador no estado atual
do sistema, os pontos que ainda estao incompletos e a ordem recomendada de
implementacao. Ele deve ser usado como controle de solicitacoes futuras: ao pedir
para o Codex implementar um proximo passo, referencie o ID da tarefa deste arquivo.

## Como Usar Este Documento

- Use a secao **Fluxo Atual Codado** para entender o comportamento que existe hoje.
- Use a secao **Nao Implementado / Nao Mostrar Como Pronto** para evitar criar tela
  que promete dado inexistente no banco.
- Use a secao **Fila Recomendada de Implementacao** como backlog ordenado.
- Para uma solicitacao objetiva, peça algo como:
  - "Implemente ORIENT-001"
  - "Implemente o proximo passo pendente deste documento"
  - "Revise e implemente ORIENT-004 com testes"

## Resumo Executivo

Hoje o fluxo implementado e:

1. Professor cadastra areas e linhas de pesquisa.
2. Aluno registra uma proposta de tema e escolhe um professor indicado.
3. A proposta fica em `tema_tcc`.
4. Professor ve a proposta em `/orientacoes`.
5. Professor aceita orientar.
6. Professor aprova o tema com prazos.
7. O sistema cria um `tcc` e suas etapas em `tcc_timeline`.
8. Professor conclui etapas.
9. Ao concluir `Banca`, o sistema exige nota e cria/atualiza `avaliacao`.

O principal buraco atual: o aluno envia a proposta, mas ainda nao possui uma tela real
de acompanhamento do relacionamento com o professor. O dashboard do aluno e parte da
tela `/tema` ainda precisam ser conectados melhor aos dados reais de `tema_tcc`, `tcc`,
`tcc_timeline` e `tcc_orientacao_comentario`.

## Fonte de Verdade Atual

### Frontend

- `frontend/src/features/student-topic/StudentTopicPage.tsx`
- `frontend/src/features/orientations/OrientationManagementPage.tsx`
- `frontend/src/features/perfil/PerfilPage.tsx`
- `frontend/src/features/dashboard/AlunoDashboardPage.tsx`
- `frontend/src/features/dashboard/ProfessorDashboardPage.tsx`
- `frontend/src/features/tccs/TccListPage.tsx`
- `frontend/src/shared/api/tema-tcc-api.ts`
- `frontend/src/shared/api/orientation-api.ts`
- `frontend/src/shared/api/professor-api.ts`
- `frontend/src/shared/api/dashboard-api.ts`

### Backend

- `api-tcc-pro/app/services/orientacao_service.ts`
- `api-tcc-pro/app/controllers/orientacao_controller.ts`
- `api-tcc-pro/start/routes/orientacao.ts`
- `api-tcc-pro/app/controllers/tema_tcc_controller.ts`
- `api-tcc-pro/app/repositories/tema_tcc_repository.ts`
- `api-tcc-pro/app/repositories/tcc_repository.ts`
- `api-tcc-pro/app/repositories/avaliacao_repository.ts`

### Banco / Models

- `professor`
- `aluno`
- `usuario`
- `tema_tcc`
- `tcc`
- `tcc_timeline`
- `tcc_orientacao_comentario`
- `tcc_notificacao`
- `avaliacao`
- `agenda`
- `agenda_participante`

## Entidades Envolvidas

### `professor`

Guarda o cadastro do professor orientador.

Campos relevantes:

- `uuid_professor`
- `nome`
- `email`
- `areas_interesse`
- `linhas_pesquisa`
- `ativo`

Uso no fluxo:

- Permite o aluno encontrar professores por area e linha de pesquisa.
- E usado pelo professor para acessar as orientacoes em `/orientacoes`.

### `aluno`

Guarda o cadastro academico do aluno.

Campos relevantes:

- `uuid_aluno`
- `nome`
- `email`
- `matricula`
- `curso`
- `semestre`
- `situacao`

Uso no fluxo:

- O aluno cria `tema_tcc`.
- O `tcc` nasce vinculado ao aluno quando o tema e aprovado.

### `tema_tcc`

Representa a proposta de tema feita pelo aluno.

Campos relevantes:

- `uuid_tema_tcc`
- `uuid_aluno`
- `uuid_professor`
- `titulo`
- `descricao`
- `area`
- `linha_pesquisa`
- `status`
- `ativo`

Uso no fluxo:

- Primeira entidade criada quando o aluno solicita um tema.
- Ainda nao e um TCC formal.
- Nao possui `tcc_timeline`.

### `tcc`

Representa o TCC formal em acompanhamento.

Campos relevantes:

- `uuid_tcc`
- `uuid_aluno`
- `uuid_orientador`
- `uuid_tema_tcc`
- `proxima_entrega`
- `status`

Uso no fluxo:

- Criado quando o professor aprova o tema para acompanhamento.
- Passa a controlar as etapas do trabalho.

### `tcc_timeline`

Representa as etapas obrigatorias do TCC.

Campos relevantes:

- `uuid_timeline`
- `uuid_tcc`
- `titulo`
- `descricao`
- `data_entrega`
- `status`

Etapas padrao criadas hoje:

- `Tema aprovado`
- `Projeto de TCC`
- `Entrega parcial`
- `Versao final`
- `Banca`

Status usados no codigo:

- `pendente`
- `em_analise`
- `concluida`

Uso no fluxo:

- So existe depois que o `tema_tcc` vira `tcc`.
- A primeira etapa fica `em_analise`.
- As demais ficam `pendente`.
- Quando uma etapa e concluida, a proxima vira `em_analise`.

### `tcc_orientacao_comentario`

Representa mensagens/comentarios do fluxo de orientacao.

Campos relevantes:

- `uuid_orientacao_comentario`
- `uuid_tcc`
- `uuid_tema_tcc`
- `autor_nome`
- `autor_tipo`
- `tipo`
- `mensagem`

Uso no fluxo:

- Registra aprovacao, recusa, ajustes, comentarios e conclusao de etapa.
- Hoje e usado pela tela do professor.
- Ainda falta uma tela real para o aluno consultar/responder esses comentarios.

### `tcc_notificacao`

Representa notificacoes geradas no contexto de um TCC.

Campos relevantes:

- `uuid_tcc_notificacao`
- `uuid_tcc`
- `uuid_usuario`
- `tipo`
- `descricao`
- `status`
- `link_acao`

Uso no fluxo:

- E criada quando ha comentario/operacao associada a um `tcc`.
- Ainda nao esta integrada a uma tela real de mensagens/notificacoes para aluno e professor.

### `avaliacao`

Representa avaliacao/nota do TCC.

Campos relevantes:

- `uuid_avaliacao`
- `uuid_tcc`
- `uuid_professor`
- `nota`
- `criterio_geral`
- `criterios_especificos`
- `parecer`
- `apto_correcoes`
- `publicado`

Uso atual no fluxo:

- Ao concluir a etapa `Banca`, o backend exige nota.
- O backend cria/atualiza uma avaliacao vinculada ao professor orientador.

Limite atual:

- Ainda nao existe fluxo completo multiavaliador.
- Ainda nao existe consolidacao de resultado final por banca.

## Fluxo Atual Codado

### Etapa 0 - Preparacao do professor

Tela principal:

- `/perfil`

Tela administrativa alternativa:

- `/admin/professores`
- `/admin/professores/novo`
- `/admin/professores/:id`

Objetivo:

- Cadastrar ou atualizar as areas e linhas de pesquisa do professor.

Backend:

- `GET /tcc-pro/professor`
- `GET /tcc-pro/professor/:id`
- `POST /tcc-pro/professor`
- `PUT /tcc-pro/professor`

Banco:

- `professor.areas_interesse`
- `professor.linhas_pesquisa`
- `professor.ativo`

Estado atual:

- Implementado.
- Usado pela recomendacao de professores na tela `/tema`.

Observacoes:

- O professor teste precisa existir na tabela `professor` com e-mail igual ao usuario
  logado.
- As areas e linhas sao arrays salvos como JSON no PostgreSQL.

### Etapa 1 - Aluno registra proposta de tema

Tela:

- `/tema`

Componente:

- `StudentTopicPage.tsx`

Objetivo:

- O aluno cria uma proposta de tema e escolhe um professor indicado.

Campos preenchidos pelo aluno:

- titulo
- area
- linha de pesquisa
- descricao/justificativa
- professor selecionado

Backend:

- `GET /tcc-pro/professor/recommendations`
- `POST /tcc-pro/tema-tcc`
- `GET /tcc-pro/tema-tcc/me`
- `GET /tcc-pro/tema-tcc`

Banco:

- Cria registro em `tema_tcc`.

Status inicial gravado hoje:

- `aguardando aprovacao`

Status normalizado para tela de orientacoes:

- `solicitacao_pendente`

Estado atual:

- Implementado parcialmente.

Problemas atuais:

- A tela `/tema` tem partes que ainda precisam ficar mais claras para diferenciar:
  - proposta criada;
  - orientacao aceita;
  - tema aprovado;
  - TCC em andamento.
- O acompanhamento depois do envio ainda nao e uma experiencia real para o aluno.
- O dashboard do aluno ainda mistura dados reais com mock.

### Etapa 2 - Professor recebe solicitacao

Tela:

- `/orientacoes`

Componente:

- `OrientationManagementPage.tsx`

Backend:

- `GET /tcc-pro/orientacoes/professor/:uuidProfessor`

Banco consultado:

- `tema_tcc`
- `tcc`
- `aluno`
- `tcc_orientacao_comentario`
- `tcc_timeline` somente quando ja existe `tcc`

Objetivo:

- O professor visualiza propostas e TCCs vinculados a ele.

Para propostas ainda em `tema_tcc`:

- `sourceType = tema`
- `uuidTcc = null`
- `etapas = []`
- `progresso = 0`

Estado atual:

- Implementado para professor.
- A tela nao deve exibir etapas ficticias para propostas que ainda nao viraram TCC.

### Etapa 3 - Professor aceita orientar

Tela:

- `/orientacoes`

Acao:

- `Aprovar orientacao`

Backend:

- `POST /tcc-pro/orientacoes/:id/aprovar-orientacao`

Efeito:

- Atualiza `tema_tcc.status` para `orientacao_aprovada`.
- Cria comentario em `tcc_orientacao_comentario`.

Status normalizado:

- `tema_pendente`

Importante:

- Ainda nao cria `tcc`.
- Ainda nao cria `tcc_timeline`.
- Esta etapa significa apenas que o professor aceitou analisar/orientar aquela proposta.

Estado atual:

- Implementado.

### Etapa 4 - Professor aprova o tema e define prazos

Tela:

- `/orientacoes`

Acao:

- `Aprovar tema`

Backend:

- `POST /tcc-pro/orientacoes/:id/aprovar-tema-com-prazos`

Payload esperado:

```json
{
  "sourceType": "tema",
  "autorNome": "Nome do professor",
  "prazos": {
    "Tema aprovado": "2026-08-01",
    "Projeto de TCC": "2026-08-15",
    "Entrega parcial": "2026-09-15",
    "Versao final": "2026-10-30",
    "Banca": "2026-11-20"
  }
}
```

Regra atual:

- O prazo de `Tema aprovado` e obrigatorio.

Efeito:

- Atualiza `tema_tcc.status` para `aprovado`.
- Cria ou encontra um `tcc`.
- Atualiza `tcc.status` para `em_andamento`.
- Cria as etapas em `tcc_timeline`.
- Aplica os prazos informados.
- Cria comentario em `tcc_orientacao_comentario`.

Estado atual:

- Implementado.

### Etapa 5 - Professor acompanha etapas obrigatorias

Tela:

- `/orientacoes`

Backend:

- `GET /tcc-pro/orientacoes/professor/:uuidProfessor`
- `POST /tcc-pro/orientacoes/etapas/:uuidTimeline/concluir`
- `PUT /tcc-pro/orientacoes/:uuidTcc/prazos`

Banco:

- `tcc`
- `tcc_timeline`
- `tcc_orientacao_comentario`

Regras atuais:

- Apenas a proxima etapa nao concluida pode ser concluida.
- A etapa precisa estar `em_analise`.
- Ao concluir uma etapa, a proxima vira `em_analise`.
- Quando todas as etapas estao `concluida`, o `tcc.status` vira `aprovado`.

Estado atual:

- Implementado para professor.

Limite atual:

- O aluno ainda nao tem uma tela real de acompanhamento dessas etapas.
- `tcc.proxima_entrega` nao esta sincronizado automaticamente com a proxima etapa da timeline.

### Etapa 6 - Ajustes e comentarios

Tela:

- `/orientacoes`

Backend:

- `POST /tcc-pro/orientacoes/:id/solicitar-ajustes`
- `POST /tcc-pro/orientacoes/:id/comentarios`

Banco:

- `tema_tcc`
- `tcc`
- `tcc_orientacao_comentario`

Regras atuais:

- Ajustes no tema alteram `tema_tcc.status`.
- Ajustes no trabalho alteram `tcc.status`, quando existe `tcc`.
- Comentarios sao registrados em `tcc_orientacao_comentario`.

Estado atual:

- Implementado para professor.

Limite atual:

- Falta o aluno visualizar e responder aos comentarios.
- Falta o aluno reenviar/alterar tema ou trabalho depois de ajustes.

### Etapa 7 - Banca como etapa de timeline

Tela:

- `/orientacoes`

Backend:

- `POST /tcc-pro/orientacoes/etapas/:uuidTimeline/concluir`

Regra especial:

- Se a etapa concluida for `Banca`, o backend exige `nota`.
- A nota precisa estar entre 0 e 10.

Efeito:

- Cria ou atualiza `avaliacao`.
- Vincula a avaliacao ao `uuid_tcc`.
- Vincula a avaliacao ao professor orientador.
- Marca `publicado = true`.

Estado atual:

- Implementado de forma simplificada.

Limites atuais:

- Nao existe entidade `banca`.
- Nao existe composicao de avaliadores.
- Nao existe conflito de agenda.
- Nao existe consolidacao multiavaliador.
- Nao existe ata.

## Telas Atuais e Papel no Fluxo

| Tela | Ator | Estado | Papel |
|---|---|---|---|
| `/perfil` | Professor | Implementada | Cadastrar areas/linhas de pesquisa |
| `/admin/professores` | Admin/Coordenacao | Implementada | Gerenciar professores e areas/linhas |
| `/tema` | Aluno | Parcial | Registrar proposta de tema e escolher professor |
| `/orientacoes` | Professor | Parcial/realista | Gerenciar solicitacoes, tema aprovado, etapas e comentarios |
| `/` dashboard aluno | Aluno | Parcial | Mostra resumo, mas ainda mistura mock |
| `/` dashboard professor | Professor | Parcial | Mostra resumo baseado em endpoints de dashboard e fallback |
| `/tccs` | Varios | Parcial | Lista TCCs existentes |
| `/cronograma` | Varios | Parcial | Calendario/feriados, nao timeline real de TCC |
| `/documentos` | Aluno | ComingSoon | Ainda nao existe entidade/documento real |
| `/mensagens` | Aluno | ComingSoon | Ainda nao existe tela real de mensagens |
| `/apresentacao` | Aluno/Professor | ComingSoon | Ainda nao existe fluxo real de apresentacao |

## Endpoints Atuais do Fluxo

### Professor

- `GET /tcc-pro/professor`
- `GET /tcc-pro/professor/:id`
- `POST /tcc-pro/professor`
- `PUT /tcc-pro/professor`
- `GET /tcc-pro/professor/recommendations`

### Tema

- `POST /tcc-pro/tema-tcc`
- `GET /tcc-pro/tema-tcc`
- `GET /tcc-pro/tema-tcc/me`
- `GET /tcc-pro/tema-tcc/:id`
- `PUT /tcc-pro/tema-tcc`
- `DELETE /tcc-pro/tema-tcc/:id`

### Orientacao

- `GET /tcc-pro/orientacoes/professor/:uuidProfessor`
- `POST /tcc-pro/orientacoes/:id/aprovar-orientacao`
- `POST /tcc-pro/orientacoes/:id/recusar`
- `POST /tcc-pro/orientacoes/:id/aprovar-tema`
- `POST /tcc-pro/orientacoes/:id/aprovar-tema-com-prazos`
- `POST /tcc-pro/orientacoes/:id/solicitar-ajustes`
- `POST /tcc-pro/orientacoes/:id/comentarios`
- `POST /tcc-pro/orientacoes/:id/operacoes`
- `POST /tcc-pro/orientacoes/etapas/:uuidTimeline/concluir`
- `PUT /tcc-pro/orientacoes/:uuidTcc/prazos`

### TCC

- `POST /tcc-pro/tcc`
- `GET /tcc-pro/tcc`
- `GET /tcc-pro/tcc/:id`
- `PUT /tcc-pro/tcc`
- `DELETE /tcc-pro/tcc/:id`

### Avaliacao

- `POST /tcc-pro/avaliacao`
- `GET /tcc-pro/avaliacao`
- `GET /tcc-pro/avaliacao/:id`
- `PUT /tcc-pro/avaliacao`
- `DELETE /tcc-pro/avaliacao/:id`

## Nao Implementado / Nao Mostrar Como Pronto

Estas funcionalidades podem aparecer no caso academico ou no menu, mas nao devem ser
tratadas como prontas sem nova implementacao:

- Upload de documentos.
- Anexos do TCC.
- Mensagens privadas entre aluno e professor.
- Notificacoes em tela com leitura/nao leitura real.
- Entrega obrigatoria com documento anexado.
- Banca como entidade propria.
- Composicao de banca com orientador e avaliadores.
- Verificacao de conflito de agenda para banca.
- Agendamento de apresentacao integrado ao fluxo de orientacao.
- Ata da banca.
- Parecer completo de avaliador.
- Avaliacao multiavaliador.
- Consolidacao final do resultado do TCC.
- Tela real de resultado para o aluno.
- Relatorios gerenciais por curso/semestre.
- Entidade `Curso`.
- Regras por curso.
- Autorizacao real por role no backend.

## Problemas Tecnicos Atuais

### Backend

- A autorizacao por role/perfil existe no banco, mas nao e aplicada por middleware de permissao.
- O fluxo depende de e-mail para localizar aluno/professor no frontend.
- `GET /tema-tcc/me` depende do usuario autenticado ter `uuidAluno`.
- `tcc.proxima_entrega` nao e atualizado automaticamente pela proxima etapa em `tcc_timeline`.
- `performOperation` foi restringido a cancelamento porque outras operacoes nao tinham persistencia real.
- Avaliacao da Banca e simplificada: usa o orientador como professor avaliador.
- Nao ha testes de servico/cenario para orientacao.

### Frontend

- Dashboard do aluno ainda mistura dados reais e mock.
- `/tema` ainda precisa virar uma tela de acompanhamento real depois que o aluno ja enviou proposta.
- `/orientacoes` e uma tela de professor; nao deve ser reutilizada para aluno sem adaptar.
- Rotas `/documentos`, `/mensagens`, `/apresentacao` estao no menu, mas caem em `ComingSoon`.
- Ha warnings antigos de lint em telas admin por `catch (error)` nao usado.

### Banco

- Falta `curso`.
- Falta `documento`.
- Falta `entrega` como entidade separada de `tcc_timeline`.
- Falta `banca`.
- Falta `banca_participante` ou equivalente.
- Falta `ata`.
- Falta uma modelagem clara para avaliacao multiavaliador.

## Fila Recomendada de Implementacao

### ORIENT-001 - Criar acompanhamento real do aluno

Prioridade: alta

Objetivo:

Permitir que o aluno acompanhe sua proposta/TCC depois de enviar o tema, sem depender
de mock.

Escopo backend:

- Criar endpoint de acompanhamento do aluno:
  - sugestao: `GET /tcc-pro/orientacoes/aluno/:uuidAluno`
  - alternativa futura com auth real: `GET /tcc-pro/orientacoes/me`
- Retornar:
  - dados da proposta em `tema_tcc`;
  - dados do `tcc`, se existir;
  - professor orientador;
  - status normalizado;
  - etapas reais, se existir `tcc_timeline`;
  - comentarios de `tcc_orientacao_comentario`.

Escopo frontend:

- Adaptar `/tema` ou criar uma nova area dentro dela para:
  - mostrar solicitacao enviada;
  - mostrar status real;
  - mostrar professor indicado/orientador;
  - mostrar comentarios do professor;
  - mostrar etapas quando o `tcc` existir.
- Remover dependencia de dados mock nessa experiencia quando `VITE_BACKEND_ACTIVE=true`.

Arquivos provaveis:

- `api-tcc-pro/start/routes/orientacao.ts`
- `api-tcc-pro/app/controllers/orientacao_controller.ts`
- `api-tcc-pro/app/services/orientacao_service.ts`
- `frontend/src/shared/api/orientation-api.ts`
- `frontend/src/features/student-topic/StudentTopicPage.tsx`

Criterios de aceite:

- Aluno teste ve "Nenhuma proposta enviada" se nao houver `tema_tcc`.
- Aluno teste ve sua proposta real se houver `tema_tcc`.
- Aluno ve `etapas = []` antes de virar `tcc`.
- Aluno ve etapas reais quando existir `tcc_timeline`.
- Nenhum mock e usado quando `VITE_BACKEND_ACTIVE=true`.

Testes recomendados:

- Backend functional test para `GET /orientacoes/aluno/:uuidAluno`.
- Frontend build.
- Teste manual com `aluno.teste@gestaotcc.local`.

### ORIENT-002 - Permitir resposta do aluno a ajustes/comentarios

Prioridade: alta

Objetivo:

Fechar o ciclo professor solicita ajuste -> aluno responde -> professor reavalia.

Escopo backend:

- Criar endpoint para comentario/resposta do aluno:
  - sugestao: `POST /tcc-pro/orientacoes/:id/comentarios-aluno`
  - ou reutilizar `/comentarios` aceitando `autorTipo = Aluno` com validacao clara.
- Definir quais campos do tema o aluno pode editar quando status e `ajustes_solicitados`.
- Definir transicao de status depois de resposta:
  - sugestao: voltar para `tema_pendente` se ainda for `tema_tcc`;
  - sugestao: voltar para `em_andamento` se ja for `tcc`.

Escopo frontend:

- Na tela do aluno, exibir comentarios.
- Permitir responder comentario.
- Permitir editar proposta quando ajuste for no tema.

Criterios de aceite:

- Professor solicita ajuste.
- Aluno ve ajuste.
- Aluno responde.
- Professor ve resposta em `/orientacoes`.
- Status volta para reanalise.

### ORIENT-003 - Sincronizar proxima entrega do TCC

Prioridade: media/alta

Objetivo:

Usar `tcc_timeline` como fonte real para proxima entrega.

Escopo backend:

- Ao criar ou atualizar prazos, atualizar `tcc.proxima_entrega` com a proxima etapa
  nao concluida.
- Ao concluir etapa, atualizar `tcc.proxima_entrega` com a proxima etapa.
- Se todas as etapas forem concluidas, limpar ou manter ultima entrega com regra definida.

Arquivos provaveis:

- `api-tcc-pro/app/services/orientacao_service.ts`
- `api-tcc-pro/app/services/dash_alunos_service.ts`

Criterios de aceite:

- Dashboard do aluno mostra proxima entrega real.
- `GET /tcc-pro/tcc` retorna `proximaEntrega` coerente.
- Ao concluir uma etapa, a proxima entrega muda.

### ORIENT-004 - Tornar dashboard do aluno 100% real

Prioridade: alta

Objetivo:

Remover os dados ficticios do dashboard do aluno quando o backend estiver ativo.

Escopo backend:

- Expandir `GET /tcc-pro/dash-alunos/:uuidAluno` para retornar:
  - tema atual real;
  - status real;
  - proxima entrega real;
  - orientador real;
  - timeline real;
  - alertas/notificacoes reais.

Escopo frontend:

- Atualizar `dashboard-api.ts` para nao completar com mock quando backend ativo.
- Exibir estado vazio quando nao houver tema/TCC.

Criterios de aceite:

- Aluno sem tema ve estado vazio real.
- Aluno com tema pendente ve proposta real.
- Aluno com TCC ve timeline real.
- Nenhum item ficticio aparece com `VITE_BACKEND_ACTIVE=true`.

### ORIENT-005 - Melhorar listagem `/tccs` com dados reais e acoes coerentes

Prioridade: media

Objetivo:

Transformar `/tccs` em uma listagem util do que realmente existe em `tcc`.

Escopo:

- Confirmar se `/tccs` e tela de aluno, professor ou coordenacao.
- Para aluno: listar apenas seu TCC.
- Para professor: listar TCCs orientados.
- Para coordenacao: listar todos.
- Remover botao "Cadastrar" se nao houver fluxo real de cadastro manual de TCC.

Criterios de aceite:

- A lista respeita o perfil do usuario.
- Nao mostra acoes inexistentes.
- Status e filtros usam valores reais do backend.

Status: implementado em 2026-07-16.

Implementacao:

- `/tccs` foi confirmado como tela compartilhada entre aluno, professor e
  coordenacao/administracao.
- Com backend ativo, a API do frontend nao usa mais `tccs.mock.json`.
- Aluno consulta `GET /tcc-pro/tcc?uuidAluno=...`.
- Professor consulta `GET /tcc-pro/tcc?uuidOrientador=...`.
- Coordenador e administrador consultam `GET /tcc-pro/tcc` sem filtro.
- O botao "Cadastrar" foi removido da listagem, pois TCC nasce pela aprovacao do
  tema no fluxo real de orientacao.
- O filtro de status agora e montado a partir dos status retornados pelo backend.

Validacao:

- `npm run build` no frontend passou.
- `npm run lint` no frontend passou com avisos antigos em telas de admin.
- Leitura local confirmou que aluno/professor/coordenador nao recebem dados
  ficticios quando a tabela `tcc` esta vazia.

### ORIENT-006 - Criar tela real de timeline/cronograma do TCC

Prioridade: media

Objetivo:

Substituir a ideia generica de calendario por uma tela de prazos do TCC baseada em
`tcc_timeline`.

Escopo frontend:

- Criar ou adaptar `/cronograma` para mostrar:
  - etapas do TCC;
  - prazo;
  - status;
  - etapa atual;
  - dias restantes/atraso.

Escopo backend:

- Reutilizar endpoint de acompanhamento do aluno/professor.
- Ou criar endpoint dedicado de timeline por `uuidTcc`.

Criterios de aceite:

- Aluno ve cronograma real.
- Professor ve cronograma real dos orientandos.
- Feriados podem continuar como contexto visual, mas nao devem substituir etapas reais.

Status: implementado em 2026-07-16.

Implementacao:

- `/cronograma` foi adaptada para usar as timelines reais retornadas pelos endpoints
  de acompanhamento existentes.
- Aluno consulta suas orientacoes e exibe apenas itens que ja viraram `tcc`.
- Professor consulta seus orientandos e exibe os cronogramas dos TCCs orientados.
- A tela mostra resumo, progresso, etapa atual, prazo, status, dias restantes e
  atrasos.
- O calendario de feriados continua como contexto visual e tambem marca datas com
  prazo do TCC.
- Coordenacao/administracao ficam com estado vazio real enquanto nao existir endpoint
  agregado de timeline para esses perfis.

Validacao:

- `npm run build` no frontend passou.
- `npm run lint` no frontend passou com avisos antigos em telas de admin.
- Leitura local confirmou que os usuarios de teste ainda possuem orientacao de tema,
  mas nenhum TCC/timeline real; por isso `/cronograma` deve exibir estado vazio real
  ate o tema ser aprovado e gerar `tcc_timeline`.

### ORIENT-007 - Implementar notificacoes reais do fluxo

Prioridade: media

Objetivo:

Usar `tcc_notificacao` para avisos reais.

Escopo backend:

- Criar notificacao quando:
  - professor aceita orientacao;
  - professor recusa;
  - professor solicita ajuste;
  - professor aprova tema;
  - professor conclui etapa;
  - aluno responde ajuste.
- Vincular `uuid_usuario` quando possivel.

Escopo frontend:

- Criar tela `/mensagens` ou `/notificacoes`.
- Exibir lista real.
- Permitir marcar como lida/concluida, se esse comportamento for definido.

Criterios de aceite:

- Aluno recebe notificacoes reais do professor.
- Professor recebe notificacoes reais de resposta do aluno.
- Nenhum alerta ficticio no dashboard quando backend ativo.

### ORIENT-008 - Modelar entregas/documentos

Prioridade: alta para MVP academico, mas depende de ORIENT-001 a ORIENT-004 para
experiencia coerente.

Objetivo:

Permitir que aluno envie documentos obrigatorios do TCC.

Escopo banco:

- Criar entidade `entrega` ou evoluir `tcc_timeline` com relacao para documentos.
- Criar entidade `documento`.
- Campos sugeridos para `documento`:
  - `uuid_documento`
  - `uuid_tcc`
  - `uuid_timeline` ou `uuid_entrega`
  - `nome_arquivo`
  - `mime_type`
  - `tamanho`
  - `storage_key` ou `url`
  - `status`
  - `enviado_por`
  - timestamps

Escopo backend:

- Upload.
- Download.
- Listagem por TCC/etapa.
- Validacao de tipo/tamanho.
- Status de documento.

Escopo frontend:

- Implementar `/documentos`.
- Integrar documentos com etapa atual.

Criterios de aceite:

- Aluno envia documento para etapa atual.
- Professor visualiza documento.
- Professor solicita ajuste ou aprova entrega.

### ORIENT-009 - Modelar Banca explicitamente

Prioridade: alta para MVP academico, mas depende de agenda e avaliacao.

Objetivo:

Separar a etapa "Banca" da timeline de uma entidade formal de banca.

Escopo banco:

- Criar `banca`.
- Criar `banca_participante`.
- Relacionar com `tcc`.
- Relacionar com `agenda`.

Campos sugeridos para `banca`:

- `uuid_banca`
- `uuid_tcc`
- `uuid_agenda`
- `status`
- `modalidade`
- timestamps

Campos sugeridos para `banca_participante`:

- `uuid_banca_participante`
- `uuid_banca`
- `uuid_professor`
- `papel` (`orientador`, `avaliador`, `suplente`)

Escopo backend:

- Criar banca.
- Definir avaliadores.
- Validar conflito de agenda.
- Registrar data/local/link.

Escopo frontend:

- Tela de formacao de banca para coordenacao.
- Tela de visualizacao da banca para aluno/professor.

Criterios de aceite:

- Coordenacao cria banca com orientador e avaliadores.
- Sistema impede conflito de horario.
- Aluno ve data/local da banca.
- Professor ve bancas em que participa.

### ORIENT-010 - Implementar avaliacao final multiavaliador

Prioridade: alta depois de ORIENT-009.

Objetivo:

Permitir que cada avaliador registre nota e parecer.

Escopo backend:

- Definir se `avaliacao` atual serve ou precisa de ajustes.
- Garantir uma avaliacao por TCC/professor avaliador.
- Permitir rascunho.
- Publicar avaliacao.
- Consolidar resultado quando todos os avaliadores terminarem.

Escopo frontend:

- Tela do professor avaliador para registrar nota/parecer.
- Tela do aluno para ver resultado quando publicado.

Criterios de aceite:

- Avaliador salva rascunho.
- Avaliador publica nota.
- Sistema valida nota entre 0 e 10.
- Resultado final so aparece quando consolidado.

### ORIENT-011 - Resultado do aluno

Prioridade: media/alta depois de ORIENT-010.

Objetivo:

Aluno ve resultado final do TCC.

Escopo:

- Criar tela ou adaptar dashboard.
- Mostrar:
  - status final;
  - nota final;
  - pareceres publicados;
  - pendencias/correcoes, se houver.

Criterios de aceite:

- Aluno nao ve resultado antes da publicacao/consolidacao.
- Aluno ve resultado real sem mock.

### ORIENT-012 - Autorizacao real no backend

Prioridade: transversal.

Objetivo:

Garantir que aluno, professor e coordenacao so acessem o que devem.

Escopo:

- Usar JWT/sessao com usuario real.
- Incluir roles/perfil no contexto da requisicao.
- Criar middleware/policies.
- Proteger endpoints por papel.

Criterios de aceite:

- Aluno nao acessa orientacoes de outro aluno.
- Professor nao acessa orientacoes de outro professor.
- Coordenacao acessa visao ampla quando autorizado.
- Rotas rejeitam acesso indevido com 403.

## Ordem Recomendada de Execucao

1. **ORIENT-001** - Acompanhamento real do aluno.
2. **ORIENT-002** - Resposta do aluno a ajustes/comentarios.
3. **ORIENT-003** - Sincronizar proxima entrega do TCC.
4. **ORIENT-004** - Dashboard do aluno 100% real.
5. **ORIENT-005** - Ajustar `/tccs` com dados e permissoes coerentes.
6. **ORIENT-006** - Cronograma/timeline real do TCC.
7. **ORIENT-007** - Notificacoes reais.
8. **ORIENT-008** - Entregas/documentos.
9. **ORIENT-009** - Banca explicita.
10. **ORIENT-010** - Avaliacao final multiavaliador.
11. **ORIENT-011** - Resultado do aluno.
12. **ORIENT-012** - Autorizacao real no backend.

Observacao: ORIENT-012 e transversal. Pode ser antecipado se o foco virar seguranca,
mas para evolucao funcional do MVP academico, ORIENT-001 a ORIENT-004 desbloqueiam a
experiencia aluno-professor mais rapidamente.

## Regras de Produto Para Manter

- Nao exibir dados ficticios quando `VITE_BACKEND_ACTIVE=true`.
- Nao mostrar botoes que chamam operacoes sem persistencia real.
- Nao criar etapas de timeline para `tema_tcc`; etapas pertencem a `tcc`.
- Nao tratar `Agenda` como `Banca`; hoje sao conceitos diferentes.
- Nao tratar `tcc_timeline` como documento/entrega com upload; ainda falta modelagem.
- O professor indicado no tema precisa existir em `professor`.
- O aluno logado precisa ter `uuidAluno`.
- A etapa `Banca` atual e apenas uma etapa da timeline, nao uma banca formal.

## Checklist Para Cada Implementacao

Antes de codar:

- [ ] Identificar entidade real no banco.
- [ ] Confirmar endpoint existente ou criar endpoint novo.
- [ ] Confirmar se a tela deve ser de aluno, professor ou coordenacao.
- [ ] Confirmar se a feature pode usar dados reais sem mock.

Durante a implementacao:

- [ ] Atualizar backend primeiro quando faltar contrato.
- [ ] Atualizar frontend depois do contrato.
- [ ] Evitar fallback silencioso para mock quando backend ativo.
- [ ] Adicionar estados vazios reais.
- [ ] Adicionar mensagens de erro claras.

Validacao minima:

- [ ] Backend `npm run typecheck`.
- [ ] Backend `npm run lint`.
- [ ] Frontend `npm run build`.
- [ ] Frontend `npm run lint`.
- [ ] Teste manual com aluno teste.
- [ ] Teste manual com professor teste.

Observacao sobre testes backend:

- Nao rodar `npm test` apontando para `dev_tcc_pro`.
- A trava de seguranca bloqueia testes nesse banco para evitar reset.
- Para testes automatizados, configurar banco de teste separado.

## Dados de Teste Esperados

Usuarios usados no desenvolvimento:

- Administrador: `admin.teste@gestaotcc.local`
- Aluno: `aluno.teste@gestaotcc.local`
- Professor: `professor.teste@gestaotcc.local`
- Coordenador: `coordenador.teste@gestaotcc.local`

Senha comum:

- `Teste@12345`

Fluxo manual recomendado:

1. Entrar como professor.
2. Acessar `/perfil`.
3. Definir areas e linhas de pesquisa.
4. Entrar como aluno.
5. Acessar `/tema`.
6. Criar proposta escolhendo o professor.
7. Entrar como professor.
8. Acessar `/orientacoes`.
9. Aprovar orientacao.
10. Aprovar tema com prazos.
11. Concluir etapas.
12. Concluir Banca com nota.

## Proximo Passo Recomendado

Implementar **ORIENT-001 - Criar acompanhamento real do aluno**.

Motivo:

- Hoje o professor ja possui uma tela razoavelmente alinhada com a modelagem.
- O aluno ainda nao tem uma experiencia real para acompanhar o que acontece depois do envio.
- Sem essa etapa, o fluxo aluno-professor fica unilateral: o aluno envia e o professor
  gerencia, mas o aluno nao acompanha corretamente.

# Fluxo Aluno x Professor Orientador - Plano de Implementação

Última atualização: 2026-07-16

## Objetivo do Documento

Este documento descreve o fluxo implementado entre aluno e professor orientador no
GestãoTCC Pro, registra as telas e endpoints envolvidos, separa o que está pronto do
que ainda é simulado/incompleto e organiza a próxima fila de implementação.

Use este arquivo como controle de solicitações para o Codex. Exemplos de pedidos:

- "Implemente o próximo passo do plano."
- "Implemente ORIENT-008."
- "Revise ORIENT-012 antes de continuar o fluxo."
- "Atualize o plano depois da implementação atual."

## Status Rápido

O fluxo principal de orientação já cobre cadastro de áreas do professor, registro de
tema pelo aluno, indicação de professor, aceite/recusa do professor, aprovação de
tema com prazos, criação do TCC, criação de timeline, comentários, resposta do aluno,
notificações e cronograma real baseado em `tcc_timeline`.

O próximo passo funcional recomendado é **ORIENT-008 - Modelar entregas/documentos**.

O próximo passo transversal recomendado, se a prioridade for segurança/controle de
acesso, é **ORIENT-012 - Autorização real no backend**.

## Resumo Executivo do Fluxo Atual

1. O professor mantém suas áreas e linhas de pesquisa em `/perfil`.
2. O aluno acessa `/tema`, informa título, área, linha de pesquisa e descrição.
3. A tela recomenda professores conforme área/linha cadastradas.
4. Ao enviar a proposta, o backend grava em `tema_tcc`, não em `tcc`.
5. A proposta aparece em `/orientacoes` para o professor indicado.
6. O professor pode aceitar, recusar, comentar ou solicitar ajustes.
7. Depois do aceite, o professor aprova o tema com prazos.
8. A aprovação com prazos cria ou reutiliza um registro em `tcc`.
9. O backend cria as etapas em `tcc_timeline`.
10. O aluno acompanha a solicitação e, depois, o TCC em `/tema`.
11. O aluno responde comentários/ajustes em `/tema`.
12. Professor, coordenador e administrador acompanham em `/orientacoes`.
13. Coordenador e administrador veem a listagem sem filtro de professor.
14. Professor vê somente as orientações vinculadas ao próprio professor.
15. Notificações do fluxo aparecem em `/mensagens`.

## Fonte de Verdade Atual

### Backend

- `api-tcc-pro/start/routes/orientacao.ts`
- `api-tcc-pro/app/controllers/orientacao_controller.ts`
- `api-tcc-pro/app/services/orientacao_service.ts`
- `api-tcc-pro/start/routes/tema_tcc.ts`
- `api-tcc-pro/app/controllers/tema_tcc_controller.ts`
- `api-tcc-pro/app/services/dash_alunos_service.ts`
- `api-tcc-pro/app/services/dash_professor_service.ts`
- `api-tcc-pro/start/routes/notificacao.ts`
- `api-tcc-pro/app/services/notificacao_service.ts`
- `api-tcc-pro/database/migrations/*tcc*`
- `api-tcc-pro/database/seeders/role_perfil.seeder.ts`

### Frontend

- `frontend/src/app/routes/AppRoutes.tsx`
- `frontend/src/shared/layout/nav-items.ts`
- `frontend/src/features/student-topic/StudentTopicPage.tsx`
- `frontend/src/features/orientations/OrientationManagementPage.tsx`
- `frontend/src/features/cronograma/CronogramaPage.tsx`
- `frontend/src/features/mensagens/MensagensPage.tsx`
- `frontend/src/features/perfil/PerfilPage.tsx`
- `frontend/src/features/tccs/TccListPage.tsx`
- `frontend/src/shared/api/orientation-api.ts`
- `frontend/src/shared/api/tema-tcc-api.ts`
- `frontend/src/shared/api/tcc-api.ts`
- `frontend/src/shared/api/cronograma-api.ts`
- `frontend/src/shared/api/notificacao-api.ts`
- `frontend/src/shared/api/professor-api.ts`
- `frontend/src/shared/api/dashboard-api.ts`

## Modelagem Atual Envolvida

| Tabela | Papel no fluxo | Situação |
|---|---|---|
| `usuario` | Login, perfil, token, vínculo opcional com aluno | Implementada |
| `perfil` | Nome do perfil do usuário | Implementada |
| `role` | Códigos de permissão usados pelo frontend | Implementada |
| `perfil_role` | Associação entre perfil e roles | Implementada |
| `aluno` | Dados acadêmicos do aluno | Implementada |
| `professor` | Dados do professor, áreas e linhas de pesquisa | Implementada |
| `tema_tcc` | Proposta inicial do aluno antes de virar TCC | Implementada |
| `tcc` | TCC criado depois da aprovação do tema | Implementada |
| `tcc_timeline` | Etapas obrigatórias do acompanhamento | Implementada |
| `tcc_orientacao_comentario` | Comentários, ajustes e respostas do aluno | Implementada |
| `tcc_notificacao` | Notificações do fluxo de orientação | Implementada |
| `agenda` | Evento/agendamento genérico | Parcial para banca/apresentação |
| `agenda_participante` | Participantes de agenda | Parcial |
| `avaliacao` | Nota simplificada ao concluir a etapa Banca | Parcial |

## Regra Importante: `tema_tcc` x `tcc`

Quando o aluno registra um tema, o sistema grava em `tema_tcc`.

Isso é esperado. O registro só aparece em `tcc` depois que o professor aprova o tema
com prazos em `/orientacoes`. Nesse momento o backend executa a criação do TCC e das
etapas da timeline.

Estados principais antes de existir `tcc`:

- `solicitacao_pendente`
- `orientacao_aprovada`
- `tema_pendente`
- `ajustes_solicitados`
- `recusado`
- `orientacao_cancelada`

Estados principais depois de existir `tcc`:

- `em_andamento`
- `ajustes_solicitados`
- `banca`
- `aprovado`
- `orientacao_cancelada`

## Fluxo Detalhado Atual

### Etapa 0 - Perfil, áreas e linhas de pesquisa do professor

Tela principal:

- `/perfil`

Telas administrativas relacionadas:

- `/admin/professores`
- `/admin/professores/novo`
- `/admin/professores/:id`

Backend:

- `GET /tcc-pro/professor`
- `GET /tcc-pro/professor/:id`
- `POST /tcc-pro/professor`
- `PUT /tcc-pro/professor`
- `GET /tcc-pro/professor/recommendations`

O professor pode manter áreas e linhas de pesquisa em `/perfil`. Essas informações
são usadas por `/tema` para recomendar professores ao aluno.

Observações:

- O vínculo entre usuário professor e registro de professor ainda depende de busca
  por e-mail em alguns pontos do frontend.
- O ideal futuro é o token já carregar `uuidProfessor`, assim como carrega
  `uuidAluno` para o aluno.

### Etapa 1 - Aluno registra tema e indica professor

Tela:

- `/tema`

Frontend:

- `StudentTopicPage.tsx`
- `createTemaTcc`
- `getProfessorRecommendations`

Backend:

- `POST /tcc-pro/tema-tcc`
- `GET /tcc-pro/tema-tcc`
- `GET /tcc-pro/tema-tcc/me`
- `GET /tcc-pro/professor/recommendations`

Comportamento:

- O aluno preenche título, área, linha de pesquisa e descrição.
- O aluno seleciona professor recomendado.
- O backend cria um registro em `tema_tcc`.
- Ainda não existe `tcc`.
- Ainda não existe `tcc_timeline`.

### Etapa 2 - Aluno acompanha solicitação e responde ajustes

Tela:

- `/tema`

Frontend:

- `getAlunoOrientations`
- `addStudentOrientationResponse`

Backend:

- `GET /tcc-pro/orientacoes/aluno/:uuidAluno`
- `POST /tcc-pro/orientacoes/:id/comentarios-aluno`

Comportamento:

- A tela exibe a solicitação real do aluno.
- Se ainda não existe TCC, a origem é `sourceType = tema`.
- Se já existe TCC, a origem é `sourceType = tcc`.
- Etapas reais só aparecem quando há `tcc_timeline`.
- Antes da aprovação do tema, a tela mostra que as etapas serão exibidas depois.
- O aluno pode responder comentários ou ajustes do professor.
- Quando o ajuste é de tema, o aluno pode editar título, área, linha e descrição.

Status: implementado.

### Etapa 3 - Professor recebe solicitação

Tela:

- `/orientacoes`

Frontend:

- `OrientationManagementPage.tsx`
- `getManagedOrientations`
- `getProfessorOrientations`

Backend:

- `GET /tcc-pro/orientacoes/professor/:uuidProfessor`

Comportamento:

- Professor vê propostas vinculadas ao próprio registro de professor.
- A busca do professor ainda é feita por e-mail no frontend.
- A tela permite selecionar uma orientação e executar ações.

Status: implementado.

### Etapa 4 - Coordenador e administrador acompanham sem filtro de professor

Tela:

- `/orientacoes`

Frontend:

- `getManagedOrientations`
- `getAllOrientations`

Backend:

- `GET /tcc-pro/orientacoes`

Comportamento:

- Coordenador vê todas as propostas e orientações.
- Administrador vê todas as propostas e orientações.
- Não deve haver filtro por professor para esses perfis.
- A diferenciação é feita pelo perfil/roles no frontend.

Status: implementado no frontend e no endpoint de listagem global.

Atenção:

- O backend ainda não aplica políticas granulares por role em cada rota.
- Portanto, a garantia de visibilidade hoje é principalmente de frontend.

### Etapa 5 - Professor aceita ou recusa orientação

Tela:

- `/orientacoes`

Backend:

- `POST /tcc-pro/orientacoes/:id/aprovar-orientacao`
- `POST /tcc-pro/orientacoes/:id/recusar`

Comportamento:

- Ao aprovar orientação de um tema, `tema_tcc.status` vira `orientacao_aprovada`.
- Ao recusar, a solicitação vira `recusado`.
- O backend cria comentário de sistema.
- O backend cria notificação para o aluno quando há usuário destinatário.

Status: implementado, incluindo o pós-recusa em ORIENT-014.

Pós-recusa implementado:

- `recusado` encerra somente a solicitação/proposta específica.
- A proposta recusada permanece no histórico do aluno.
- A tela `/tema` separa orientação ativa de histórico recusado/cancelado.
- Se só houver histórico recusado/cancelado, o formulário de nova proposta volta a
  ficar disponível.
- O aluno pode reaproveitar dados da proposta encerrada como rascunho editável.
- `POST /tcc-pro/tema-tcc` bloqueia nova proposta somente quando há proposta/TCC
  ativo para o aluno.
- O endpoint de recusa não permite recusar um `tcc` já em acompanhamento.
- TCC já em acompanhamento deve usar cancelamento de orientação ou um futuro fluxo
  de troca de orientador.

### Etapa 6 - Professor aprova tema com prazos

Tela:

- `/orientacoes`

Backend:

- `POST /tcc-pro/orientacoes/:id/aprovar-tema-com-prazos`
- `PUT /tcc-pro/orientacoes/:uuidTcc/prazos`

Comportamento:

- Professor define prazos das etapas obrigatórias.
- Backend cria ou reutiliza `tcc`.
- Backend cria etapas em `tcc_timeline`.
- Backend sincroniza `tcc.proxima_entrega` com a próxima etapa pendente.
- A orientação passa a ter `sourceType = tcc`.

Etapas padrão:

- Tema aprovado
- Projeto de TCC
- Entrega parcial
- Versão final
- Banca

Status: implementado.

### Etapa 7 - Acompanhamento das etapas

Telas:

- `/orientacoes`
- `/tema`
- `/cronograma`
- `/tccs`
- dashboard do aluno
- dashboard do professor

Backend:

- `POST /tcc-pro/orientacoes/etapas/:uuidTimeline/concluir`
- `PUT /tcc-pro/orientacoes/:uuidTcc/prazos`
- `GET /tcc-pro/dash-alunos/:uuidAluno`
- `GET /tcc-pro/dash-professor/:uuidProfessor`

Comportamento:

- Apenas a próxima etapa em análise pode ser concluída.
- Ao concluir uma etapa, a próxima é ativada.
- `tcc.proxima_entrega` é recalculado.
- Quando todas as etapas são concluídas, o TCC vira `aprovado`.
- A etapa `Banca` exige nota.
- Ao concluir `Banca` com nota, o sistema cria/atualiza uma `avaliacao` simplificada
  vinculada ao professor orientador.

Status: implementado parcialmente.

Limitação:

- A banca ainda não é uma entidade formal.
- A avaliação ainda não representa múltiplos avaliadores.

### Etapa 8 - Comentários, ajustes e resposta do aluno

Telas:

- `/orientacoes`
- `/tema`

Backend:

- `POST /tcc-pro/orientacoes/:id/comentarios`
- `POST /tcc-pro/orientacoes/:id/solicitar-ajustes`
- `POST /tcc-pro/orientacoes/:id/comentarios-aluno`

Comportamento:

- Professor pode comentar.
- Professor pode solicitar ajuste de tema ou de trabalho.
- Aluno pode responder em `/tema`.
- Respostas do aluno usam `autor_tipo = Aluno`.
- Ajuste de tema permite editar dados do `tema_tcc`.
- Comentários alimentam histórico e notificações.

Status: implementado.

### Etapa 9 - Notificações

Tela:

- `/mensagens`

Backend:

- `GET /tcc-pro/notificacoes/:uuidUsuario`
- `PUT /tcc-pro/notificacoes/:uuidTccNotificacao/status`

Comportamento:

- Notificações são geradas por ações do fluxo de orientação.
- Notificações podem apontar para `/tema` ou `/orientacoes`.
- Aluno, professor, coordenador e administrador podem acessar `/mensagens` conforme
  roles do menu.
- A tela permite marcar notificação como lida.

Status: implementado.

### Etapa 10 - Visões auxiliares

#### `/tccs`

Lista TCCs reais do backend.

Escopo atual:

- Aluno: filtra por aluno.
- Professor: filtra por orientador.
- Coordenador: lista global.
- Administrador: lista global.

Status: implementado.

Limitação:

- O backend devolve UUIDs; o frontend cruza listas de aluno, professor e tema para
  montar nomes/títulos.

#### `/cronograma`

Mostra cronograma real baseado em orientações e `tcc_timeline`.

Escopo atual:

- Aluno: usa `GET /orientacoes/aluno/:uuidAluno`.
- Professor: usa `GET /orientacoes/professor/:uuidProfessor`.
- Coordenador/Administrador: usa `GET /orientacoes`.

Status: implementado.

#### Dashboards

Dashboard do aluno:

- Usa tema/TCC real.
- Usa timeline real.
- Usa notificações reais.
- Não deve criar alerta fictício quando não há dado real.

Dashboard do professor:

- Usa TCCs orientados reais.
- Mostra resumo de TCCs, próximas bancas/agendas e avisos.

Status: implementado parcialmente, com limitações de modelagem para banca.

## Telas Atuais e Papel no Fluxo

| Tela | Ator | Estado | Papel |
|---|---|---|---|
| `/perfil` | Todos | Real | Atualiza cadastro do usuário; professor mantém área/linha |
| `/admin/professores` | Admin/Coordenador conforme role | Real | Cadastro administrativo de professores |
| `/tema` | Aluno | Real | Registrar tema, escolher professor, acompanhar solicitação/TCC e responder ajustes |
| `/orientacoes` | Professor | Real | Gerir orientações do próprio professor |
| `/orientacoes` | Coordenador | Real | Gerir orientações sem filtro de professor |
| `/orientacoes` | Administrador | Real | Gerir orientações sem filtro de professor |
| `/tccs` | Aluno/Professor/Coordenação/Admin | Real | Listagem de TCCs por escopo |
| `/cronograma` | Aluno/Professor/Coordenação/Admin | Real | Timeline consolidada por escopo |
| `/mensagens` | Aluno/Professor/Coordenação/Admin | Real | Notificações reais do fluxo |
| `/documentos` | Aluno | Placeholder | Ainda não há upload/documento real |
| `/apresentacao` | Aluno/Professor/Coordenação/Admin | Placeholder | Ainda não há banca/apresentação formal |
| `/admin/usuarios` | Admin | Real | Gestão de usuários |
| `/admin/roles` | Admin | Real | Gestão de roles |
| `/admin/perfis` | Admin | Real | Gestão de perfis e roles |
| `/admin/alunos` | Admin/Coordenação conforme role | Real | Gestão de alunos |

## Roles e Visibilidade Atual

As roles são carregadas pelo backend e usadas pelo frontend em `RequireRole` e no menu.

| Perfil | Roles principais atuais | Efeito esperado |
|---|---|---|
| Administrador | Todas as roles do seed | Vê todas as telas e todas as listagens |
| Aluno | `ROLE_TEMA_VIEW`, `ROLE_TCC_VIEW`, `ROLE_AGENDA_VIEW`, `ROLE_DASH_ALUNO`, `ROLE_MENU_MEU_TCC`, `ROLE_MENU_AGENDA` | Vê fluxo próprio do aluno |
| Professor | `ROLE_TCC_VIEW`, `ROLE_AGENDA_VIEW`, `ROLE_DASH_PROFESSOR`, `ROLE_MENU_AGENDA` | Vê dashboard professor, `/orientacoes`, `/tccs`, `/cronograma` com filtro de professor |
| Coordenador | `ROLE_ALUNO_VIEW`, `ROLE_TEMA_VIEW`, `ROLE_TCC_VIEW`, `ROLE_AGENDA_VIEW`, `ROLE_PROFESSOR_VIEW`, `ROLE_DASH_COORDENADOR`, `ROLE_MENU_ADM`, `ROLE_MENU_AGENDA` | Vê telas de coordenação/admin e listagens globais |

Regras de visibilidade já aplicadas:

- `/orientacoes`: professor, coordenador e admin.
- `/tema`: aluno e perfis que possuam `ROLE_TEMA_VIEW`.
- `/admin`: perfis com `ROLE_MENU_ADM`.
- `/mensagens`: aluno, professor, coordenador e admin.
- `/documentos`: aparece para aluno, mas é placeholder.
- `/apresentacao`: aparece para quem tem agenda, mas é placeholder.

Atenção:

- O frontend restringe rotas por roles.
- O backend autentica token, mas ainda não tem policy por role em cada endpoint.
- ORIENT-012 deve fechar essa lacuna.

## Endpoints Atuais do Fluxo

### Autenticação e usuário

- `POST /tcc-pro/auth/login`
- `POST /tcc-pro/auth/register`
- `POST /tcc-pro/auth/google`
- `GET /tcc-pro/auth/me`
- `GET /tcc-pro/usuario`
- `GET /tcc-pro/usuario/:id`
- `PUT /tcc-pro/usuario`

### Professor

- `GET /tcc-pro/professor`
- `GET /tcc-pro/professor/:id`
- `POST /tcc-pro/professor`
- `PUT /tcc-pro/professor`
- `DELETE /tcc-pro/professor/:id`
- `GET /tcc-pro/professor/recommendations`

### Tema de TCC

- `POST /tcc-pro/tema-tcc`
- `GET /tcc-pro/tema-tcc`
- `GET /tcc-pro/tema-tcc/me`
- `GET /tcc-pro/tema-tcc/:id`
- `PUT /tcc-pro/tema-tcc`
- `DELETE /tcc-pro/tema-tcc/:id`

### Orientações

- `GET /tcc-pro/orientacoes`
- `GET /tcc-pro/orientacoes/professor/:uuidProfessor`
- `GET /tcc-pro/orientacoes/aluno/:uuidAluno`
- `POST /tcc-pro/orientacoes/:id/aprovar-orientacao`
- `POST /tcc-pro/orientacoes/:id/recusar`
- `POST /tcc-pro/orientacoes/:id/aprovar-tema`
- `POST /tcc-pro/orientacoes/:id/aprovar-tema-com-prazos`
- `POST /tcc-pro/orientacoes/:id/solicitar-ajustes`
- `POST /tcc-pro/orientacoes/:id/comentarios`
- `POST /tcc-pro/orientacoes/:id/comentarios-aluno`
- `POST /tcc-pro/orientacoes/:id/operacoes`
- `POST /tcc-pro/orientacoes/etapas/:uuidTimeline/concluir`
- `PUT /tcc-pro/orientacoes/:uuidTcc/prazos`

### TCC, dashboard, agenda e notificações

- `GET /tcc-pro/tcc`
- `GET /tcc-pro/tcc/:id`
- `POST /tcc-pro/tcc`
- `PUT /tcc-pro/tcc`
- `DELETE /tcc-pro/tcc/:id`
- `GET /tcc-pro/dash-alunos/:uuidAluno`
- `GET /tcc-pro/dash-professor/:uuidProfessor`
- `GET /tcc-pro/dash-cordenacao/:uuidProfessor`
- `GET /tcc-pro/agenda`
- `GET /tcc-pro/agenda/:id`
- `POST /tcc-pro/agenda`
- `PUT /tcc-pro/agenda`
- `DELETE /tcc-pro/agenda/:id`
- `GET /tcc-pro/notificacoes/:uuidUsuario`
- `PUT /tcc-pro/notificacoes/:uuidTccNotificacao/status`

## O Que Não Está Implementado

Não tratar como pronto:

- Upload de documentos do TCC.
- Entidade formal de entrega/documento.
- Controle de versão de documentos.
- Validação de documentos obrigatórios por etapa.
- Banca como entidade formal.
- Participantes de banca com papéis claros.
- Verificação real de conflito de agenda para banca.
- Fluxo de aceite/indisponibilidade de avaliador.
- Avaliação por múltiplos avaliadores.
- Consolidação de nota final.
- Parecer individual por avaliador.
- Publicação de resultado para o aluno.
- Ata de banca.
- Relatórios gerenciais por curso/semestre.
- Entidade `curso`.
- Regras por curso, semestre e turma.
- Autorização granular no backend por role.

## Riscos e Dívidas Técnicas

1. Backend ainda não aplica autorização por role em cada rota.
2. Algumas telas descobrem `uuidProfessor` ou `uuidAluno` por e-mail.
3. `dash-cordenacao` mantém a grafia técnica histórica `cordenacao`.
4. `Agenda` ainda não substitui uma entidade formal de banca.
5. `Avaliacao` atual é simplificada e vinculada ao orientador.
6. `tcc_timeline` controla etapas/prazos, mas ainda não representa documentos.
7. `/documentos` e `/apresentacao` existem no menu, mas são placeholders.
8. Mocks ainda existem para modo backend inativo; ao testar fluxo real, garantir
   backend ativo em `frontend/.env`.
9. Cobertura de testes automatizados do fluxo ainda é baixa.

## Fila Recomendada de Implementação

### ORIENT-001 - Criar acompanhamento real do aluno

Status: implementado.

Objetivo:

- Permitir que o aluno acompanhe a solicitação e o TCC em `/tema`.

Implementado:

- `GET /tcc-pro/orientacoes/aluno/:uuidAluno`.
- Exibição real da solicitação.
- Exibição real de etapas quando existe `tcc_timeline`.
- Estado vazio quando não há solicitação.

### ORIENT-002 - Permitir resposta do aluno a ajustes/comentários

Status: implementado.

Objetivo:

- Permitir que o aluno responda comentários e ajustes em `/tema`.

Implementado:

- `POST /tcc-pro/orientacoes/:id/comentarios-aluno`.
- Resposta com `autor_tipo = Aluno`.
- Edição de tema quando o ajuste solicitado é de tema.
- Retorno da solicitação para análise do professor.

### ORIENT-003 - Sincronizar próxima entrega do TCC

Status: implementado.

Objetivo:

- Manter `tcc.proxima_entrega` coerente com a próxima etapa de `tcc_timeline`.

Implementado:

- Sincronização ao aprovar tema com prazos.
- Sincronização ao atualizar prazos.
- Sincronização ao concluir etapa.

### ORIENT-004 - Tornar dashboard do aluno 100% real

Status: implementado.

Objetivo:

- Remover dependência de alertas fictícios quando o backend está ativo.

Implementado:

- Dashboard usa tema/TCC real.
- Dashboard usa timeline real.
- Dashboard usa notificações reais.
- Estado vazio respeita ausência de dados.

### ORIENT-005 - Melhorar listagem `/tccs` com dados reais e ações coerentes

Status: implementado.

Objetivo:

- Listar TCCs reais conforme perfil.

Implementado:

- Aluno vê seus TCCs.
- Professor vê TCCs orientados por ele.
- Coordenador e admin veem listagem global.
- Frontend resolve nomes/títulos cruzando dados auxiliares.

### ORIENT-006 - Criar tela real de timeline/cronograma do TCC

Status: implementado.

Objetivo:

- Exibir cronograma real a partir de `tcc_timeline`.

Implementado:

- `/cronograma` usa orientações reais.
- Escopo varia por perfil.
- Exibe etapa atual, prazos e estados de prazo.

### ORIENT-007 - Implementar notificações reais do fluxo

Status: implementado.

Objetivo:

- Exibir notificações reais em `/mensagens`.

Implementado:

- `tcc_notificacao` aceita notificação por TCC, tema e usuário.
- Fluxo de orientação cria notificações.
- `/mensagens` lista e marca notificações como lidas.
- Dashboard do aluno consome notificações reais.

### ORIENT-008 - Modelar entregas/documentos

Status: pendente.

Prioridade: alta para o MVP acadêmico.

Objetivo:

- Implementar envio e controle de documentos obrigatórios do TCC.

Problema atual:

- `tcc_timeline` controla etapa e prazo, mas não armazena documento.
- `/documentos` é placeholder.
- O aluno ainda não envia arquivo.
- O professor ainda não aprova/rejeita documento.

Escopo recomendado:

- Criar entidade `tcc_entrega` ou evoluir `tcc_timeline` com relação explícita para
  documentos.
- Criar entidade `tcc_documento`.
- Registrar arquivo, nome original, tipo, tamanho, status, data de envio e autor.
- Relacionar documento à etapa da timeline.
- Permitir upload pelo aluno.
- Permitir download/visualização pelo professor, coordenador e admin.
- Permitir professor aprovar, reprovar ou solicitar ajuste.
- Criar comentário/notificação quando documento for enviado ou avaliado.
- Refletir status do documento na timeline.

Endpoints sugeridos:

- `POST /tcc-pro/tcc/:uuidTcc/entregas/:uuidTimeline/documentos`
- `GET /tcc-pro/tcc/:uuidTcc/documentos`
- `GET /tcc-pro/documentos/:uuidDocumento/download`
- `POST /tcc-pro/documentos/:uuidDocumento/aprovar`
- `POST /tcc-pro/documentos/:uuidDocumento/solicitar-ajustes`
- `DELETE /tcc-pro/documentos/:uuidDocumento`

Telas sugeridas:

- Implementar `/documentos`.
- Adicionar bloco de documentos em `/tema`.
- Adicionar bloco de documentos em `/orientacoes`.

Critérios de aceite:

- Aluno consegue enviar documento para a etapa atual.
- Documento fica vinculado ao TCC e à etapa correta.
- Professor consegue ver e avaliar documento.
- Ajuste de documento gera comentário e notificação.
- Dashboard/cronograma refletem pendências reais.
- Não há dados mockados quando backend está ativo.

### ORIENT-009 - Modelar banca explicitamente

Status: pendente.

Prioridade: alta depois de ORIENT-008, ou antes se a banca for o foco do semestre.

Objetivo:

- Criar conceito formal de banca, separado de `agenda`.

Escopo recomendado:

- Criar tabela `banca`.
- Criar tabela `banca_participante`.
- Vincular banca a `tcc`.
- Diferenciar orientador, avaliador interno, avaliador externo e suplente.
- Controlar status da banca.
- Definir data, hora, local/modalidade e link.
- Validar conflitos de agenda por participante.
- Gerar notificações para participantes.

Telas sugeridas:

- Tela de formação de banca para coordenação.
- Bloco de banca em `/orientacoes`.
- Bloco de banca em `/tema`.
- Bloco de banca em `/apresentacao`.

### ORIENT-010 - Implementar avaliação final multiavaliador

Status: pendente.

Prioridade: alta depois de ORIENT-009.

Objetivo:

- Permitir que cada avaliador registre nota e parecer.

Escopo recomendado:

- Vincular avaliação ao participante da banca.
- Permitir salvar rascunho.
- Permitir publicar avaliação.
- Validar nota entre 0 e 10.
- Consolidar resultado final apenas quando todas as avaliações obrigatórias estiverem
  publicadas.
- Calcular média final conforme regra definida.

Telas sugeridas:

- Tela do professor avaliador para nota/parecer.
- Visão da coordenação para acompanhar avaliações pendentes.

### ORIENT-011 - Resultado do aluno

Status: pendente.

Prioridade: média/alta depois de ORIENT-010.

Objetivo:

- Permitir que o aluno veja resultado final publicado.

Escopo recomendado:

- Exibir nota final.
- Exibir pareceres publicados.
- Exibir situação final.
- Bloquear visualização antes da publicação.
- Gerar notificação quando resultado for publicado.

Telas sugeridas:

- Bloco de resultado em `/tema`.
- Bloco de resultado em `/tccs`.

### ORIENT-012 - Autorização real no backend

Status: pendente.

Prioridade: transversal.

Objetivo:

- Garantir que permissões não dependam apenas do frontend.

Problema atual:

- As rotas usam autenticação, mas não há policy por role em todas as ações.
- Usuário com token válido pode chamar endpoints se conhecer a URL.
- Algumas regras de escopo são aplicadas no frontend.

Escopo recomendado:

- Criar middleware/policy para roles.
- Aplicar roles por rota.
- Garantir que aluno só acesse seus próprios dados.
- Garantir que professor só acesse suas orientações.
- Garantir que coordenador/admin acessem visão global.
- Retornar 403 para escopo inválido.
- Adicionar testes de autorização.

Critérios de aceite:

- `/orientacoes` global só funciona para coordenador/admin.
- `/orientacoes/professor/:uuidProfessor` bloqueia professor diferente.
- `/orientacoes/aluno/:uuidAluno` bloqueia aluno diferente.
- Ações de professor não funcionam para aluno.
- Ações administrativas não funcionam para aluno/professor sem role.

### ORIENT-013 - Remover dependência de busca por e-mail

Status: pendente.

Prioridade: média, mas deve ser antecipado junto com ORIENT-012 se mexer em auth.

Objetivo:

- Fazer o token e `/auth/me` carregarem os vínculos necessários para escopo.

Escopo recomendado:

- Incluir `uuidProfessor` no usuário autenticado quando existir vínculo.
- Garantir `uuidAluno` para aluno.
- Atualizar `AuthUser` no frontend.
- Remover chamadas auxiliares que buscam professor/aluno por e-mail.
- Atualizar `/perfil`, `/orientacoes`, `/tccs`, `/cronograma` e dashboards.

### ORIENT-014 - Resolver fluxo pós-recusa da orientação/proposta

Status: implementado.

Prioridade: concluída antes de novas features grandes.

Objetivo:

- Permitir que o aluno siga o fluxo depois que o professor recusa uma solicitação de
  orientação/proposta de tema.

Problema atual:

- Professor recusa em `/orientacoes`.
- Backend grava `tema_tcc.status = recusado`.
- A tela `/tema` encontra essa orientação recusada em `getAlunoOrientations`.
- Como existe `currentOrientation`, a tela exibe o painel de acompanhamento em vez
  do formulário.
- `canReplyToProfessor` bloqueia resposta quando o status é `recusado`.
- Resultado: o aluno vê a recusa, mas não tem ação clara para tentar novamente.

Regra de negócio desejada:

- `recusado` encerra apenas a solicitação recusada.
- A solicitação recusada permanece visível no histórico.
- O aluno pode criar nova proposta quando não houver proposta/TCC ativo.
- Propostas com status `recusado` ou `orientacao_cancelada` não bloqueiam nova
  proposta.
- Propostas com status `aguardando aprovacao`, `solicitacao_pendente`,
  `orientacao_aprovada`, `tema_pendente`, `ajustes_solicitados`, `aprovado` ou TCC
  ativo continuam bloqueando nova proposta.
- TCC em acompanhamento não deve entrar no fluxo de recusa; deve usar cancelamento
  de orientação ou futura troca de orientador.

Escopo backend recomendado:

- Criar helper para identificar solicitação/TCC ativo por aluno.
- Atualizar `POST /tcc-pro/tema-tcc` para bloquear criação apenas quando houver
  proposta/TCC ativo.
- Permitir criação de novo `tema_tcc` quando as propostas anteriores estiverem
  `recusado` ou `orientacao_cancelada`.
- Alterar `rejectOrientation` para recusar somente `sourceType = tema`.
- Retornar erro 400/409 se tentarem recusar um `tcc` já existente.
- Manter comentários e notificações da recusa.
- Garantir que a listagem do aluno continue devolvendo histórico completo.

Escopo frontend recomendado:

- Em `/tema`, separar orientação ativa de histórico:
  - ativa: proposta/TCC que ainda pode avançar no fluxo;
  - histórica: `recusado`, `cancelado` ou `orientacao_cancelada`.
- Se só houver histórico recusado/cancelado, exibir o formulário de nova proposta.
- Mostrar um bloco de histórico com a última recusa, motivo/comentário e professor.
- Adicionar ação "Criar nova proposta" ou "Usar dados da proposta recusada".
- Se usar dados da proposta recusada, preencher título, área, linha e descrição como
  rascunho editável.
- Evitar mostrar `recusado` como acompanhamento atual bloqueante.
- Ajustar o painel "Status do envio" para diferenciar:
  - nenhuma proposta enviada;
  - proposta ativa;
  - última proposta recusada, com opção de nova tentativa.

Telas envolvidas:

- `/tema`
- `/orientacoes`
- `/mensagens`
- dashboard do aluno, se exibir status atual da solicitação.

Endpoints envolvidos:

- `GET /tcc-pro/orientacoes/aluno/:uuidAluno`
- `POST /tcc-pro/tema-tcc`
- `POST /tcc-pro/orientacoes/:id/recusar`
- `GET /tcc-pro/notificacoes/:uuidUsuario`

Critérios de aceite:

- Professor recusa uma proposta inicial em `/orientacoes`.
- Aluno acessa `/tema` e vê a recusa com motivo.
- Aluno consegue abrir/preencher uma nova proposta.
- Nova proposta cria outro registro em `tema_tcc`.
- Proposta recusada antiga permanece no histórico.
- Aluno não consegue criar nova proposta enquanto existir proposta/TCC ativo.
- Backend não permite recusar um TCC já em acompanhamento pelo endpoint de recusa.
- Comentário e notificação de recusa continuam sendo gerados.
- Testar com professor, aluno, coordenador e administrador.

Implementado:

- `TemaTccRepository` passou a verificar proposta/TCC ativo antes de criar novo tema.
- Propostas/TCCs `recusado`, `cancelado` ou `orientacao_cancelada` não bloqueiam
  nova proposta.
- `OrientacaoService.rejectOrientation` passou a rejeitar recusa de TCC já existente.
- `/tema` passou a usar a primeira orientação ativa como acompanhamento atual.
- `/tema` passou a exibir proposta recusada/cancelada como histórico.
- `/tema` libera o formulário quando só há histórico encerrado.
- `/tema` permite reaproveitar os dados da proposta encerrada como rascunho.

## Ordem Recomendada

1. **ORIENT-008** - Modelar entregas/documentos.
2. **ORIENT-009** - Modelar banca explicitamente.
3. **ORIENT-010** - Implementar avaliação final multiavaliador.
4. **ORIENT-011** - Resultado do aluno.
5. **ORIENT-012** - Autorização real no backend.
6. **ORIENT-013** - Remover dependência de busca por e-mail.

Observação:

- ORIENT-012 é transversal e pode ser antecipado a qualquer momento.
- Se a prioridade for apresentar valor acadêmico visível, começar por ORIENT-008.
- Se a prioridade for segurança, começar por ORIENT-012 e ORIENT-013.

## Checklist Para Próximas Implementações

Antes de implementar:

- Verificar se o backend está ativo e apontando para o banco correto.
- Confirmar que a tela não está usando mock com backend ativo.
- Confirmar roles necessárias no frontend.
- Confirmar se a rota precisa de autorização real no backend.
- Confirmar se a modelagem já existe ou se precisa de migration.

Durante a implementação:

- Manter `tema_tcc` como proposta antes da aprovação.
- Criar `tcc` somente quando o tema for aprovado.
- Usar `tcc_timeline` como fonte de etapas/prazos.
- Criar comentários em ações relevantes.
- Criar notificações quando houver destinatário.
- Manter coordenador/admin com visão global.
- Manter professor com visão filtrada.
- Manter aluno com visão própria.

Depois de implementar:

- Rodar typecheck/lint/test quando a alteração envolver código.
- Testar com os quatro usuários de desenvolvimento.
- Atualizar este plano.
- Marcar o item da fila como implementado ou parcial.
- Registrar limitações conhecidas.

## Dados de Teste Recomendados

| Perfil | Email | Senha |
|---|---|---|
| Administrador | `admin.teste@gestaotcc.local` | `Teste@12345` |
| Aluno | `aluno.teste@gestaotcc.local` | `Teste@12345` |
| Professor | `professor.teste@gestaotcc.local` | `Teste@12345` |
| Coordenador | `coordenador.teste@gestaotcc.local` | `Teste@12345` |

## Roteiro Manual de Validação do Fluxo Atual

1. Entrar como professor.
2. Acessar `/perfil`.
3. Cadastrar áreas e linhas de pesquisa.
4. Entrar como aluno.
5. Acessar `/tema`.
6. Registrar um tema com área/linha compatíveis.
7. Selecionar o professor recomendado.
8. Confirmar que o tema aparece em `tema_tcc`.
9. Confirmar que ainda não há registro em `tcc`.
10. Entrar como professor.
11. Acessar `/orientacoes`.
12. Aceitar a orientação.
13. Aprovar o tema com prazos.
14. Confirmar que agora existe registro em `tcc`.
15. Confirmar que existem etapas em `tcc_timeline`.
16. Entrar como aluno.
17. Acessar `/tema`.
18. Confirmar que o TCC e as etapas aparecem.
19. Entrar como professor.
20. Solicitar ajuste.
21. Entrar como aluno.
22. Responder o ajuste em `/tema`.
23. Entrar como professor.
24. Confirmar resposta do aluno em `/orientacoes`.
25. Entrar como coordenador.
26. Acessar `/orientacoes`.
27. Confirmar que a listagem aparece sem filtro de professor.
28. Entrar como administrador.
29. Acessar `/orientacoes`.
30. Confirmar que a listagem aparece sem filtro de professor.
31. Acessar `/mensagens` com aluno/professor.
32. Confirmar notificações geradas pelas ações do fluxo.

## Roteiro Manual de Validação do Pós-Recusa

1. Entrar como aluno.
2. Acessar `/tema`.
3. Registrar uma proposta e selecionar um professor.
4. Entrar como professor.
5. Acessar `/orientacoes`.
6. Recusar a proposta informando um motivo.
7. Entrar como aluno.
8. Acessar `/tema`.
9. Confirmar que a recusa e o motivo aparecem como histórico.
10. Confirmar que o formulário de nova proposta está disponível.
11. Criar nova proposta para o mesmo ou outro professor.
12. Confirmar que a proposta recusada antiga continua em `tema_tcc`.
13. Confirmar que a nova proposta criou outro registro em `tema_tcc`.
14. Confirmar que o professor indicado vê somente a nova proposta ativa para ação.
15. Tentar chamar a recusa para um `tcc` já em acompanhamento e confirmar erro de
    regra de negócio.

## Próximo Passo Recomendado

Implementar **ORIENT-008 - Modelar entregas/documentos**.

Justificativa:

- O fluxo pós-recusa já permite nova tentativa sem perder histórico.
- O fluxo aluno-professor já chega até acompanhamento e comentários reais.
- A próxima lacuna do MVP acadêmico é o envio de documentos obrigatórios.
- Sem documentos, `tcc_timeline` controla prazo, mas não controla a entrega real.
- `/documentos` ainda é placeholder e precisa virar tela funcional.

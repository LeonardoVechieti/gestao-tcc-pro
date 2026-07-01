const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Gestão TCC PRO API',
    version: '1.0.0',
    description: 'Documentação Swagger para a API de gestão de TCC',
  },
  servers: [
    {
      url: '/tcc-pro',
      description: 'Servidor local',
    },
  ],
  paths: {
    '/role': {
      post: {
        summary: 'Criar role',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: { '201': { description: 'Role criado' } },
      },
      get: {
        summary: 'Listar roles',
        responses: { '200': { description: 'Lista de roles' } },
      },
      put: {
        summary: 'Atualizar role',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: { '200': { description: 'Role atualizado' } },
      },
    },
    '/role/{uuid}': {
      get: {
        summary: 'Buscar role por uuid',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Role encontrado' } },
      },
      delete: {
        summary: 'Remover role',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Role removido' } },
      },
    },
    '/perfil': {
      post: {
        summary: 'Criar perfil',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'Perfil criado' } },
      },
      get: { summary: 'Listar perfis', responses: { '200': { description: 'Lista de perfis' } } },
      put: {
        summary: 'Atualizar perfil',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'Perfil atualizado' } },
      },
    },
    '/perfil/{uuid}': {
      get: {
        summary: 'Buscar perfil por uuid',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Perfil encontrado' } },
      },
      delete: {
        summary: 'Remover perfil',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Perfil removido' } },
      },
    },
    '/perfil/roles/{id}': {
      get: {
        summary: 'Buscar roles de um perfil',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Roles do perfil' } },
      },
    },
    '/perfil/roles': {
      post: {
        summary: 'Associar roles a um perfil',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'Roles associados' } },
      },
    },
    '/perfil/delete-roles': {
      post: {
        summary: 'Remover roles de um perfil',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'Roles removidos' } },
      },
    },
    '/aluno': {
      post: {
        summary: 'Criar aluno',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'Aluno criado' } },
      },
      get: { summary: 'Listar alunos', responses: { '200': { description: 'Lista de alunos' } } },
      put: {
        summary: 'Atualizar aluno',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'Aluno atualizado' } },
      },
    },
    '/aluno/{uuid}': {
      get: {
        summary: 'Buscar aluno por uuid',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Aluno encontrado' } },
      },
      delete: {
        summary: 'Remover aluno',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Aluno removido' } },
      },
    },
    '/professor': {
      post: {
        summary: 'Criar professor',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'Professor criado' } },
      },
      get: {
        summary: 'Listar professores',
        responses: { '200': { description: 'Lista de professores' } },
      },
      put: {
        summary: 'Atualizar professor',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'Professor atualizado' } },
      },
    },
    '/professor/{uuid}': {
      get: {
        summary: 'Buscar professor por uuid',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Professor encontrado' } },
      },
      delete: {
        summary: 'Remover professor',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Professor removido' } },
      },
    },
    '/tema-tcc': {
      post: {
        summary: 'Criar tema de TCC',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'Tema criado' } },
      },
      get: {
        summary: 'Listar temas de TCC',
        responses: { '200': { description: 'Lista de temas' } },
      },
      put: {
        summary: 'Atualizar tema de TCC',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'Tema atualizado' } },
      },
    },
    '/tema-tcc/{uuid}': {
      get: {
        summary: 'Buscar tema de TCC por uuid',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Tema encontrado' } },
      },
      delete: {
        summary: 'Remover tema de TCC',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Tema removido' } },
      },
    },
    '/tcc': {
      post: {
        summary: 'Criar TCC',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'TCC criado' } },
      },
      get: { summary: 'Listar TCCs', responses: { '200': { description: 'Lista de TCCs' } } },
      put: {
        summary: 'Atualizar TCC',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'TCC atualizado' } },
      },
    },
    '/tcc/{uuid}': {
      get: {
        summary: 'Buscar TCC por uuid',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'TCC encontrado' } },
      },
      delete: {
        summary: 'Remover TCC',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'TCC removido' } },
      },
    },
    '/agenda': {
      post: {
        summary: 'Criar agenda',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '201': { description: 'Agenda criada' } },
      },
      get: { summary: 'Listar agendas', responses: { '200': { description: 'Lista de agendas' } } },
      put: {
        summary: 'Atualizar agenda',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { '200': { description: 'Agenda atualizada' } },
      },
    },
    '/agenda/{uuid}': {
      get: {
        summary: 'Buscar agenda por uuid',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Agenda encontrada' } },
      },
      delete: {
        summary: 'Remover agenda',
        parameters: [{ name: 'uuid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Agenda removida' } },
      },
    },
    '/dash-alunos/{uuidAluno}': {
      get: {
        summary: 'Dashboard do aluno',
        parameters: [{ name: 'uuidAluno', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Dados do dashboard do aluno' } },
      },
    },
    '/dash-cordenacao/{uuidProfessor}': {
      get: {
        summary: 'Dashboard da coordenação',
        parameters: [
          { name: 'uuidProfessor', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Dados do dashboard da coordenação' } },
      },
    },
    '/dash-professor/{uuidProfessor}': {
      get: {
        summary: 'Dashboard do professor',
        parameters: [
          { name: 'uuidProfessor', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Dados do dashboard do professor' } },
      },
    },
    '/notificacoes/{uuidUsuario}': {
      get: {
        summary: 'Buscar últimas notificações de um usuário',
        parameters: [
          { name: 'uuidUsuario', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Lista de notificações retornada' } },
      },
    },
  },
}

export default swaggerDocument

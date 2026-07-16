const ROUTE_MAP = [
  { method: 'GET', path: '/tcc-pro/swagger', description: 'Swagger UI' },
  { method: 'GET', path: '/tcc-pro/swagger.json', description: 'Swagger OpenAPI document' },
  { method: 'GET', path: '/tcc-pro/swagger-ui/:file', description: 'Swagger UI static assets' },
  { method: 'POST', path: '/tcc-pro/role', description: 'Criar um role' },
  { method: 'GET', path: '/tcc-pro/role', description: 'Listar roles' },
  { method: 'GET', path: '/tcc-pro/role/:id', description: 'Buscar role por id' },
  { method: 'PUT', path: '/tcc-pro/role', description: 'Atualizar um role' },
  { method: 'DELETE', path: '/tcc-pro/role/:id', description: 'Remover um role' },
  { method: 'POST', path: '/tcc-pro/perfil', description: 'Criar um perfil' },
  { method: 'GET', path: '/tcc-pro/perfil', description: 'Listar perfis' },
  { method: 'GET', path: '/tcc-pro/perfil/:id', description: 'Buscar perfil por id' },
  { method: 'PUT', path: '/tcc-pro/perfil', description: 'Atualizar perfil' },
  { method: 'DELETE', path: '/tcc-pro/perfil/:id', description: 'Remover perfil' },
  { method: 'GET', path: '/tcc-pro/perfil/roles/:id', description: 'Buscar roles de um perfil' },
  { method: 'POST', path: '/tcc-pro/perfil/roles', description: 'Associar roles a um perfil' },
  {
    method: 'POST',
    path: '/tcc-pro/perfil/delete-roles',
    description: 'Remover associação de roles de perfil',
  },
  { method: 'GET', path: '/tcc-pro/usuario', description: 'Listar usuários' },
  { method: 'GET', path: '/tcc-pro/usuario/:id', description: 'Buscar usuário por id' },
  { method: 'PUT', path: '/tcc-pro/usuario', description: 'Atualizar dados cadastrais do usuário' },
  { method: 'POST', path: '/tcc-pro/aluno', description: 'Criar aluno' },
  { method: 'GET', path: '/tcc-pro/aluno', description: 'Listar alunos' },
  { method: 'GET', path: '/tcc-pro/aluno/:id', description: 'Buscar aluno por id' },
  { method: 'PUT', path: '/tcc-pro/aluno', description: 'Atualizar aluno' },
  { method: 'DELETE', path: '/tcc-pro/aluno/:id', description: 'Remover aluno' },
  { method: 'POST', path: '/tcc-pro/professor', description: 'Criar professor' },
  { method: 'GET', path: '/tcc-pro/professor', description: 'Listar professores' },
  { method: 'GET', path: '/tcc-pro/professor/:id', description: 'Buscar professor por id' },
  { method: 'PUT', path: '/tcc-pro/professor', description: 'Atualizar professor' },
  { method: 'DELETE', path: '/tcc-pro/professor/:id', description: 'Remover professor' },
  { method: 'POST', path: '/tcc-pro/tema-tcc', description: 'Criar tema de TCC' },
  { method: 'GET', path: '/tcc-pro/tema-tcc', description: 'Listar temas de TCC' },
  { method: 'GET', path: '/tcc-pro/tema-tcc/:id', description: 'Buscar tema de TCC por id' },
  { method: 'PUT', path: '/tcc-pro/tema-tcc', description: 'Atualizar tema de TCC' },
  { method: 'DELETE', path: '/tcc-pro/tema-tcc/:id', description: 'Remover tema de TCC' },
  { method: 'POST', path: '/tcc-pro/tcc', description: 'Criar TCC' },
  { method: 'GET', path: '/tcc-pro/tcc', description: 'Listar TCCs' },
  { method: 'GET', path: '/tcc-pro/tcc/:id', description: 'Buscar TCC por id' },
  { method: 'PUT', path: '/tcc-pro/tcc', description: 'Atualizar TCC' },
  { method: 'DELETE', path: '/tcc-pro/tcc/:id', description: 'Remover TCC' },
  {
    method: 'GET',
    path: '/tcc-pro/orientacoes',
    description: 'Listar orientações sem filtro de professor',
  },
  {
    method: 'GET',
    path: '/tcc-pro/orientacoes/professor/:uuidProfessor',
    description: 'Listar orientações de um professor',
  },
  {
    method: 'GET',
    path: '/tcc-pro/orientacoes/aluno/:uuidAluno',
    description: 'Listar orientações de um aluno',
  },
  { method: 'POST', path: '/tcc-pro/agenda', description: 'Criar agenda' },
  { method: 'GET', path: '/tcc-pro/agenda', description: 'Listar agendas' },
  { method: 'GET', path: '/tcc-pro/agenda/:id', description: 'Buscar agenda por id' },
  { method: 'PUT', path: '/tcc-pro/agenda', description: 'Atualizar agenda' },
  { method: 'DELETE', path: '/tcc-pro/agenda/:id', description: 'Remover agenda' },
  { method: 'GET', path: '/tcc-pro/dash-alunos/:uuidAluno', description: 'Dashboard do aluno' },
  {
    method: 'GET',
    path: '/tcc-pro/dash-cordenacao/:uuidProfessor',
    description: 'Dashboard da coordenação',
  },
  {
    method: 'GET',
    path: '/tcc-pro/dash-professor/:uuidProfessor',
    description: 'Dashboard do professor',
  },
  {
    method: 'GET',
    path: '/tcc-pro/notificacoes/:uuidUsuario',
    description: 'Últimas notificações por usuário',
  },
  {
    method: 'PUT',
    path: '/tcc-pro/notificacoes/:uuidNotificacao/status',
    description: 'Atualizar status de uma notificação',
  },
]

export function logRouteMap() {
  console.log('\n=== Swagger e API Endpoints ===')
  console.log('Swagger UI: http://127.0.0.1:3003/tcc-pro/swagger')
  console.log('OpenAPI JSON: http://127.0.0.1:3003/tcc-pro/swagger.json')
  console.log('\nLista de endpoints:')
  ROUTE_MAP.forEach((route) => {
    console.log(`  ${route.method.padEnd(6)} ${route.path} - ${route.description}`)
  })
  console.log('==============================\n')
}

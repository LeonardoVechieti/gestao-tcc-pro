import router from '@adonisjs/core/services/router'
const DashAlunosController = () => import('#controllers/dash_alunos_controller')
const DashCordenacaoController = () => import('#controllers/dash_cordenacao_controller')
const DashProfessorController = () => import('#controllers/dash_professor_controller')

router
  .group(() => {
    router.get('/dash-alunos/:uuidAluno', [DashAlunosController, 'show'])
    router.get('/dash-cordenacao/:uuidProfessor', [DashCordenacaoController, 'show'])
    router.get('/dash-professor/:uuidProfessor', [DashProfessorController, 'show'])
  })
  .prefix('tcc-pro')

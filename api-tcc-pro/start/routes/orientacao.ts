import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const OrientacaoController = () => import('#controllers/orientacao_controller')

router
  .group(() => {
    router.get('/orientacoes', [OrientacaoController, 'index']).middleware(middleware.auth())
    router
      .get('/orientacoes/professor/:uuidProfessor', [OrientacaoController, 'byProfessor'])
      .middleware(middleware.auth())
    router
      .get('/orientacoes/aluno/:uuidAluno', [OrientacaoController, 'byAluno'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/aprovar-orientacao', [OrientacaoController, 'approveOrientation'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/recusar', [OrientacaoController, 'rejectOrientation'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/aprovar-tema', [OrientacaoController, 'approveTheme'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/solicitar-ajustes', [OrientacaoController, 'requestAdjustments'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/comentarios', [OrientacaoController, 'addComment'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/comentarios-aluno', [OrientacaoController, 'addStudentComment'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/operacoes', [OrientacaoController, 'performOperation'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/etapas/:uuidTimeline/concluir', [OrientacaoController, 'completeStage'])
      .middleware(middleware.auth())
    router
      .post('/orientacoes/:id/aprovar-tema-com-prazos', [
        OrientacaoController,
        'approveThemeWithDeadlines',
      ])
      .middleware(middleware.auth())
    router
      .put('/orientacoes/:uuidTcc/prazos', [OrientacaoController, 'updateStageDeadlines'])
      .middleware(middleware.auth())
  })
  .prefix('tcc-pro')

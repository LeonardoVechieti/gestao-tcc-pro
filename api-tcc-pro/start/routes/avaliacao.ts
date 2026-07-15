import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AvaliacaoController = () => import('#controllers/avaliacao_controller')

router
  .group(() => {
    router.post('/avaliacao', [AvaliacaoController, 'store']).middleware(middleware.auth())
    router.get('/avaliacao', [AvaliacaoController, 'index']).middleware(middleware.auth())
    router.get('/avaliacao/:id', [AvaliacaoController, 'show']).middleware(middleware.auth())
    router.put('/avaliacao', [AvaliacaoController, 'update']).middleware(middleware.auth())
    router.delete('/avaliacao/:id', [AvaliacaoController, 'delete']).middleware(middleware.auth())
    router
      .post('/avaliacao/:id/publicar', [AvaliacaoController, 'publish'])
      .middleware(middleware.auth())
    router
      .get('/avaliacao/tcc/:uuidTcc', [AvaliacaoController, 'findByTccAndProfessor'])
      .middleware(middleware.auth())
  })
  .prefix('tcc-pro')

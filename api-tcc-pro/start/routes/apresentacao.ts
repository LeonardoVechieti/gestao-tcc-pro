import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const ApresentacaoController = () => import('#controllers/apresentacao_controller')

router
  .group(() => {
    router.post('/apresentacoes', [ApresentacaoController, 'store'])
    router.get('/apresentacoes', [ApresentacaoController, 'index'])
  })
  .prefix('tcc-pro')
  .middleware(middleware.auth())

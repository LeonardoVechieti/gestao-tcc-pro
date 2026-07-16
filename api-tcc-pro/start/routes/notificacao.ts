import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const NotificacaoController = () => import('#controllers/notificacao_controller')

router
  .group(() => {
    router
      .get('/notificacoes/:uuidUsuario', [NotificacaoController, 'index'])
      .middleware(middleware.auth())
    router
      .put('/notificacoes/:uuidNotificacao/status', [NotificacaoController, 'updateStatus'])
      .middleware(middleware.auth())
  })
  .prefix('tcc-pro')

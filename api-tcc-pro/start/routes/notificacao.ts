import router from '@adonisjs/core/services/router'
const NotificacaoController = () => import('#controllers/notificacao_controller')

router
  .group(() => {
    router.get('/notificacoes/:uuidUsuario', [NotificacaoController, 'index'])
  })
  .prefix('tcc-pro')

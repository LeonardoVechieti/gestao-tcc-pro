import router from '@adonisjs/core/services/router'

const UsuarioController = () => import('#controllers/usuario_controller')

router
  .group(() => {
    router.get('/usuario', [UsuarioController, 'index'])
    router.get('/usuario/:id', [UsuarioController, 'show'])
  })
  .prefix('tcc-pro')

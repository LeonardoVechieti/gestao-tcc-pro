import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsuarioController = () => import('#controllers/usuario_controller')

router
  .group(() => {
    router.get('/usuario', [UsuarioController, 'index']).middleware(middleware.auth())
    router.get('/usuario/:id', [UsuarioController, 'show']).middleware(middleware.auth())
    router.put('/usuario', [UsuarioController, 'update']).middleware(middleware.auth())
  })
  .prefix('tcc-pro')

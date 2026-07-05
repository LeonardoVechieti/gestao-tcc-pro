import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.post('/auth/register', [AuthController, 'register'])
    router.post('/auth/login', [AuthController, 'login'])
    router.post('/auth/google', [AuthController, 'loginWithGoogle'])
    router.get('/auth/me', [AuthController, 'me']).middleware(['auth' as any])
  })
  .prefix('tcc-pro')

import router from '@adonisjs/core/services/router'
const RoleController = () => import('#controllers/role_controller')

router
  .group(() => {
    router.post('/role', [RoleController, 'store'])
    router.get('/role', [RoleController, 'index'])
    router.get('/role/:id', [RoleController, 'show'])
    router.put('/role', [RoleController, 'update'])
    router.delete('/role/:id', [RoleController, 'delete'])
  })
  .prefix('tcc-pro')

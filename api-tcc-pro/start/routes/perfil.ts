import router from '@adonisjs/core/services/router'
const PerfilController = () => import('#controllers/perfil_controller')

router
  .group(() => {
    router.post('/perfil', [PerfilController, 'store'])
    router.get('/perfil', [PerfilController, 'index'])
    router.get('/perfil/:id', [PerfilController, 'show'])
    router.put('/perfil', [PerfilController, 'update'])
    router.delete('/perfil/:id', [PerfilController, 'delete'])
    router.get('/perfil/roles/:id', [PerfilController, 'getPerfilRoles'])
    router.post('/perfil/roles', [PerfilController, 'createPerfilRoles'])
    router.post('/perfil/delete-roles', [PerfilController, 'deletePerfilRoles'])
  })
  .prefix('tcc-pro')

import router from '@adonisjs/core/services/router'
const TccController = () => import('#controllers/tcc_controller')

router
  .group(() => {
    router.post('/tcc', [TccController, 'store'])
    router.get('/tcc', [TccController, 'index'])
    router.get('/tcc/:id', [TccController, 'show'])
    router.put('/tcc', [TccController, 'update'])
    router.delete('/tcc/:id', [TccController, 'delete'])
  })
  .prefix('tcc-pro')

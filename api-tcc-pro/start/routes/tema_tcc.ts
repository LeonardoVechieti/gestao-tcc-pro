import router from '@adonisjs/core/services/router'
const TemaTccController = () => import('#controllers/tema_tcc_controller')

router
  .group(() => {
    router.post('/tema-tcc', [TemaTccController, 'store'])
    router.get('/tema-tcc', [TemaTccController, 'index'])
    router.get('/tema-tcc/me', [TemaTccController, 'me']).middleware(['auth' as any])
    router.get('/tema-tcc/:id', [TemaTccController, 'show'])
    router.put('/tema-tcc', [TemaTccController, 'update'])
    router.delete('/tema-tcc/:id', [TemaTccController, 'delete'])
  })
  .prefix('tcc-pro')

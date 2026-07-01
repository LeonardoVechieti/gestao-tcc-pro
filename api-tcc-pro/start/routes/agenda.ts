import router from '@adonisjs/core/services/router'
const AgendaController = () => import('#controllers/agenda_controller')

router
  .group(() => {
    router.post('/agenda', [AgendaController, 'store'])
    router.get('/agenda', [AgendaController, 'index'])
    router.get('/agenda/:id', [AgendaController, 'show'])
    router.put('/agenda', [AgendaController, 'update'])
    router.delete('/agenda/:id', [AgendaController, 'delete'])
  })
  .prefix('tcc-pro')

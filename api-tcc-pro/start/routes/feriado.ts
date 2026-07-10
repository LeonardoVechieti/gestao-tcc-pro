import router from '@adonisjs/core/services/router'
const FeriadoController = () => import('#controllers/feriado_controller')

router
  .group(() => {
    router.get('/feriados/:ano', [FeriadoController, 'index'])
  })
  .prefix('tcc-pro')

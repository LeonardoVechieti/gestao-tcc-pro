import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const TccDocumentoController = () => import('#controllers/tcc_documento_controller')

router
  .group(() => {
    router
      .post('/tccs/:uuidTcc/documentos', [TccDocumentoController, 'store'])
      .middleware(middleware.auth())
    router
      .get('/tccs/:uuidTcc/documentos', [TccDocumentoController, 'index'])
      .middleware(middleware.auth())
  })
  .prefix('tcc-pro')

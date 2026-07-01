import router from '@adonisjs/core/services/router'
const AlunoController = () => import('#controllers/aluno_controller')

router
  .group(() => {
    router.post('/aluno', [AlunoController, 'store'])
    router.get('/aluno', [AlunoController, 'index'])
    router.get('/aluno/:id', [AlunoController, 'show'])
    router.put('/aluno', [AlunoController, 'update'])
    router.delete('/aluno/:id', [AlunoController, 'delete'])
  })
  .prefix('tcc-pro')

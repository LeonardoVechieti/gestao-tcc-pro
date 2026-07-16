import router from '@adonisjs/core/services/router'
const ProfessorController = () => import('#controllers/professor_controller')

router
  .group(() => {
    router.post('/professor', [ProfessorController, 'store'])
    router.get('/professor', [ProfessorController, 'index'])
    router.get('/professor/research-options', [ProfessorController, 'researchOptions'])
    router.get('/professor/:id', [ProfessorController, 'show'])
    router.put('/professor', [ProfessorController, 'update'])
    router.delete('/professor/:id', [ProfessorController, 'delete'])
  })
  .prefix('tcc-pro')

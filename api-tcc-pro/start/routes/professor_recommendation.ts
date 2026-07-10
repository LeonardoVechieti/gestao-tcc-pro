import router from '@adonisjs/core/services/router'
const ProfessorRecommendationController = () => import('#controllers/professor_recommendation_controller')

router
  .group(() => {
    router.get('/professor/recommendations', [ProfessorRecommendationController, 'recommend'])
  })
  .prefix('tcc-pro')

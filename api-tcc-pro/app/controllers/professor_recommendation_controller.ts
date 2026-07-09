import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ProfessorRepository from '../repositories/professor_repository.js'
import { ProfessorRecommendationValidator } from '#validators/professor/professor_recommendation_validator'

@inject()
export default class ProfessorRecommendationController {
  constructor(private professorRepository: ProfessorRepository) {}

  async recommend({ request }: HttpContext) {
    const payload = await ProfessorRecommendationValidator.validate(request.all())

    try {
      return await this.professorRepository.index(payload)
    } catch (error) {
      console.error('Professor recommendation failed:', error)

      if (
        error instanceof Error &&
        (error.message.includes('areas_interesse') || error.message.includes('linhas_pesquisa'))
      ) {
        return []
      }

      throw error
    }
  }
}

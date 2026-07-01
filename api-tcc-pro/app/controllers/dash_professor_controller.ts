import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DashProfessorService from '#services/dash_professor_service'

@inject()
export default class DashProfessorController {
  constructor(private dashService: DashProfessorService) {}

  async show({ params }: HttpContext) {
    return this.dashService.getProfessorDashboard(params.uuidProfessor)
  }
}

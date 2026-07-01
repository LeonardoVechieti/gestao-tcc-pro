import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DashAlunosService from '#services/dash_alunos_service'

@inject()
export default class DashAlunosController {
  constructor(private dashService: DashAlunosService) {}

  async show({ params }: HttpContext) {
    return this.dashService.getAlunoDashboard(params.uuidAluno)
  }
}

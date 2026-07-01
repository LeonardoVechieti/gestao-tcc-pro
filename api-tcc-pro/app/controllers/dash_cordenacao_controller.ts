import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DashCordenacaoService from '#services/dash_cordenacao_service'

@inject()
export default class DashCordenacaoController {
  constructor(private dashService: DashCordenacaoService) {}

  async show({ params }: HttpContext) {
    return this.dashService.getCordenacaoDashboard(params.uuidProfessor)
  }
}

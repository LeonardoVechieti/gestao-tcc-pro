import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import OrientacaoService from '#services/orientacao_service'

@inject()
export default class OrientacaoController {
  constructor(private orientacaoService: OrientacaoService) {}

  async index() {
    return this.orientacaoService.listAll()
  }

  async byProfessor({ params }: HttpContext) {
    return this.orientacaoService.listByProfessor(params.uuidProfessor)
  }

  async byAluno({ params }: HttpContext) {
    return this.orientacaoService.listByAluno(params.uuidAluno)
  }

  async approveOrientation({ params, request }: HttpContext) {
    return this.orientacaoService.approveOrientation(
      params.id,
      request.only(['sourceType', 'autorNome'])
    )
  }

  async rejectOrientation({ params, request }: HttpContext) {
    return this.orientacaoService.rejectOrientation(
      params.id,
      request.only(['sourceType', 'mensagem', 'autorNome'])
    )
  }

  async approveTheme({ params, request }: HttpContext) {
    return this.orientacaoService.approveTheme(params.id, request.only(['sourceType', 'autorNome']))
  }

  async requestAdjustments({ params, request }: HttpContext) {
    return this.orientacaoService.requestAdjustments(
      params.id,
      request.only(['sourceType', 'mensagem', 'autorNome', 'adjustmentType'])
    )
  }

  async addComment({ params, request }: HttpContext) {
    return this.orientacaoService.addComment(
      params.id,
      request.only(['sourceType', 'mensagem', 'autorNome'])
    )
  }

  async addStudentComment({ params, request }: HttpContext) {
    return this.orientacaoService.addStudentComment(
      params.id,
      request.only(['sourceType', 'mensagem', 'autorNome', 'tema'])
    )
  }

  async completeStage({ params, request }: HttpContext) {
    const nota = request.input('nota') as number | undefined
    return this.orientacaoService.completeStage(params.uuidTimeline, nota)
  }

  async approveThemeWithDeadlines({ params, request }: HttpContext) {
    return this.orientacaoService.approveThemeWithDeadlines(
      params.id,
      request.only(['sourceType', 'autorNome', 'prazos'])
    )
  }

  async updateStageDeadlines({ params, request }: HttpContext) {
    const prazos = request.input('prazos') as Record<string, string>
    return this.orientacaoService.updateStageDeadlines(params.uuidTcc, prazos)
  }

  async performOperation({ params, request }: HttpContext) {
    return this.orientacaoService.performOperation(
      params.id,
      request.only(['sourceType', 'mensagem', 'autorNome', 'operation'])
    )
  }
}

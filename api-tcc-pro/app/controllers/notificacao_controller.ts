import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import NotificacaoService from '#services/notificacao_service'

@inject()
export default class NotificacaoController {
  constructor(private notificacaoService: NotificacaoService) {}

  async index({ params }: HttpContext) {
    return this.notificacaoService.listByUsuario(params.uuidUsuario)
  }
}

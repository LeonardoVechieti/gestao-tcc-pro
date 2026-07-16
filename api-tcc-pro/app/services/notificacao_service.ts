import TccNotificacao from '#models/DAO/tcc_notificacao'
import GenericResponseException from '#exceptions/generic_response_exception'

export default class NotificacaoService {
  async listByUsuario(uuidUsuario: string) {
    return await TccNotificacao.query()
      .where('uuid_usuario', uuidUsuario)
      .orderBy('created_at', 'desc')
      .limit(50)
  }

  async updateStatus(uuidNotificacao: string, status = 'concluida') {
    const allowedStatuses = ['pendente', 'lida', 'concluida']

    if (!allowedStatuses.includes(status)) {
      throw new GenericResponseException('Status de notificação inválido', 400)
    }

    const notificacao = await TccNotificacao.findOrFail(uuidNotificacao)
    notificacao.status = status
    return notificacao.save()
  }
}

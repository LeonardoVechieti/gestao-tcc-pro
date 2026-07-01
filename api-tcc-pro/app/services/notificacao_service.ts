import TccNotificacao from '#models/DAO/tcc_notificacao'

export default class NotificacaoService {
  async listByUsuario(uuidUsuario: string) {
    return await TccNotificacao.query()
      .where('uuid_usuario', uuidUsuario)
      .orderBy('created_at', 'desc')
      .limit(10)
  }
}

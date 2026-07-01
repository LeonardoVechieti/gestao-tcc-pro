import Tcc from '#models/DAO/tcc'
import { DashAlunoResponse } from '#interfaces/dash_aluno'
import { getDashboardIcon, toDateString } from '#helpers/dashboard_helpers'

export default class DashAlunosService {
  async getAlunoDashboard(uuidAluno: string): Promise<DashAlunoResponse> {
    const tcc = await Tcc.query()
      .where('uuid_aluno', uuidAluno)
      .preload('temaTcc')
      .preload('agendas', (query) => {
        query.whereNotNull('data').orderBy('data', 'desc').limit(1)
      })
      .orderBy('created_at', 'desc')
      .first()

    const tema = tcc?.temaTcc
    const agenda = tcc?.agendas?.[0]

    return {
      temaAtual: {
        exibir: Boolean(tema?.titulo),
        temaAtual: tema?.titulo,
        uuidTema: tema?.uuidTemaTcc,
        icone: tema ? getDashboardIcon(tema.area) : undefined,
      },
      statusTcc: {
        exibir: Boolean(tcc?.status),
        statusTcc: tcc?.status,
        uuidTcc: tcc?.uuidTcc,
      },
      proximaEntrega: {
        exibir: Boolean(tcc?.proximaEntrega),
        data: toDateString(tcc?.proximaEntrega),
      },
      apresentacao: {
        exibir: Boolean(agenda?.data),
        data: toDateString(agenda?.data),
      },
    }
  }
}

import Tcc from '#models/DAO/tcc'
import { DashAlunoResponse } from '#interfaces/dash_aluno'
import { getDashboardIcon, toDateString } from '#helpers/dashboard_helpers'
import TccTimeline from '#models/DAO/tcc_timeline'

const requiredStages = [
  'Tema aprovado',
  'Projeto de TCC',
  'Entrega parcial',
  'Versão final',
  'Banca',
]

const stageOrderByTitle = new Map(requiredStages.map((title, index) => [title, index]))

function normalizeStageTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getStageOrder(title: string): number {
  const exactOrder = stageOrderByTitle.get(title)
  if (exactOrder !== undefined) {
    return exactOrder
  }

  const normalizedTitle = normalizeStageTitle(title)
  const fuzzyOrder = requiredStages.findIndex((stageTitle) =>
    normalizedTitle.includes(normalizeStageTitle(stageTitle))
  )

  return fuzzyOrder >= 0 ? fuzzyOrder : requiredStages.length
}

function isTimelineComplete(status: string): boolean {
  return status === 'concluida' || status === 'concluido'
}

function getNextDelivery(timelines?: TccTimeline[]): string | undefined {
  const nextStage = [...(timelines ?? [])]
    .sort((current, next) => getStageOrder(current.titulo) - getStageOrder(next.titulo))
    .find((stage) => !isTimelineComplete(stage.status))

  return toDateString(nextStage?.dataEntrega)
}

export default class DashAlunosService {
  async getAlunoDashboard(uuidAluno: string): Promise<DashAlunoResponse> {
    const tcc = await Tcc.query()
      .where('uuid_aluno', uuidAluno)
      .preload('temaTcc')
      .preload('timelines', (query) => {
        query.orderBy('created_at', 'asc')
      })
      .preload('agendas', (query) => {
        query.whereNotNull('data').orderBy('data', 'desc').limit(1)
      })
      .orderBy('created_at', 'desc')
      .first()

    const tema = tcc?.temaTcc
    const agenda = tcc?.agendas?.[0]
    const proximaEntrega = getNextDelivery(tcc?.timelines)

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
        exibir: Boolean(proximaEntrega),
        data: proximaEntrega,
      },
      apresentacao: {
        exibir: Boolean(agenda?.data),
        data: toDateString(agenda?.data),
      },
    }
  }
}

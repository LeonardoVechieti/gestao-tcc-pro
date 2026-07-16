import Tcc from '#models/DAO/tcc'
import TemaTcc from '#models/DAO/tema_tcc'
import Professor from '#models/DAO/professor'
import { DashAlunoResponse, DashAlunoTimelineItem } from '#interfaces/dash_aluno'
import { getDashboardIcon, toDateString } from '#helpers/dashboard_helpers'
import TccTimeline from '#models/DAO/tcc_timeline'
import TccNotificacao from '#models/DAO/tcc_notificacao'
import Usuario from '#models/DAO/usuario'

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
  const nextStage = getSortedTimeline(timelines).find((stage) => !isTimelineComplete(stage.status))

  return toDateString(nextStage?.dataEntrega)
}

function getSortedTimeline(timelines?: TccTimeline[]): TccTimeline[] {
  return [...(timelines ?? [])].sort(
    (current, next) => getStageOrder(current.titulo) - getStageOrder(next.titulo)
  )
}

function buildTimelineItems(timelines?: TccTimeline[]): DashAlunoTimelineItem[] {
  return getSortedTimeline(timelines).map((stage) => ({
    titulo: stage.titulo,
    data: toDateString(stage.dataEntrega),
    status: stage.status,
  }))
}

function buildNotificationTitle(tipo: string): string {
  const titles: Record<string, string> = {
    ajuste_tema: 'Ajustes solicitados no tema',
    ajuste_trabalho: 'Ajustes solicitados no trabalho',
    aprovacao: 'Tema aprovado',
    cancelar_orientacao: 'Orientação cancelada',
    comentario: 'Comentário registrado',
    etapa_concluida: 'Etapa concluída',
    orientacao_aprovada: 'Orientação aceita',
    recusa: 'Solicitação recusada',
    resposta_aluno: 'Resposta enviada',
  }

  return titles[tipo] ?? 'Atualização da orientação'
}

export default class DashAlunosService {
  async getAlunoDashboard(uuidAluno: string): Promise<DashAlunoResponse> {
    const tcc = await Tcc.query()
      .where('uuid_aluno', uuidAluno)
      .preload('temaTcc', (query) => {
        query.preload('professor')
      })
      .preload('timelines', (query) => {
        query.orderBy('created_at', 'asc')
      })
      .preload('agendas', (query) => {
        query.whereNotNull('data').orderBy('data', 'desc').limit(1)
      })
      .orderBy('created_at', 'desc')
      .first()
    const tema =
      tcc?.temaTcc ??
      (await TemaTcc.query()
        .where('uuid_aluno', uuidAluno)
        .preload('professor')
        .orderBy('created_at', 'desc')
        .first())

    const agenda = tcc?.agendas?.[0]
    const proximaEntrega = getNextDelivery(tcc?.timelines)
    const professorId = tcc?.uuidOrientador ?? tema?.uuidProfessor
    const professor = professorId ? await Professor.find(professorId) : null
    const orientador = professor?.nome ?? tema?.professor?.nome
    const statusAtual = tcc?.status ?? tema?.status
    const ultimaAtualizacao = toDateString(tcc?.updatedAt ?? tema?.updatedAt ?? tema?.createdAt)
    const usuario = await Usuario.query().where('uuid_aluno', uuidAluno).first()
    const notificacoes = await this.getNotifications(tcc, tema, usuario?.uuidUsuario)
    const notificationAlerts = notificacoes.map((notificacao) => ({
      tipo: notificacao.tipo,
      titulo: buildNotificationTitle(notificacao.tipo),
      descricao: notificacao.descricao,
      status: notificacao.status,
      linkAcao: notificacao.linkAcao,
    }))

    return {
      temaAtual: {
        exibir: Boolean(tema?.titulo),
        temaAtual: tema?.titulo,
        uuidTema: tema?.uuidTemaTcc,
        areaInteresse: tema?.area,
        orientador,
        ultimaAtualizacao,
        statusAtual,
        icone: tema ? getDashboardIcon(tema.area) : undefined,
      },
      statusTcc: {
        exibir: Boolean(statusAtual),
        statusTcc: statusAtual,
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
      timelineItems: buildTimelineItems(tcc?.timelines),
      avisos: notificationAlerts,
    }
  }

  private async getNotifications(tcc?: Tcc | null, tema?: TemaTcc | null, uuidUsuario?: string) {
    if (!tcc && !tema) {
      return []
    }

    const query = TccNotificacao.query().orderBy('created_at', 'desc').limit(10)

    query.where((builder) => {
      if (tcc?.uuidTcc) {
        builder.where('uuid_tcc', tcc.uuidTcc)
      }

      if (tema?.uuidTemaTcc) {
        if (tcc?.uuidTcc) {
          builder.orWhere('uuid_tema_tcc', tema.uuidTemaTcc)
        } else {
          builder.where('uuid_tema_tcc', tema.uuidTemaTcc)
        }
      }
    })

    if (uuidUsuario) {
      query.where((builder) => {
        builder.where('uuid_usuario', uuidUsuario).orWhereNull('uuid_usuario')
      })
    }

    return query
  }
}

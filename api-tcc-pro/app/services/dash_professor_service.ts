import { DateTime } from 'luxon'
import Tcc from '#models/DAO/tcc'
import { toDateString } from '#helpers/dashboard_helpers'
import type {
  DashProfessorAvaliacao,
  DashProfessorAvaliacaoStatus,
  DashProfessorAviso,
  DashProfessorBanca,
  DashProfessorResponse,
} from '#interfaces/dash_professor'

function getTccStatus(tcc: Tcc): DashProfessorAvaliacaoStatus {
  const status = tcc.status?.toLowerCase().trim()
  if (status === 'banca') return 'pendente'
  if (status === 'concluido' || status === 'aprovado') return 'concluida'
  return 'rascunho'
}

function toDashboardDate(value: string | DateTime | null | undefined): DateTime | null {
  const date = toDateString(value)
  if (!date) {
    return null
  }

  const parsed = DateTime.fromISO(date)
  return parsed.isValid ? parsed : null
}

function createAvisos(args: {
  pendentes: number
  rascunhos: number
  proximasApresentacoes: number
}): DashProfessorAviso[] {
  const avisos: DashProfessorAviso[] = []

  if (args.pendentes > 0) {
    avisos.push({
      tipo: 'avaliacao_pendente',
      title: 'Avaliações pendentes',
      description: `${args.pendentes} avaliação(ões) aguardam registro.`,
      status: 'Pendente',
    })
  }

  if (args.rascunhos > 0) {
    avisos.push({
      tipo: 'rascunho',
      title: 'Rascunhos em aberto',
      description: `${args.rascunhos} avaliação(ões) foram iniciadas e ainda não publicadas.`,
      status: 'Rascunho',
    })
  }

  if (args.proximasApresentacoes > 0) {
    avisos.push({
      tipo: 'banca_proxima',
      title: 'Bancas próximas',
      description: `${args.proximasApresentacoes} apresentação(ões) previstas nos próximos 7 dias.`,
      status: 'Agenda',
    })
  }

  if (avisos.length === 0) {
    avisos.push({
      tipo: 'ok',
      title: 'Tudo em dia',
      description: 'Não há avaliações ou bancas pendentes no momento.',
      status: 'Ok',
    })
  }

  return avisos
}

export default class DashProfessorService {
  async getProfessorDashboard(uuidProfessor: string): Promise<DashProfessorResponse> {
    const tccs = await Tcc.query()
      .where('uuid_orientador', uuidProfessor)
      .preload('aluno')
      .preload('temaTcc')
      .preload('avaliacoes', (query) => {
        query.where('uuid_professor', uuidProfessor).orderBy('updated_at', 'desc')
      })
      .preload('agendas', (query) => {
        query.whereNotNull('data').orderBy('data', 'asc')
      })

    // Status dos TCCs (não avaliações)
    const tccData: DashProfessorAvaliacao[] = tccs.map((tcc) => {
      const avaliacao = tcc.avaliacoes?.[0]
      const agenda = tcc.agendas?.[0]

      return {
        uuidTcc: tcc.uuidTcc,
        titulo: tcc.temaTcc?.titulo ?? 'Tema não informado',
        aluno: tcc.aluno?.nome ?? 'Aluno não informado',
        dataApresentacao: toDateString(agenda?.data),
        hora: agenda?.hora ?? undefined,
        status: getTccStatus(tcc),
        nota: avaliacao?.nota ?? null,
      }
    })

    const now = DateTime.now().startOf('day')
    const sevenDaysFromNow = now.plus({ days: 7 }).endOf('day')
    const proximasBancas: DashProfessorBanca[] = tccs
      .flatMap((tcc) =>
        (tcc.agendas ?? []).map((agenda) => ({
          agenda,
          agendaDate: toDashboardDate(agenda.data),
          tcc,
        }))
      )
      .filter(
        ({ agendaDate }) =>
          agendaDate &&
          agendaDate.toMillis() >= now.toMillis() &&
          agendaDate.toMillis() <= sevenDaysFromNow.toMillis()
      )
      .sort((first, second) => first.agendaDate!.toMillis() - second.agendaDate!.toMillis())
      .slice(0, 5)
      .map(({ agenda, tcc }) => ({
        uuidAgenda: agenda.uuidAgenda,
        titulo: tcc.temaTcc?.titulo ?? 'Tema não informado',
        aluno: tcc.aluno?.nome ?? 'Aluno não informado',
        data: toDateString(agenda.data),
        hora: agenda.hora ?? undefined,
        local: agenda.local,
        modalidade: agenda.modalidade,
      }))

    // Summary: TCCs por status, não avaliações
    const emAndamento = tccData.filter((t) => t.status === 'rascunho').length
    const aguardandoBanca = tccData.filter((t) => t.status === 'pendente').length
    const concluidos = tccData.filter((t) => t.status === 'concluida').length
    const proximasApresentacoes = proximasBancas.length

    return {
      summary: {
        pendentes: emAndamento, // TCCs em andamento
        concluidas: concluidos, // TCCs concluídos
        rascunhos: aguardandoBanca, // TCCs aguardando banca
        proximasApresentacoes,
      },
      avaliacoes: tccData,
      proximasBancas,
      avisos: createAvisos({ pendentes: emAndamento, rascunhos: aguardandoBanca, proximasApresentacoes }),
    }
  }
}

import type { TagProps } from 'primereact/tag'
import dashboardAlunoMock from '../../assets/mocks/dashboard-aluno.mock.json'
import dashboardProfessorMock from '../../assets/mocks/dashboard-professor.mock.json'
import { getDevAlunoEmail, isBackendActive } from '../config/env'
import { apiClient } from './api-client'
import { useAuthStore } from '../stores/auth-store'
import type { IconBadgeTone } from '../ui/atoms/IconBadge'

export type SummaryCardData = {
  label: string
  value: string
  icon: string
  action: string
  tone: IconBadgeTone
}

export type TimelineItemData = {
  title: string
  date: string
  status: string
  severity: TagProps['severity']
  icon: string
}

export type AlertData = {
  icon: string
  tone: IconBadgeTone
  title: string
  description: string
  status: string
  statusSeverity: TagProps['severity']
  action: string
}

export type DashboardAlunoData = {
  summaryCards: SummaryCardData[]
  meuTema: {
    titulo: string
    areaInteresse: string
    orientador: string
    ultimaAtualizacao: string
    statusAtual: { label: string; severity: TagProps['severity'] }
  }
  timelineItems: TimelineItemData[]
  alerts: AlertData[]
}

export type ProfessorEvaluationStatus = 'pendente' | 'rascunho' | 'concluida'

export type ProfessorEvaluationRow = {
  id: string
  tcc: string
  aluno: string
  apresentacao: string
  status: ProfessorEvaluationStatus
  nota: string
  action: string
}

export type ProfessorPanelRow = {
  id: string
  day: string
  month: string
  time: string
  weekday: string
  aluno: string
  titulo: string
  local: string
}

export type DashboardProfessorData = {
  summaryCards: SummaryCardData[]
  evaluationRows: ProfessorEvaluationRow[]
  upcomingPanels: ProfessorPanelRow[]
  alerts: AlertData[]
}

// Contrato real de `GET /tcc-pro/dash-alunos/:uuidAluno`. Bem mais enxuto que
// o `DashboardAlunoData` que a tela usa: só da pra preencher os 4 cards de
// resumo. "Meu Tema", linha do tempo e avisos ainda não tem endpoint que
// devolva esses dados, entao continuam vindo do mock.
type DashAlunoResponse = {
  temaAtual: { exibir: boolean; temaAtual?: string; uuidTema?: string; icone?: string }
  statusTcc: { exibir: boolean; statusTcc?: string; uuidTcc?: string }
  proximaEntrega: { exibir: boolean; data?: string }
  apresentacao: { exibir: boolean; data?: string }
}

type AlunoLookup = { uuidAluno: string }
type ProfessorLookup = { uuidProfessor: string }

type DashProfessorResponse = {
  summary?: {
    pendentes?: number
    concluidas?: number
    rascunhos?: number
    proximasApresentacoes?: number
  }
  avaliacoes?: Array<{
    uuidTcc: string
    titulo: string
    aluno: string
    dataApresentacao?: string
    hora?: string
    status: ProfessorEvaluationStatus
    nota?: number | null
  }>
  proximasBancas?: Array<{
    uuidAgenda: string
    titulo: string
    aluno: string
    data?: string
    hora?: string
    local?: string
    modalidade?: string
  }>
  avisos?: Array<{
    tipo: 'avaliacao_pendente' | 'rascunho' | 'banca_proxima' | 'ok'
    title: string
    description: string
    status: string
  }>
}

function formatDateBr(iso?: string): string | undefined {
  if (!iso) {
    return undefined
  }

  const isoMatch = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return `${day}/${month}/${year}`
  }

  // O backend as vezes devolve a data como string de Date do JS
  // ("Sat Aug 15 2026 00:00:00 GMT-0300 ...") em vez de ISO.
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function formatPresentationDate(date?: string, time?: string): string {
  const formattedDate = formatDateBr(date)
  if (!formattedDate && !time) {
    return 'A definir'
  }

  return [formattedDate, time].filter(Boolean).join(' ')
}

function formatGrade(grade?: number | null): string {
  if (grade === undefined || grade === null) {
    return '-'
  }

  return grade.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
}

function getEvaluationAction(status: ProfessorEvaluationStatus): string {
  if (status === 'concluida') {
    return 'Ver avaliação'
  }

  if (status === 'rascunho') {
    return 'Continuar'
  }

  return 'Avaliar'
}

function buildProfessorSummaryCards(
  summary: NonNullable<DashProfessorResponse['summary']>,
): SummaryCardData[] {
  return [
    {
      label: 'Pendentes',
      value: String(summary.pendentes ?? 0),
      icon: 'pi pi-clipboard',
      action: 'Avaliar agora',
      tone: 'orange',
    },
    {
      label: 'Concluídas',
      value: String(summary.concluidas ?? 0),
      icon: 'pi pi-check-circle',
      action: 'Ver histórico',
      tone: 'green',
    },
    {
      label: 'Rascunhos',
      value: String(summary.rascunhos ?? 0),
      icon: 'pi pi-file-edit',
      action: 'Continuar',
      tone: 'purple',
    },
    {
      label: 'Próximas apresentações',
      value: String(summary.proximasApresentacoes ?? 0),
      icon: 'pi pi-calendar',
      action: 'Ver calendário',
      tone: 'blue',
    },
  ]
}

function getDateParts(date?: string): Pick<ProfessorPanelRow, 'day' | 'month' | 'weekday'> {
  if (!date) {
    return { day: '--', month: '---', weekday: 'A definir' }
  }

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return { day: '--', month: '---', weekday: date }
  }

  return {
    day: parsed.toLocaleDateString('pt-BR', { day: '2-digit' }),
    month: parsed.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    weekday: parsed.toLocaleDateString('pt-BR', { weekday: 'long' }),
  }
}

function buildProfessorAlert(alert: NonNullable<DashProfessorResponse['avisos']>[number]): AlertData {
  const presentation: Record<
    NonNullable<DashProfessorResponse['avisos']>[number]['tipo'],
    Pick<AlertData, 'icon' | 'tone' | 'statusSeverity' | 'action'>
  > = {
    avaliacao_pendente: {
      icon: 'pi pi-calendar-clock',
      tone: 'orange',
      statusSeverity: 'warning',
      action: 'Ver',
    },
    rascunho: {
      icon: 'pi pi-file-edit',
      tone: 'purple',
      statusSeverity: 'info',
      action: 'Continuar',
    },
    banca_proxima: {
      icon: 'pi pi-calendar',
      tone: 'blue',
      statusSeverity: 'info',
      action: 'Abrir',
    },
    ok: {
      icon: 'pi pi-check-circle',
      tone: 'green',
      statusSeverity: 'success',
      action: 'Ver',
    },
  }

  return {
    ...alert,
    ...presentation[alert.tipo],
  }
}

function buildProfessorDashboard(real: DashProfessorResponse): DashboardProfessorData {
  const mock = dashboardProfessorMock as DashboardProfessorData
  const summaryCards = real.summary ? buildProfessorSummaryCards(real.summary) : mock.summaryCards
  const evaluationRows =
    real.avaliacoes?.map((avaliacao) => ({
      id: avaliacao.uuidTcc,
      tcc: avaliacao.titulo,
      aluno: avaliacao.aluno,
      apresentacao: formatPresentationDate(avaliacao.dataApresentacao, avaliacao.hora),
      status: avaliacao.status,
      nota: formatGrade(avaliacao.nota),
      action: getEvaluationAction(avaliacao.status),
    })) ?? mock.evaluationRows
  const upcomingPanels =
    real.proximasBancas?.map((banca) => ({
      id: banca.uuidAgenda,
      ...getDateParts(banca.data),
      time: banca.hora ?? '--:--',
      aluno: banca.aluno,
      titulo: banca.titulo,
      local: banca.local ?? banca.modalidade ?? 'A definir',
    })) ?? mock.upcomingPanels

  return {
    summaryCards,
    evaluationRows,
    upcomingPanels,
    alerts: real.avisos?.map(buildProfessorAlert) ?? mock.alerts,
  }
}

function buildSummaryCards(real: DashAlunoResponse, mockCards: SummaryCardData[]): SummaryCardData[] {
  const realValues = [
    real.temaAtual.exibir ? real.temaAtual.temaAtual : undefined,
    real.statusTcc.exibir ? real.statusTcc.statusTcc : undefined,
    formatDateBr(real.proximaEntrega.exibir ? real.proximaEntrega.data : undefined),
    formatDateBr(real.apresentacao.exibir ? real.apresentacao.data : undefined),
  ]

  return mockCards.map((mockCard, index) => {
    const realValue = realValues[index]
    return realValue ? { ...mockCard, value: realValue } : mockCard
  })
}

async function findUuidAlunoByEmail(email: string): Promise<string | undefined> {
  if (!email) {
    return undefined
  }

  const { data } = await apiClient.get<AlunoLookup[]>('/tcc-pro/aluno', {
    params: { filterEmail: email },
  })
  return data[0]?.uuidAluno
}

async function findUuidProfessorByEmail(email: string): Promise<string | undefined> {
  if (!email) {
    return undefined
  }

  const { data } = await apiClient.get<ProfessorLookup[]>('/tcc-pro/professor', {
    params: { filterEmail: email },
  })
  return data[0]?.uuidProfessor
}

export async function getDashboardAluno(): Promise<DashboardAlunoData> {
  const mock = dashboardAlunoMock as DashboardAlunoData

  if (!isBackendActive()) {
    return mock
  }

  const loggedUser = useAuthStore.getState().user

  try {
    const uuidAluno =
      loggedUser?.uuidAluno ??
      (await findUuidAlunoByEmail(loggedUser?.email ?? getDevAlunoEmail() ?? ''))

    if (!uuidAluno) {
      return mock
    }

    const { data: real } = await apiClient.get<DashAlunoResponse>(
      `/tcc-pro/dash-alunos/${uuidAluno}`,
    )

    return {
      ...mock,
      summaryCards: buildSummaryCards(real, mock.summaryCards),
    }
  } catch (error) {
    console.error('Falha ao buscar dashboard do aluno, usando dados fictícios', error)
    return mock
  }
}

export async function getDashboardProfessor(): Promise<DashboardProfessorData> {
  const mock = dashboardProfessorMock as DashboardProfessorData

  if (!isBackendActive()) {
    return mock
  }

  const loggedUser = useAuthStore.getState().user

  try {
    const uuidProfessor = await findUuidProfessorByEmail(loggedUser?.email ?? '')

    if (!uuidProfessor) {
      return mock
    }

    const { data: real } = await apiClient.get<DashProfessorResponse>(
      `/tcc-pro/dash-professor/${uuidProfessor}`,
    )

    return buildProfessorDashboard(real)
  } catch (error) {
    console.error('Falha ao buscar dashboard do professor, usando dados fictícios', error)
    return mock
  }
}

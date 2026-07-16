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
  target?: string
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

type DashAlunoResponse = {
  temaAtual: {
    exibir: boolean
    temaAtual?: string
    uuidTema?: string
    areaInteresse?: string
    orientador?: string
    ultimaAtualizacao?: string
    statusAtual?: string
    icone?: string
  }
  statusTcc: { exibir: boolean; statusTcc?: string; uuidTcc?: string }
  proximaEntrega: { exibir: boolean; data?: string }
  apresentacao: { exibir: boolean; data?: string }
  timelineItems?: Array<{
    titulo: string
    data?: string
    status: string
  }>
  avisos?: Array<{
    tipo: string
    titulo: string
    descricao?: string
    status: string
    linkAcao?: string
  }>
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

  // O backend às vezes devolve a data como string de Date do JS
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

function formatStatusLabel(status?: string): string {
  if (!status) {
    return 'Sem registro'
  }

  const labels: Record<string, string> = {
    aguardando_aprovacao: 'Aguardando aprovação',
    aguardando_aprovacao_sem_acento: 'Aguardando aprovação',
    aprovado: 'Aprovado',
    ajustes_solicitados: 'Ajustes solicitados',
    banca: 'Banca',
    concluido: 'Concluído',
    em_andamento: 'Em andamento',
    orientacao_aprovada: 'Orientação aprovada',
    pendente: 'Pendente',
    recusado: 'Recusado',
    tema_pendente: 'Tema pendente',
  }
  const normalized = status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

  return labels[normalized] ?? status.replace(/_/g, ' ')
}

function getStatusSeverity(status?: string): TagProps['severity'] {
  const normalized = status
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (!normalized) {
    return 'secondary'
  }

  if (normalized.includes('aprov') || normalized.includes('conclu')) {
    return 'success'
  }

  if (normalized.includes('ajuste') || normalized.includes('recus') || normalized.includes('cancel')) {
    return 'danger'
  }

  if (normalized.includes('pendente') || normalized.includes('aguardando')) {
    return 'warning'
  }

  return 'info'
}

function getTimelineSeverity(status: string): TagProps['severity'] {
  if (status === 'concluida' || status === 'concluido') {
    return 'success'
  }

  if (status === 'em_analise' || status === 'em_andamento') {
    return 'info'
  }

  return 'secondary'
}

function getTimelineIcon(status: string): string {
  if (status === 'concluida' || status === 'concluido') {
    return 'pi pi-check'
  }

  if (status === 'em_analise' || status === 'em_andamento') {
    return 'pi pi-clock'
  }

  return 'pi pi-circle'
}

function getAlertPresentation(alert: NonNullable<DashAlunoResponse['avisos']>[number]): Pick<
  AlertData,
  'icon' | 'tone' | 'statusSeverity' | 'action' | 'target'
> {
  const normalized = alert.tipo.toLowerCase()

  if (normalized.includes('ajuste')) {
    return {
      icon: 'pi pi-exclamation-circle',
      tone: 'danger',
      statusSeverity: 'danger',
      action: 'Ver detalhes',
      target: alert.linkAcao ?? '/tema',
    }
  }

  if (normalized.includes('comentario') || normalized.includes('resposta')) {
    return {
      icon: 'pi pi-comments',
      tone: 'blue',
      statusSeverity: 'info',
      action: 'Ler mensagem',
      target: alert.linkAcao ?? '/tema',
    }
  }

  if (normalized.includes('etapa')) {
    return {
      icon: 'pi pi-flag',
      tone: 'green',
      statusSeverity: 'success',
      action: 'Ver cronograma',
      target: alert.linkAcao ?? '/cronograma',
    }
  }

  return {
    icon: 'pi pi-bell',
    tone: 'orange',
    statusSeverity: getStatusSeverity(alert.status),
    action: 'Ver detalhes',
    target: alert.linkAcao ?? '/tema',
  }
}

function buildAlunoDashboard(real: DashAlunoResponse): DashboardAlunoData {
  const formattedStatus = formatStatusLabel(real.statusTcc.statusTcc ?? real.temaAtual.statusAtual)
  const temaTitulo = real.temaAtual.temaAtual ?? 'Nenhum tema registrado'

  return {
    summaryCards: [
      {
        label: 'Tema atual',
        value: real.temaAtual.exibir ? temaTitulo : 'Nenhum tema',
        icon: 'pi pi-book',
        action: 'Ver detalhes',
        tone: 'blue',
      },
      {
        label: 'Status',
        value: real.statusTcc.exibir ? formattedStatus : 'Sem TCC',
        icon: 'pi pi-check-circle',
        action: 'Ver andamento',
        tone: 'green',
      },
      {
        label: 'Próxima Entrega',
        value: formatDateBr(real.proximaEntrega.data) ?? 'A definir',
        icon: 'pi pi-calendar',
        action: 'Ver cronograma',
        tone: 'purple',
      },
      {
        label: 'Apresentação',
        value: formatDateBr(real.apresentacao.data) ?? 'A definir',
        icon: 'pi pi-clipboard',
        action: 'Ver detalhes',
        tone: 'orange',
      },
    ],
    meuTema: {
      titulo: temaTitulo,
      areaInteresse: real.temaAtual.areaInteresse ?? 'A definir',
      orientador: real.temaAtual.orientador ?? 'Não vinculado',
      ultimaAtualizacao: formatDateBr(real.temaAtual.ultimaAtualizacao) ?? 'A definir',
      statusAtual: {
        label: real.temaAtual.statusAtual ? formatStatusLabel(real.temaAtual.statusAtual) : formattedStatus,
        severity: getStatusSeverity(real.temaAtual.statusAtual ?? real.statusTcc.statusTcc),
      },
    },
    timelineItems:
      real.timelineItems?.map((item) => ({
        title: item.titulo,
        date: formatDateBr(item.data) ?? 'A definir',
        status: formatStatusLabel(item.status),
        severity: getTimelineSeverity(item.status),
        icon: getTimelineIcon(item.status),
      })) ?? [],
    alerts:
      real.avisos?.map((alert) => ({
        ...getAlertPresentation(alert),
        title: alert.titulo,
        description: alert.descricao ?? 'Atualização registrada no acompanhamento do TCC.',
        status: formatStatusLabel(alert.status),
      })) ?? [],
  }
}

export async function getDashboardAluno(): Promise<DashboardAlunoData> {
  const mock = dashboardAlunoMock as DashboardAlunoData

  if (!isBackendActive()) {
    return mock
  }

  const loggedUser = useAuthStore.getState().user

  const uuidAluno =
    loggedUser?.uuidAluno ??
    loggedUser?.aluno?.uuidAluno ??
    (await findUuidAlunoByEmail(loggedUser?.email ?? getDevAlunoEmail() ?? ''))

  if (!uuidAluno) {
    return buildAlunoDashboard({
      temaAtual: { exibir: false },
      statusTcc: { exibir: false },
      proximaEntrega: { exibir: false },
      apresentacao: { exibir: false },
      timelineItems: [],
      avisos: [],
    })
  }

  const { data: real } = await apiClient.get<DashAlunoResponse>(
    `/tcc-pro/dash-alunos/${uuidAluno}`,
  )

  return buildAlunoDashboard(real)
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

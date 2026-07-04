import type { TagProps } from 'primereact/tag'
import dashboardAlunoMock from '../../assets/mocks/dashboard-aluno.mock.json'
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
    console.error('Falha ao buscar dashboard do aluno, usando dados ficticios', error)
    return mock
  }
}

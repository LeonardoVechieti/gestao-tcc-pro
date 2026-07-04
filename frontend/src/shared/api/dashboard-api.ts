import type { TagProps } from 'primereact/tag'
import dashboardAlunoMock from '../../assets/mocks/dashboard-aluno.mock.json'
import { isBackendActive } from '../config/env'
import { apiClient } from './api-client'
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

export async function getDashboardAluno(uuidAluno?: string): Promise<DashboardAlunoData> {
  if (!isBackendActive()) {
    return dashboardAlunoMock as DashboardAlunoData
  }

  // TODO: contrato de resposta ainda não documentado no Swagger do backend
  // (`/tcc-pro/dash-alunos/:uuidAluno` retorna `{ type: 'object' }`). Ajustar
  // o mapeamento abaixo assim que o formato real for definido.
  const { data } = await apiClient.get<DashboardAlunoData>(
    `/tcc-pro/dash-alunos/${uuidAluno ?? ''}`,
  )
  return data
}

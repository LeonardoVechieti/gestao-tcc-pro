import type { TagProps } from 'primereact/tag'
import { hasRole } from '../auth/roles'
import { useAuthStore, type AuthUser } from '../stores/auth-store'
import { apiClient } from './api-client'
import {
  getAlunoOrientations,
  getProfessorOrientations,
  type OrientationItem,
  type OrientationStage,
} from './orientation-api'

export type CronogramaScope = 'aluno' | 'professor' | 'coordenacao'
export type CronogramaDeadlineState =
  | 'concluida'
  | 'atrasada'
  | 'vence_hoje'
  | 'proxima'
  | 'futura'
  | 'sem_prazo'

export type CronogramaStage = OrientationStage & {
  prazoLabel: string
  diasTexto: string
  diasRestantes: number | null
  isAtual: boolean
  deadlineState: CronogramaDeadlineState
}

export type CronogramaTcc = {
  id: string
  uuidTcc: string
  aluno: string
  titulo: string
  orientador: string
  status: OrientationItem['status']
  etapaAtual: string
  progresso: number
  atualizadoEm: string
  etapas: CronogramaStage[]
}

export type CronogramaResponse = {
  scope: CronogramaScope
  cronogramas: CronogramaTcc[]
}

type AlunoLookup = { uuidAluno: string; email?: string }

function normalizeProfileName(profileName?: string): string {
  return (
    profileName
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

function getScope(user: AuthUser | null): CronogramaScope {
  const profileName = normalizeProfileName(user?.perfilNome ?? user?.role)

  if (profileName === 'professor' || hasRole(user, 'ROLE_DASH_PROFESSOR')) {
    return 'professor'
  }

  if (profileName === 'aluno' || hasRole(user, 'ROLE_DASH_ALUNO')) {
    return 'aluno'
  }

  return 'coordenacao'
}

function parseDateOnly(value?: string): Date | null {
  if (!value || value === 'A definir') {
    return null
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function formatDateBr(value?: string): string {
  const date = parseDateOnly(value)
  if (!date) {
    return 'A definir'
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function getDaysUntil(value?: string): number | null {
  const date = parseDateOnly(value)
  if (!date) {
    return null
  }

  const today = new Date()
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffInMs = date.getTime() - todayOnly.getTime()
  return Math.round(diffInMs / 86_400_000)
}

function getDeadlineState(stage: OrientationStage, daysUntil: number | null): CronogramaDeadlineState {
  if (stage.status === 'concluida') {
    return 'concluida'
  }

  if (daysUntil === null) {
    return 'sem_prazo'
  }

  if (daysUntil < 0) {
    return 'atrasada'
  }

  if (daysUntil === 0) {
    return 'vence_hoje'
  }

  if (daysUntil <= 7) {
    return 'proxima'
  }

  return 'futura'
}

function getDaysText(stage: OrientationStage, daysUntil: number | null): string {
  if (stage.status === 'concluida') {
    return 'Concluída'
  }

  if (daysUntil === null) {
    return 'Prazo a definir'
  }

  if (daysUntil < 0) {
    const days = Math.abs(daysUntil)
    return days === 1 ? '1 dia em atraso' : `${days} dias em atraso`
  }

  if (daysUntil === 0) {
    return 'Vence hoje'
  }

  return daysUntil === 1 ? '1 dia restante' : `${daysUntil} dias restantes`
}

function getStageOrder(stage: OrientationStage): number {
  const fixedOrder = [
    'Tema aprovado',
    'Projeto de TCC',
    'Entrega parcial',
    'Versão final',
    'Banca',
  ]
  const index = fixedOrder.indexOf(stage.titulo)
  return index >= 0 ? index : fixedOrder.length
}

function buildStages(stages: OrientationStage[]): CronogramaStage[] {
  const orderedStages = [...stages].sort((current, next) => getStageOrder(current) - getStageOrder(next))
  const currentStageId = orderedStages.find((stage) => stage.status !== 'concluida')?.id

  return orderedStages.map((stage) => {
    const diasRestantes = getDaysUntil(stage.prazo)

    return {
      ...stage,
      prazoLabel: formatDateBr(stage.prazo),
      diasTexto: getDaysText(stage, diasRestantes),
      diasRestantes,
      isAtual: stage.id === currentStageId,
      deadlineState: getDeadlineState(stage, diasRestantes),
    }
  })
}

function buildCronograma(orientation: OrientationItem): CronogramaTcc | null {
  if (orientation.sourceType !== 'tcc' || !orientation.uuidTcc || orientation.etapas.length === 0) {
    return null
  }

  return {
    id: orientation.id,
    uuidTcc: orientation.uuidTcc,
    aluno: orientation.aluno,
    titulo: orientation.titulo,
    orientador: orientation.professor?.nome ?? 'Orientador não informado',
    status: orientation.status,
    etapaAtual: orientation.etapaAtual,
    progresso: orientation.progresso,
    atualizadoEm: orientation.atualizadoEm,
    etapas: buildStages(orientation.etapas),
  }
}

async function findAlunoIdByEmail(email?: string): Promise<string | undefined> {
  if (!email) {
    return undefined
  }

  const { data } = await apiClient.get<AlunoLookup[]>('/tcc-pro/aluno', {
    params: { filterEmail: email },
  })

  return data.find((aluno) => aluno.email === email)?.uuidAluno ?? data[0]?.uuidAluno
}

export function getStageSeverity(stage: Pick<CronogramaStage, 'deadlineState' | 'status'>): TagProps['severity'] {
  if (stage.deadlineState === 'atrasada') {
    return 'danger'
  }

  if (stage.deadlineState === 'vence_hoje' || stage.deadlineState === 'proxima') {
    return 'warning'
  }

  if (stage.status === 'concluida') {
    return 'success'
  }

  if (stage.status === 'em_analise') {
    return 'info'
  }

  return 'secondary'
}

export function formatStageStatus(status: string): string {
  const labels: Record<string, string> = {
    concluida: 'Concluída',
    em_analise: 'Em análise',
    pendente: 'Pendente',
  }

  return labels[status] ?? status
}

export async function getCronogramaTccs(): Promise<CronogramaResponse> {
  const user = useAuthStore.getState().user
  const scope = getScope(user)
  let orientations: OrientationItem[] = []

  if (scope === 'aluno') {
    const uuidAluno =
      user?.uuidAluno ?? user?.aluno?.uuidAluno ?? (await findAlunoIdByEmail(user?.email))
    orientations = await getAlunoOrientations(uuidAluno)
  }

  if (scope === 'professor') {
    orientations = await getProfessorOrientations()
  }

  return {
    scope,
    cronogramas: orientations
      .map(buildCronograma)
      .filter((cronograma): cronograma is CronogramaTcc => Boolean(cronograma)),
  }
}

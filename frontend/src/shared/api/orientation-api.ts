import orientacoesMock from '../../assets/mocks/orientacoes.mock.json'
import { hasRole } from '../auth/roles'
import { isBackendActive } from '../config/env'
import { useAuthStore, type AuthUser } from '../stores/auth-store'
import { apiClient } from './api-client'

export type OrientationStatus =
  | 'solicitacao_pendente'
  | 'tema_pendente'
  | 'ajustes_solicitados'
  | 'em_acompanhamento'
  | 'aprovado'
  | 'recusado'
  | 'banca'
  | 'cancelado'

export type OrientationPriority = 'alta' | 'media' | 'normal'
export type OrientationStageStatus = 'pendente' | 'em_analise' | 'concluida'
export type OrientationSourceType = 'tcc' | 'tema'

export type OrientationStage = {
  id: string
  titulo: string
  status: OrientationStageStatus
  prazo: string
}

export type OrientationComment = {
  id: string
  autor: string
  tipo: 'Aluno' | 'Professor' | 'Sistema'
  categoria?: string
  mensagem: string
  data: string
}

export type OrientationProfessor = {
  uuidProfessor: string
  nome?: string
  email?: string
}

export type OrientationItem = {
  id: string
  sourceType: OrientationSourceType
  uuidTcc?: string | null
  uuidTemaTcc?: string | null
  aluno: string
  titulo: string
  area: string
  linhaPesquisa: string
  status: OrientationStatus
  prioridade: OrientationPriority
  atualizadoEm: string
  resumo: string
  etapaAtual: string
  progresso: number
  etapas: OrientationStage[]
  comentarios: OrientationComment[]
  professor?: OrientationProfessor | null
}

type ProfessorLookup = { uuidProfessor: string; nome?: string }
type OrientationsResponse = {
  orientacoes: OrientationItem[]
}

type StudentOrientationsResponse = OrientationsResponse & {
  aluno: {
    uuidAluno: string
    nome?: string
  }
}

type ThemeUpdatePayload = {
  titulo?: string
  descricao?: string
  area?: string
  linhaPesquisa?: string
}

type ActionPayload = {
  mensagem?: string
  adjustmentType?: 'tema' | 'trabalho'
  operation?: 'cancelar_orientacao'
  prazos?: Record<string, string>
  tema?: ThemeUpdatePayload
}

type StudentResponsePayload = {
  mensagem: string
  tema?: ThemeUpdatePayload
}

const requiredStageOrder = [
  'Tema aprovado',
  'Projeto de TCC',
  'Entrega parcial',
  'Versão final',
  'Banca',
]
const stageOrderByTitle = new Map(requiredStageOrder.map((title, index) => [title, index]))

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function normalizeStageTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getStageOrder(stage: OrientationStage): number {
  const exactOrder = stageOrderByTitle.get(stage.titulo)
  if (exactOrder !== undefined) {
    return exactOrder
  }

  const normalizedTitle = normalizeStageTitle(stage.titulo)
  const fuzzyOrder = requiredStageOrder.findIndex((title) =>
    normalizedTitle.includes(normalizeStageTitle(title)),
  )

  return fuzzyOrder >= 0 ? fuzzyOrder : requiredStageOrder.length
}

function sortStages(stages: OrientationStage[]): OrientationStage[] {
  return [...stages].sort((current, next) => getStageOrder(current) - getStageOrder(next))
}

function normalizeOrientation(orientation: OrientationItem): OrientationItem {
  return {
    ...orientation,
    etapas: sortStages(orientation.etapas),
  }
}

function normalizeMock(mock: OrientationItem[]): OrientationItem[] {
  return mock.map((orientation) =>
    normalizeOrientation({
      ...orientation,
      sourceType: orientation.sourceType ?? 'tema',
      uuidTemaTcc: orientation.uuidTemaTcc ?? orientation.id,
      uuidTcc: orientation.uuidTcc ?? null,
    }),
  )
}

function normalizeProfileName(profileName?: string): string {
  return (
    profileName
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

function isGlobalManagementProfile(user: AuthUser | null): boolean {
  const profileName = normalizeProfileName(user?.perfilNome ?? user?.role)
  return profileName === 'administrador' || profileName === 'coordenador'
}

function isProfessorProfile(user: AuthUser | null): boolean {
  const profileName = normalizeProfileName(user?.perfilNome ?? user?.role)
  return profileName === 'professor' || (!profileName && hasRole(user, 'ROLE_DASH_PROFESSOR'))
}

function getCurrentStage(stages: OrientationStage[]): string {
  return stages.find((stage) => stage.status !== 'concluida')?.titulo ?? 'Todas as etapas concluídas'
}

function getProgress(stages: OrientationStage[]): number {
  if (stages.length === 0) {
    return 0
  }

  return Math.round((stages.filter((stage) => stage.status === 'concluida').length / stages.length) * 100)
}

function addLocalComment(
  orientation: OrientationItem,
  message: string,
  author: string,
  status?: OrientationStatus,
  authorType: OrientationComment['tipo'] = author === 'Sistema' ? 'Sistema' : 'Professor',
): OrientationItem {
  return {
    ...orientation,
    status: status ?? orientation.status,
    atualizadoEm: today(),
    comentarios: [
      {
        id: crypto.randomUUID(),
        autor: author,
        tipo: authorType,
        mensagem: message,
        data: today(),
      },
      ...orientation.comentarios,
    ],
  }
}

async function findProfessorByEmail(email: string): Promise<ProfessorLookup | undefined> {
  if (!email) {
    return undefined
  }

  const { data } = await apiClient.get<ProfessorLookup[]>('/tcc-pro/professor', {
    params: { filterEmail: email },
  })
  return data[0]
}

async function postOrientationAction(
  orientation: OrientationItem,
  path: string,
  payload?: ActionPayload,
): Promise<OrientationItem> {
  const user = useAuthStore.getState().user
  const { data } = await apiClient.post<OrientationItem>(`/tcc-pro/orientacoes/${orientation.id}/${path}`, {
    sourceType: orientation.sourceType,
    autorNome: user?.nome ?? 'Professor',
    ...payload,
  })
  return normalizeOrientation(data)
}

export async function getProfessorOrientations(): Promise<OrientationItem[]> {
  const mock = normalizeMock(orientacoesMock as OrientationItem[])

  if (!isBackendActive()) {
    return mock
  }

  const user = useAuthStore.getState().user

  try {
    const professor = await findProfessorByEmail(user?.email ?? '')

    if (!professor) {
      return []
    }

    const { data } = await apiClient.get<OrientationsResponse>(
      `/tcc-pro/orientacoes/professor/${professor.uuidProfessor}`,
    )

    return data.orientacoes.map(normalizeOrientation)
  } catch (error) {
    console.error('Falha ao buscar orientações do professor', error)
    throw error
  }
}

export async function getAllOrientations(): Promise<OrientationItem[]> {
  const mock = normalizeMock(orientacoesMock as OrientationItem[])

  if (!isBackendActive()) {
    return mock
  }

  try {
    const { data } = await apiClient.get<OrientationsResponse>('/tcc-pro/orientacoes')
    return data.orientacoes.map(normalizeOrientation)
  } catch (error) {
    console.error('Falha ao buscar orientações globais', error)
    throw error
  }
}

export async function getManagedOrientations(): Promise<OrientationItem[]> {
  const user = useAuthStore.getState().user

  if (isGlobalManagementProfile(user)) {
    return getAllOrientations()
  }

  if (isProfessorProfile(user)) {
    return getProfessorOrientations()
  }

  return []
}

export async function getOrientationByTcc(uuidTcc: string): Promise<OrientationItem | null> {
  try {
    const orientations = await getManagedOrientations()
    return orientations.find((orientation) => orientation.uuidTcc === uuidTcc) ?? null
  } catch (error) {
    console.warn('Falha ao buscar orientação do TCC', error)
    return null
  }
}

export async function getAlunoOrientations(uuidAluno?: string): Promise<OrientationItem[]> {
  const mock = normalizeMock(orientacoesMock as OrientationItem[])

  if (!isBackendActive()) {
    return mock
  }

  if (!uuidAluno) {
    return []
  }

  try {
    const { data } = await apiClient.get<StudentOrientationsResponse>(
      `/tcc-pro/orientacoes/aluno/${uuidAluno}`,
    )

    return data.orientacoes.map(normalizeOrientation)
  } catch (error) {
    console.error('Falha ao buscar orientações do aluno', error)
    throw error
  }
}

export async function approveOrientation(orientation: OrientationItem): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return addLocalComment(orientation, 'Solicitação de orientação aprovada.', 'Sistema', 'em_acompanhamento')
  }

  return postOrientationAction(orientation, 'aprovar-orientacao')
}

export async function rejectOrientation(
  orientation: OrientationItem,
  mensagem = 'Solicitação de orientação recusada.',
): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return addLocalComment(orientation, mensagem, 'Sistema', 'recusado')
  }

  return postOrientationAction(orientation, 'recusar', { mensagem })
}

export async function approveTheme(orientation: OrientationItem): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return addLocalComment(orientation, 'Tema aprovado para acompanhamento.', 'Sistema', 'em_acompanhamento')
  }

  return postOrientationAction(orientation, 'aprovar-tema')
}

export async function requestOrientationAdjustments(
  orientation: OrientationItem,
  mensagem: string,
  adjustmentType: 'tema' | 'trabalho',
): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return addLocalComment(orientation, mensagem, useAuthStore.getState().user?.nome ?? 'Professor', 'ajustes_solicitados')
  }

  return postOrientationAction(orientation, 'solicitar-ajustes', { mensagem, adjustmentType })
}

export async function addOrientationComment(
  orientation: OrientationItem,
  mensagem: string,
): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return addLocalComment(orientation, mensagem, useAuthStore.getState().user?.nome ?? 'Professor')
  }

  return postOrientationAction(orientation, 'comentarios', { mensagem })
}

export async function addStudentOrientationResponse(
  orientation: OrientationItem,
  payload: StudentResponsePayload,
): Promise<OrientationItem> {
  const nextStatus: OrientationStatus = orientation.sourceType === 'tcc' ? 'em_acompanhamento' : 'tema_pendente'

  if (!isBackendActive()) {
    return addLocalComment(
      {
        ...orientation,
        titulo: payload.tema?.titulo ?? orientation.titulo,
        area: payload.tema?.area ?? orientation.area,
        linhaPesquisa: payload.tema?.linhaPesquisa ?? orientation.linhaPesquisa,
        resumo: payload.tema?.descricao ?? orientation.resumo,
      },
      payload.mensagem,
      useAuthStore.getState().user?.nome ?? 'Aluno',
      nextStatus,
      'Aluno',
    )
  }

  return postOrientationAction(orientation, 'comentarios-aluno', payload)
}

export async function completeOrientationStage(
  orientation: OrientationItem,
  stageId: string,
  nota?: number,
): Promise<OrientationItem> {
  if (!isBackendActive()) {
    const etapas = sortStages(
      orientation.etapas.map((stage) =>
        stage.id === stageId ? { ...stage, status: 'concluida' as const } : stage,
      ),
    )

    return {
      ...orientation,
      etapas,
      etapaAtual: getCurrentStage(etapas),
      progresso: getProgress(etapas),
      atualizadoEm: today(),
      status: etapas.every((stage) => stage.status === 'concluida') ? 'aprovado' : orientation.status,
    }
  }

  const payload: Record<string, unknown> = {
    sourceType: orientation.sourceType,
  }

  if (nota !== undefined) {
    payload.nota = nota
  }

  const { data } = await apiClient.post<OrientationItem>(
    `/tcc-pro/orientacoes/etapas/${stageId}/concluir`,
    payload,
  )
  return normalizeOrientation(data)
}

export async function cancelOrientation(
  orientation: OrientationItem,
  mensagem = 'Orientação cancelada.',
): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return addLocalComment(
      orientation,
      mensagem,
      useAuthStore.getState().user?.nome ?? 'Professor',
      'cancelado',
    )
  }

  return postOrientationAction(orientation, 'operacoes', {
    operation: 'cancelar_orientacao',
    mensagem,
  })
}

export async function approveThemeWithDeadlines(
  orientation: OrientationItem,
  prazos: Record<string, string>,
): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return addLocalComment(
      orientation,
      'Tema aprovado com prazos definidos.',
      'Sistema',
      'em_acompanhamento',
    )
  }

  return postOrientationAction(orientation, 'aprovar-tema-com-prazos', {
    prazos,
  })
}

export async function updateStageDeadlines(
  uuidTcc: string,
  prazos: Record<string, string>,
): Promise<OrientationItem> {
  if (!isBackendActive()) {
    return {} as OrientationItem
  }

  const { data } = await apiClient.put<OrientationItem>(`/tcc-pro/orientacoes/${uuidTcc}/prazos`, {
    prazos,
  })
  return normalizeOrientation(data)
}

import tccsMock from '../../assets/mocks/tccs.mock.json'
import { hasRole } from '../auth/roles'
import { isBackendActive } from '../config/env'
import { useAuthStore, type AuthUser } from '../stores/auth-store'
import { apiClient } from './api-client'
import { getTemaTccList } from './tema-tcc-api'

export type TccRow = {
  id: string
  uuidAluno: string
  aluno: string
  titulo: string
  orientador: string
  status: string
}

type TccRaw = {
  uuidTcc: string
  uuidAluno: string
  uuidOrientador?: string | null
  uuidTemaTcc: string
  status: string
}

type AlunoRaw = { uuidAluno: string; nome: string; email?: string }
type ProfessorRaw = { uuidProfessor: string; nome: string; email?: string }

type TccListQuery = {
  uuidAluno?: string
  uuidOrientador?: string
}

type TccListScope = {
  canList: boolean
  params?: TccListQuery
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

function normalizeStatus(status?: string): string {
  return status?.trim() || 'sem_status'
}

// O backend so devolve uuids (uuidAluno, uuidOrientador, uuidTemaTcc); a
// tabela precisa de nomes, entao buscamos as 3 listas e cruzamos aqui.
async function joinTccRows(tccs: TccRaw[]): Promise<TccRow[]> {
  if (tccs.length === 0) {
    return []
  }

  const [{ data: alunos }, { data: professores }, temas] = await Promise.all([
    apiClient.get<AlunoRaw[]>('/tcc-pro/aluno'),
    apiClient.get<ProfessorRaw[]>('/tcc-pro/professor'),
    getTemaTccList(),
  ])

  const nomeAlunoPorId = new Map(alunos.map((aluno) => [aluno.uuidAluno, aluno.nome]))
  const nomeProfessorPorId = new Map(professores.map((professor) => [professor.uuidProfessor, professor.nome]))
  const tituloPorTemaId = new Map(temas.map((tema) => [tema.uuidTemaTcc, tema.titulo]))

  return tccs.map((tcc) => ({
    id: tcc.uuidTcc,
    uuidAluno: tcc.uuidAluno,
    aluno: nomeAlunoPorId.get(tcc.uuidAluno) ?? 'Aluno não encontrado',
    titulo: tituloPorTemaId.get(tcc.uuidTemaTcc) ?? 'Tema não encontrado',
    orientador: tcc.uuidOrientador
      ? (nomeProfessorPorId.get(tcc.uuidOrientador) ?? 'Orientador não encontrado')
      : 'Sem orientador',
    status: normalizeStatus(tcc.status),
  }))
}

async function findAlunoIdByEmail(email?: string): Promise<string | undefined> {
  if (!email) {
    return undefined
  }

  const { data } = await apiClient.get<AlunoRaw[]>('/tcc-pro/aluno', {
    params: { filterEmail: email },
  })
  return data.find((aluno) => aluno.email === email)?.uuidAluno ?? data[0]?.uuidAluno
}

async function findProfessorIdByEmail(email?: string): Promise<string | undefined> {
  if (!email) {
    return undefined
  }

  const { data } = await apiClient.get<ProfessorRaw[]>('/tcc-pro/professor', {
    params: { filterEmail: email },
  })
  return data[0]?.uuidProfessor
}

async function getTccListScope(user: AuthUser | null): Promise<TccListScope> {
  const profileName = normalizeProfileName(user?.perfilNome ?? user?.role)

  if (profileName === 'administrador' || profileName === 'coordenador') {
    return { canList: true }
  }

  if (profileName === 'aluno') {
    const uuidAluno =
      user?.uuidAluno ?? user?.aluno?.uuidAluno ?? (await findAlunoIdByEmail(user?.email))
    return uuidAluno ? { canList: true, params: { uuidAluno } } : { canList: false }
  }

  if (profileName === 'professor') {
    const uuidOrientador = await findProfessorIdByEmail(user?.email)
    return uuidOrientador ? { canList: true, params: { uuidOrientador } } : { canList: false }
  }

  if (hasRole(user, 'ROLE_MENU_ADM') || hasRole(user, 'ROLE_DASH_COORDENADOR')) {
    return { canList: true }
  }

  if (hasRole(user, 'ROLE_DASH_PROFESSOR')) {
    const uuidOrientador = await findProfessorIdByEmail(user?.email)
    return uuidOrientador ? { canList: true, params: { uuidOrientador } } : { canList: false }
  }

  if (hasRole(user, 'ROLE_DASH_ALUNO')) {
    const uuidAluno =
      user?.uuidAluno ?? user?.aluno?.uuidAluno ?? (await findAlunoIdByEmail(user?.email))
    return uuidAluno ? { canList: true, params: { uuidAluno } } : { canList: false }
  }

  return { canList: true }
}

export async function getTccList(): Promise<TccRow[]> {
  const mock = tccsMock as TccRow[]

  if (!isBackendActive()) {
    return mock
  }

  try {
    const user = useAuthStore.getState().user
    const scope = await getTccListScope(user)

    if (!scope.canList) {
      return []
    }

    const { data: tccs } = await apiClient.get<TccRaw[]>('/tcc-pro/tcc', {
      params: scope.params,
    })

    return await joinTccRows(tccs ?? [])
  } catch (error) {
    console.error('Falha ao buscar lista de TCCs no backend', error)
    throw error
  }
}

import tccsMock from '../../assets/mocks/tccs.mock.json'
import { hasRole } from '../auth/roles'
import { isBackendActive } from '../config/env'
import { useAuthStore } from '../stores/auth-store'
import { apiClient } from './api-client'
import { getTemaTccList } from './tema-tcc-api'

export type TccStatus = 'em_andamento' | 'banca' | 'concluido'

export type TccRow = {
  id: string
  aluno: string
  titulo: string
  orientador: string
  status: TccStatus
}

type TccRaw = {
  uuidTcc: string
  uuidAluno: string
  uuidOrientador?: string | null
  uuidTemaTcc: string
  status: string
}

type AlunoRaw = { uuidAluno: string; nome: string }
type ProfessorRaw = { uuidProfessor: string; nome: string; email?: string }

function normalizeStatus(status: string): TccStatus {
  const key = status?.toLowerCase().trim().replace(/\s+/g, '_')
  if (key === 'banca' || key === 'concluido') {
    return key
  }
  return 'em_andamento'
}

// O backend so devolve uuids (uuidAluno, uuidOrientador, uuidTemaTcc); a
// tabela precisa de nomes, entao buscamos as 3 listas e cruzamos aqui.
async function joinTccRows(tccs: TccRaw[]): Promise<TccRow[]> {
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
    aluno: nomeAlunoPorId.get(tcc.uuidAluno) ?? 'Aluno não encontrado',
    titulo: tituloPorTemaId.get(tcc.uuidTemaTcc) ?? 'Tema não encontrado',
    orientador: tcc.uuidOrientador
      ? (nomeProfessorPorId.get(tcc.uuidOrientador) ?? 'Orientador não encontrado')
      : 'Sem orientador',
    status: normalizeStatus(tcc.status),
  }))
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

export async function getTccList(): Promise<TccRow[]> {
  const mock = tccsMock as TccRow[]

  if (!isBackendActive()) {
    return mock
  }

  try {
    const user = useAuthStore.getState().user
    const shouldFilterByProfessor =
      user?.perfilNome === 'Professor' || hasRole(user, 'ROLE_DASH_PROFESSOR')
    const uuidOrientador = shouldFilterByProfessor
      ? await findProfessorIdByEmail(user?.email)
      : undefined

    if (shouldFilterByProfessor && !uuidOrientador) {
      return []
    }

    const { data: tccs } = await apiClient.get<TccRaw[]>('/tcc-pro/tcc', {
      params: uuidOrientador ? { uuidOrientador } : undefined,
    })

    if (!tccs || tccs.length === 0) {
      return shouldFilterByProfessor ? [] : mock
    }

    return await joinTccRows(tccs)
  } catch (error) {
    console.error('Falha ao buscar lista de TCCs, usando dados fictícios', error)
    return mock
  }
}

import temasMock from '../../assets/mocks/temas.mock.json'
import { isBackendActive } from '../config/env'
import { apiClient } from './api-client'

export type CreateTemaTccPayload = {
  uuidAluno?: string
  uuidProfessor?: string
  titulo: string
  descricao: string
  area: string
  linhaPesquisa: string
  tags?: string[]
}

export type TemaTcc = {
  uuidTemaTcc: string
  uuidAluno?: string
  uuidProfessor?: string
  titulo: string
  descricao: string
  area: string
  linhaPesquisa: string
  tags?: string[]
  ativo?: boolean
  status?: string
}

export async function createTemaTcc(payload: CreateTemaTccPayload): Promise<TemaTcc> {
  if (!isBackendActive()) {
    return { uuidTemaTcc: crypto.randomUUID(), ativo: true, status: 'aguardando aprovacao', ...payload }
  }

  const { data } = await apiClient.post<TemaTcc>('/tcc-pro/tema-tcc', payload)
  return data
}

export async function getTemaTccList(params?: {
  uuidAluno?: string
  uuidProfessor?: string
  titulo?: string
  status?: string
  page?: number
  limit?: number
}): Promise<TemaTcc[]> {
  if (!isBackendActive()) {
    return temasMock as TemaTcc[]
  }

  const queryParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
      )
    : undefined

  const { data } = await apiClient.get<TemaTcc[]>('/tcc-pro/tema-tcc', { params: queryParams })
  return data
}

export async function getMyTemaTcc(): Promise<TemaTcc | null> {
  if (!isBackendActive()) {
    return temasMock[0] as TemaTcc
  }

  const { data } = await apiClient.get<TemaTcc>('/tcc-pro/tema-tcc/me')
  return data
}

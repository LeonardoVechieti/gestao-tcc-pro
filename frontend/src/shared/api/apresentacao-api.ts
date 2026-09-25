import { isAxiosError } from 'axios'
import apresentacoesMock from '../../assets/mocks/apresentacoes.mock.json'
import { isBackendActive } from '../config/env'
import { apiClient } from './api-client'

export type Modalidade = 'presencial' | 'virtual'

export type MembroBancaRow = {
  uuidProfessor: string | null
  nome: string | null
  papel: 'orientador' | 'avaliador' | string
}

export type ApresentacaoRow = {
  uuidAgenda: string
  uuidTcc: string
  tituloTcc: string | null
  aluno: { uuidAluno: string; nome: string } | null
  data: string | null
  hora: string | null
  modalidade: Modalidade | string
  sala: string | null
  link: string | null
  banca: MembroBancaRow[]
}

export type AgendarApresentacaoPayload = {
  uuidTcc: string
  avaliadores: string[]
  data: string
  hora: string
  modalidade: Modalidade
  sala?: string
  link?: string
}

export async function getApresentacoes(): Promise<ApresentacaoRow[]> {
  if (!isBackendActive()) {
    return apresentacoesMock as ApresentacaoRow[]
  }

  const { data } = await apiClient.get<ApresentacaoRow[]>('/tcc-pro/apresentacoes')
  return data
}

export async function agendarApresentacao(
  payload: AgendarApresentacaoPayload
): Promise<ApresentacaoRow> {
  if (!isBackendActive()) {
    throw new Error('Agendamento indisponível com dados fictícios (VITE_BACKEND_ACTIVE).')
  }

  const { data } = await apiClient.post<ApresentacaoRow>('/tcc-pro/apresentacoes', payload)
  return data
}

/* Mensagem legível para recusas do domínio (422), validação (422 do Vine) e demais erros. */
export function getAgendamentoErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as
      | { message?: string; errors?: { message: string }[] }
      | undefined
    if (body?.errors?.length) {
      return body.errors.map((item) => item.message).join(' ')
    }
    if (body?.message) {
      return body.message
    }
  }

  return error instanceof Error ? error.message : 'Não foi possível agendar a apresentação.'
}

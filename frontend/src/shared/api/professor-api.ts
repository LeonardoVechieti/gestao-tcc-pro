import { apiClient } from './api-client'

export type ProfessorRow = {
  uuidProfessor: string
  nome?: string
  email?: string
  ativo?: boolean
  areasInteresse?: string[]
  linhasPesquisa?: string[]
}

export type ProfessorRecommendation = ProfessorRow & {
  nome: string
}

export type ProfessorPayload = Omit<ProfessorRow, 'uuidProfessor'>

export async function getProfessores(params?: {
  filterNome?: string
  filterEmail?: string
  area?: string
  linhaPesquisa?: string
}): Promise<ProfessorRow[]> {
  const { data } = await apiClient.get<ProfessorRow[]>('/tcc-pro/professor', { params })
  return data
}

export async function findProfessorByEmail(email: string): Promise<ProfessorRow | undefined> {
  const professores = await getProfessores({ filterEmail: email })
  return professores.find((professor) => professor.email === email) ?? professores[0]
}

export async function getProfessorRecommendations(params: {
  area: string
  linhaPesquisa: string
}): Promise<ProfessorRecommendation[]> {
  const { data } = await apiClient.get<ProfessorRecommendation[]>('/tcc-pro/professor/recommendations', {
    params,
  })

  return data
}

export type ProfessorResearchOptions = {
  areas: string[]
  lines: string[]
}

export async function getProfessorResearchOptions(): Promise<ProfessorResearchOptions> {
  const { data } = await apiClient.get<ProfessorResearchOptions>('/tcc-pro/professor/research-options')
  return data
}

export async function getProfessorById(uuidProfessor: string): Promise<ProfessorRecommendation> {
  const { data } = await apiClient.get<ProfessorRecommendation>(`/tcc-pro/professor/${uuidProfessor}`)
  return data
}

export async function createProfessor(payload: ProfessorPayload): Promise<ProfessorRow> {
  const { data } = await apiClient.post<ProfessorRow>('/tcc-pro/professor', payload)
  return data
}

export async function updateProfessor(payload: ProfessorRow): Promise<ProfessorRow> {
  const { data } = await apiClient.put<ProfessorRow>('/tcc-pro/professor', payload)
  return data
}

export async function deleteProfessor(uuidProfessor: string): Promise<void> {
  await apiClient.delete(`/tcc-pro/professor/${uuidProfessor}`)
}

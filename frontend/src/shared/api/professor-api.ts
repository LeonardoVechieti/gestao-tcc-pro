import { apiClient } from './api-client'

export type ProfessorRecommendation = {
  uuidProfessor: string
  nome: string
  email?: string
  ativo?: boolean
  areasInteresse?: string[]
  linhasPesquisa?: string[]
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

export async function getProfessorById(uuidProfessor: string): Promise<ProfessorRecommendation> {
  const { data } = await apiClient.get<ProfessorRecommendation>(`/tcc-pro/professor/${uuidProfessor}`)
  return data
}

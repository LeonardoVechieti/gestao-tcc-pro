import { apiClient } from './api-client'

export type Feriado = {
  date: string
  name: string
  type: string
}

export async function getFeriadosByYear(year: number): Promise<Feriado[]> {
  const { data } = await apiClient.get<Feriado[]>(`/tcc-pro/feriados/${year}`)
  return data
}

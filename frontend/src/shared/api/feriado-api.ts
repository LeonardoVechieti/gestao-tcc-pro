import feriadosMock from '../../assets/mocks/feriados.mock.json'
import { isBackendActive } from '../config/env'
import { apiClient } from './api-client'

export type Feriado = {
  date: string
  name: string
  type: string
}

export async function getFeriadosByYear(year: number): Promise<Feriado[]> {
  if (!isBackendActive()) {
    return feriadosMock as Feriado[]
  }

  const { data } = await apiClient.get<Feriado[]>(`/tcc-pro/feriados/${year}`)
  return data
}

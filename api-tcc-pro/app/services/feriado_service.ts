import env from '#start/env'
import { Feriado } from '#interfaces/feriado'

export default class FeriadoService {
  private apiUrl = env.get('FERIADOS_API_URL')

  async isHoliday(date: string): Promise<boolean> {
    const year = new Date(date).getFullYear()
    const response = await fetch(`${this.apiUrl}/${year}`)

    if (!response.ok) {
      throw new Error(`Falha ao buscar dados de feriado: ${response.statusText}`)
    }

    const feriados = (await response.json()) as Feriado[]
    return feriados.some((feriado) => feriado.date === date)
  }
}

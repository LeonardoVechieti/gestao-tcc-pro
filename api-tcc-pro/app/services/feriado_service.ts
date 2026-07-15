import env from '#start/env'
import { Feriado } from '#interfaces/feriado'
import { normalizeApiUrl } from '#helpers/normalize_api_url'

export default class FeriadoService {
  private apiUrl = normalizeApiUrl(env.get('FERIADOS_API_URL'))

  /* Funcao para listar os feriados de um determinado ano. */
  /* @param year - O ano para o qual os feriados devem ser listados. */
  async listByYear(year: number): Promise<Feriado[]> {
    const response = await fetch(`${this.apiUrl}/${year}`)

    const responseText = await response.text()
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados de feriado: ${response.statusText} - ${responseText}`)
    }

    const parsedResponse = JSON.parse(responseText)

    console.log(`Feriados do ano ${year} foram buscados com sucesso.`)
    console.log('Resposta da API:', JSON.stringify(parsedResponse, null, 2))

    return parsedResponse as Feriado[]
  }

  async isHoliday(date: string): Promise<boolean> {
    const year = new Date(date).getFullYear()
    const feriados = await this.listByYear(year)
    return feriados.some((feriado) => feriado.date === date)
  }
}

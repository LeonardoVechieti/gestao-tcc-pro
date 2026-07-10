import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { Feriado } from '#interfaces/feriado'
import FeriadoService from '#services/feriado_service'

@inject()
export default class FeriadoController {
  constructor(private feriadoService: FeriadoService) {}

  async index({ params }: HttpContext): Promise<Feriado[]> {
    const year = Number(params.ano)
    return this.feriadoService.listByYear(year)
  }
}

import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { AgendaValidator, AgendaIndexValidator } from '#validators/agenda/agenda_validator'
import AgendaRepository from '../repositories/agenda_repository.js'
import Agenda from '#models/DAO/agenda'
import AgendaService from '#services/agenda_service'

@inject()
export default class AgendaController {
  constructor(
    private agendaRepository: AgendaRepository,
    private agendaService: AgendaService
  ) {}

  async store({ request, response }: HttpContext): Promise<Agenda | void> {
    const payload = (await AgendaValidator.validate(request.all())) as unknown as Agenda
    try {
      return await this.agendaService.createOrUpdate(payload)
    } catch (error) {
      return response.badRequest({ message: (error as Error).message })
    }
  }

  async show({ params }: HttpContext): Promise<Agenda> {
    return this.agendaRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Agenda> | Agenda[]> {
    const payload = await AgendaIndexValidator.validate(request.all())
    return this.agendaRepository.index(payload)
  }

  async update({ request, response }: HttpContext): Promise<Agenda | void> {
    const payload = (await AgendaValidator.validate(request.all())) as unknown as Agenda
    try {
      return await this.agendaService.createOrUpdate(payload)
    } catch (error) {
      return response.badRequest({ message: (error as Error).message })
    }
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.agendaRepository.delete(params.id)
  }
}

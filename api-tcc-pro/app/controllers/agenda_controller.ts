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

  async store({ request }: HttpContext): Promise<Agenda> {
    const payload = (await AgendaValidator.validate(request.all())) as unknown as Agenda
    return this.agendaService.createOrUpdate(payload)
  }

  async show({ params }: HttpContext): Promise<Agenda> {
    return this.agendaRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Agenda> | Agenda[]> {
    const payload = await AgendaIndexValidator.validate(request.all())
    return this.agendaRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<Agenda> {
    const payload = (await AgendaValidator.validate(request.all())) as unknown as Agenda
    return this.agendaService.createOrUpdate(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.agendaRepository.delete(params.id)
  }
}

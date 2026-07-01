import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import AgendaRepository from '../repositories/agenda_repository.js'
import FeriadoService from './feriado_service.js'
import Agenda from '#models/DAO/agenda'

@inject()
export default class AgendaService {
  constructor(
    private agendaRepository: AgendaRepository,
    private feriadoService: FeriadoService
  ) {}

  async createOrUpdate(payload: Agenda): Promise<Agenda> {
    if (!payload.data) {
      throw new Error('Data da agenda é obrigatória.')
    }

    let dateString: string

    if (typeof payload.data === 'string') {
      dateString = payload.data
    } else if (DateTime.isDateTime(payload.data)) {
      dateString = payload.data.toISODate() ?? payload.data.toString()
    } else {
      dateString = String(payload.data)
    }

    const isHoliday = await this.feriadoService.isHoliday(dateString)
    if (isHoliday) {
      throw new Error('Não é possível criar ou atualizar agenda em um feriado.')
    }

    if (payload.uuidAgenda) {
      const agenda = await this.agendaRepository.show(payload.uuidAgenda)
      agenda.merge(payload)
      return await agenda.save()
    }

    return await this.agendaRepository.store(payload)
  }
}

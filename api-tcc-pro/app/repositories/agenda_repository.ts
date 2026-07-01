import Agenda from '#models/DAO/agenda'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class AgendaRepository {
  async store(data: Agenda): Promise<Agenda> {
    return await Agenda.create(data)
  }

  async show(id: string): Promise<Agenda> {
    return await Agenda.query().where('uuidAgenda', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Agenda> | Agenda[]> {
    const query = Agenda.query()

    if (data.uuidTcc) {
      query.where('uuid_tcc', data.uuidTcc)
    }

    if (data.uuidProfessor) {
      query.where('uuid_professor', data.uuidProfessor)
    }

    if (data.modalidade) {
      query.where('modalidade', data.modalidade)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    }

    return await query
  }

  async update(data: Agenda): Promise<Agenda> {
    const model = await Agenda.findOrFail(data.uuidAgenda)
    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    const agenda = await Agenda.findOrFail(id)
    await agenda.delete()
  }
}

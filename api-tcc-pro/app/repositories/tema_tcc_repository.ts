import TemaTcc from '#models/DAO/tema_tcc'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class TemaTccRepository {
  async store(data: TemaTcc): Promise<TemaTcc> {
    return await TemaTcc.create(data)
  }

  async show(id: string): Promise<TemaTcc> {
    return await TemaTcc.query().where('uuidTemaTcc', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<TemaTcc> | TemaTcc[]> {
    const query = TemaTcc.query()

    if (data.uuidAluno) {
      query.where('uuid_aluno', data.uuidAluno)
    }

    if (data.uuidProfessor) {
      query.where('uuid_professor', data.uuidProfessor)
    }

    if (data.titulo) {
      query.where('titulo', 'ILIKE', `%${data.titulo}%`)
    }

    if (data.status) {
      query.where('status', data.status)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    }

    return await query
  }

  async update(data: TemaTcc): Promise<TemaTcc> {
    const model = await TemaTcc.findOrFail(data.uuidTemaTcc)
    model.merge(data)
    return await model.save()
  }

  async findByAluno(uuidAluno: string): Promise<TemaTcc | null> {
    return await TemaTcc.query()
      .where('uuid_aluno', uuidAluno)
      .orderBy('created_at', 'desc')
      .first()
  }

  async delete(id: string): Promise<void> {
    const temaTcc = await TemaTcc.findOrFail(id)
    await temaTcc.delete()
  }
}

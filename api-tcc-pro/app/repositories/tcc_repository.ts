import Tcc from '#models/DAO/tcc'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class TccRepository {
  async store(data: Tcc): Promise<Tcc> {
    return await Tcc.create(data)
  }

  async show(id: string): Promise<Tcc> {
    return await Tcc.query().where('uuidTcc', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Tcc> | Tcc[]> {
    const query = Tcc.query()

    if (data.uuidAluno) {
      query.where('uuid_aluno', data.uuidAluno)
    }

    if (data.uuidOrientador) {
      query.where('uuid_orientador', data.uuidOrientador)
    }

    if (data.uuidTemaTcc) {
      query.where('uuid_tema_tcc', data.uuidTemaTcc)
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

  async update(data: Tcc): Promise<Tcc> {
    const model = await Tcc.findOrFail(data.uuidTcc)
    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    const tcc = await Tcc.findOrFail(id)
    await tcc.delete()
  }
}

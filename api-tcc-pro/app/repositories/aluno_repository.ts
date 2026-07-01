import Aluno from '#models/DAO/aluno'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class AlunoRepository {
  async store(data: Aluno): Promise<Aluno> {
    return await Aluno.create(data)
  }

  async show(id: string): Promise<Aluno> {
    return await Aluno.query().where('uuidAluno', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Aluno> | Aluno[]> {
    const query = Aluno.query()

    if (data.nome) {
      query.where('nome', data.nome)
    }

    if (data.filterNome) {
      query.where('nome', 'ILIKE', `%${data.filterNome}%`)
    }

    if (data.filterEmail) {
      query.where('email', 'ILIKE', `%${data.filterEmail}%`)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    }

    return await query
  }

  async update(data: Aluno): Promise<Aluno> {
    const model = await Aluno.findOrFail(data.uuidAluno)
    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    const aluno = await Aluno.findOrFail(id)
    await aluno.delete()
  }
}

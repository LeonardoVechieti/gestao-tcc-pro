import Professor from '#models/DAO/professor'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class ProfessorRepository {
  async store(data: Professor): Promise<Professor> {
    return await Professor.create(data)
  }

  async show(id: string): Promise<Professor> {
    return await Professor.query().where('uuidProfessor', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Professor> | Professor[]> {
    const query = Professor.query()

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

  async update(data: Professor): Promise<Professor> {
    const model = await Professor.findOrFail(data.uuidProfessor)
    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    const professor = await Professor.findOrFail(id)
    await professor.delete()
  }
}

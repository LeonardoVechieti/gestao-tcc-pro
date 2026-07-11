import Avaliacao from '#models/DAO/avaliacao'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class AvaliacaoRepository {
  async store(data: Avaliacao): Promise<Avaliacao> {
    return await Avaliacao.create(data)
  }

  async show(id: string): Promise<Avaliacao> {
    return await Avaliacao.query().where('uuidAvaliacao', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Avaliacao> | Avaliacao[]> {
    const query = Avaliacao.query().preload('tcc').preload('professor')

    if (data.uuidTcc) {
      query.where('uuid_tcc', data.uuidTcc)
    }

    if (data.uuidProfessor) {
      query.where('uuid_professor', data.uuidProfessor)
    }

    if (data.publicado !== undefined) {
      query.where('publicado', data.publicado)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection || 'asc')
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize || 10)
    }

    return await query
  }

  async update(data: Avaliacao): Promise<Avaliacao> {
    const model = await Avaliacao.findOrFail(data.uuidAvaliacao)
    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    const avaliacao = await Avaliacao.findOrFail(id)
    await avaliacao.delete()
  }

  async findByTccAndProfessor(uuidTcc: string, uuidProfessor?: string): Promise<Avaliacao | null> {
    const query = Avaliacao.query().where('uuid_tcc', uuidTcc)

    if (uuidProfessor) {
      query.where('uuid_professor', uuidProfessor)
    }

    return await query.first()
  }
}

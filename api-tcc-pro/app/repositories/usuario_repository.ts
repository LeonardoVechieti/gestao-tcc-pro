import Usuario from '#models/DAO/usuario'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class UsuarioRepository {
  async show(id: string): Promise<Usuario> {
    return await Usuario.query()
      .preload('perfil')
      .preload('aluno')
      .where('uuidUsuario', id)
      .firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Usuario> | Usuario[]> {
    const query = Usuario.query().preload('perfil').preload('aluno')

    if (data.nome) {
      query.where('nome', data.nome)
    }

    if (data.filterNome) {
      query.where('nome', 'ILIKE', `%${data.filterNome}%`)
    }

    if (data.filterEmail) {
      query.where('email', 'ILIKE', `%${data.filterEmail}%`)
    }

    if (data.ativo !== undefined) {
      query.where('ativo', data.ativo)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    }

    return await query
  }
}

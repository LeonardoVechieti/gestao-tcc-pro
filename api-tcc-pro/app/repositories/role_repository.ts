import Role from '#models/DAO/role'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class RoleRepository {
  async store(data: Role): Promise<Role> {
    return await Role.create(data)
  }

  async show(id: string): Promise<Role> {
    return await Role.query().where('uuidRole', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Role> | Role[]> {
    const query = Role.query()

    if (data.desRole) {
      query.where('desRole', data.desRole)
    }

    if (data.filterCodigo) {
      query.where('codRole', 'ILIKE', `%${data.filterCodigo}%`)
    }

    if (data.filterDescricao) {
      query.where('desRole', 'ILIKE', `%${data.filterDescricao}%`)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    } else {
      return await query
    }
  }

  async update(data: Role): Promise<Role> {
    let model = await Role.findOrFail(data.uuidRole)
    model.merge(data)
    return await model.save()
  }

  async delete(id: number): Promise<void> {
    const role = await Role.findOrFail(id)
    await role.delete()
  }
}

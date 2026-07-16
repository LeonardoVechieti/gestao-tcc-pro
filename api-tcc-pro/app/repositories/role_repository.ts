import Role from '#models/DAO/role'
import PerfilRole from '#models/DAO/perfil_role'
import GenericResponseException from '#exceptions/generic_response_exception'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class RoleRepository {
  async store(data: Role): Promise<Role> {
    await this.ensureUniqueCode(data.codRole)
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

    await this.ensureUniqueCode(data.codRole, model.uuidRole)

    if (data.codRole !== undefined && data.codRole !== model.codRole) {
      await this.ensureRoleIsNotAssigned(
        model.uuidRole,
        'Não é possível alterar o código de uma role vinculada a perfis.'
      )
    }

    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    await this.ensureRoleIsNotAssigned(id, 'Não é possível remover uma role vinculada a perfis.')
    const role = await Role.findOrFail(id)
    await role.delete()
  }

  private async ensureUniqueCode(codRole?: string | null, ignoredUuid?: string) {
    const normalizedCode = codRole?.trim()

    if (!normalizedCode) {
      return
    }

    const query = Role.query().where('codRole', normalizedCode)

    if (ignoredUuid) {
      query.whereNot('uuidRole', ignoredUuid)
    }

    const existingRole = await query.first()

    if (existingRole) {
      throw new GenericResponseException('Já existe uma role cadastrada com este código.', 409)
    }
  }

  private async ensureRoleIsNotAssigned(uuidRole: string, message: string) {
    const assignedRole = await PerfilRole.query().where('uuidRole', uuidRole).first()

    if (assignedRole) {
      throw new GenericResponseException(message, 409)
    }
  }
}

import Perfil from '#models/DAO/perfil'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import PerfilRole from '#models/DAO/perfil_role'

export default class PerfilRepository {
  async store(data: Perfil): Promise<Perfil> {
    return await Perfil.create(data)
  }

  async show(id: string): Promise<Perfil> {
    return await Perfil.query().where('uuidPerfil', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Perfil> | Perfil[]> {
    const query = Perfil.query()

    if (data.nomePerfil) {
      query.where('nomePerfil', data.nomePerfil)
    }

    if (data.filterName) {
      query.where('nomePerfil', 'ILIKE', `%${data.filterName}%`)
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

  async update(data: Perfil): Promise<Perfil> {
    let model = await Perfil.findOrFail(data.uuidPerfil)
    model.merge(data)
    return await model.save()
  }

  async delete(id: number): Promise<void> {
    const perfil = await Perfil.findOrFail(id)
    await perfil.delete()
  }

  // ############################### PERFIL ROLES #######################################
  async getPerfilRoles(uuid: string): Promise<PerfilRole[]> {
    const perfilRole = await PerfilRole.query().preload('role').where('uuidPerfil', uuid)
    return perfilRole
  }

  async createPerfilRoles(data: PerfilRole): Promise<PerfilRole> {
    return await PerfilRole.create(data)
  }

  async deletePerfilRoles(data: PerfilRole): Promise<void> {
    const perfilRole = await PerfilRole.query()
      .where('uuidPerfil', data.uuidPerfil)
      .where('uuidRole', data.uuidRole)
      .firstOrFail()
    await perfilRole.delete()
  }
}

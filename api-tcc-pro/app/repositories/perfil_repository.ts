import Perfil from '#models/DAO/perfil'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import PerfilRole from '#models/DAO/perfil_role'
import Role from '#models/DAO/role'
import Usuario from '#models/DAO/usuario'
import GenericResponseException from '#exceptions/generic_response_exception'

const PROTECTED_PROFILE_REQUIRED_ROLES: Record<string, string[] | 'ALL'> = {
  administrador: 'ALL',
  aluno: ['ROLE_DASH_ALUNO', 'ROLE_TEMA_VIEW', 'ROLE_TCC_VIEW', 'ROLE_MENU_MEU_TCC'],
  professor: ['ROLE_DASH_PROFESSOR', 'ROLE_TCC_VIEW', 'ROLE_AGENDA_VIEW'],
  coordenador: [
    'ROLE_DASH_COORDENADOR',
    'ROLE_MENU_ADM',
    'ROLE_ALUNO_VIEW',
    'ROLE_PROFESSOR_VIEW',
    'ROLE_TEMA_VIEW',
    'ROLE_TCC_VIEW',
    'ROLE_AGENDA_VIEW',
  ],
}

function normalizeProfileName(nomePerfil?: string | null) {
  return (
    nomePerfil
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

export default class PerfilRepository {
  async store(data: Perfil): Promise<Perfil> {
    await this.ensureUniqueName(data.nomePerfil)
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

    await this.ensureUniqueName(data.nomePerfil, model.uuidPerfil)

    const currentProfileName = normalizeProfileName(model.nomePerfil)
    const nextProfileName = normalizeProfileName(data.nomePerfil)

    if (
      PROTECTED_PROFILE_REQUIRED_ROLES[currentProfileName] &&
      nextProfileName &&
      currentProfileName !== nextProfileName
    ) {
      throw new GenericResponseException(
        'Não é possível renomear um perfil estrutural do sistema.',
        409
      )
    }

    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    const perfil = await Perfil.findOrFail(id)
    const profileName = normalizeProfileName(perfil.nomePerfil)

    if (PROTECTED_PROFILE_REQUIRED_ROLES[profileName]) {
      throw new GenericResponseException('Não é possível remover um perfil estrutural do sistema.', 409)
    }

    const assignedUser = await Usuario.query().where('uuidPerfil', id).first()

    if (assignedUser) {
      throw new GenericResponseException(
        'Não é possível remover um perfil vinculado a usuários.',
        409
      )
    }

    await perfil.delete()
  }

  // ############################### PERFIL ROLES #######################################
  async getPerfilRoles(uuid: string): Promise<PerfilRole[]> {
    const perfilRole = await PerfilRole.query().preload('role').where('uuidPerfil', uuid)
    return perfilRole
  }

  async createPerfilRoles(data: PerfilRole): Promise<PerfilRole> {
    const existingPerfilRole = await PerfilRole.query()
      .where('uuidPerfil', data.uuidPerfil)
      .where('uuidRole', data.uuidRole)
      .first()

    if (existingPerfilRole) {
      return existingPerfilRole
    }

    return await PerfilRole.create(data)
  }

  async deletePerfilRoles(data: PerfilRole): Promise<void> {
    const perfilRole = await PerfilRole.query()
      .preload('role')
      .where('uuidPerfil', data.uuidPerfil)
      .where('uuidRole', data.uuidRole)
      .firstOrFail()
    const perfil = await Perfil.findOrFail(data.uuidPerfil)
    this.ensureRoleCanBeRemovedFromProfile(perfil, perfilRole.role)
    await perfilRole.delete()
  }

  private async ensureUniqueName(nomePerfil?: string | null, ignoredUuid?: string) {
    const normalizedName = nomePerfil?.trim()

    if (!normalizedName) {
      return
    }

    const query = Perfil.query().whereILike('nomePerfil', normalizedName)

    if (ignoredUuid) {
      query.whereNot('uuidPerfil', ignoredUuid)
    }

    const existingPerfil = await query.first()

    if (existingPerfil) {
      throw new GenericResponseException('Já existe um perfil cadastrado com este nome.', 409)
    }
  }

  private ensureRoleCanBeRemovedFromProfile(perfil: Perfil, role: Role) {
    const profileName = normalizeProfileName(perfil.nomePerfil)
    const requiredRoles = PROTECTED_PROFILE_REQUIRED_ROLES[profileName]

    if (!requiredRoles) {
      return
    }

    if (requiredRoles === 'ALL' || (role.codRole && requiredRoles.includes(role.codRole))) {
      throw new GenericResponseException(
        'Não é possível remover esta role de um perfil estrutural do sistema.',
        409
      )
    }
  }
}

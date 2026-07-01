import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { PerfilValidator } from '#validators/perfil/perfil_validator'
import { PerfilIndexValidator } from '#validators/perfil/perfil_index_validator'
import PerfilRepository from '../repositories/perfil_repository.js'
import { PerfilRoleValidator } from '#validators/perfil/perfil_role_validator'
import Perfil from '#models/DAO/perfil'
import PerfilRole from '#models/DAO/perfil_role'

@inject()
export default class PerfilController {
  constructor(private perfilRepository: PerfilRepository) {}

  async store({ request }: HttpContext): Promise<Perfil> {
    const payload = (await PerfilValidator.validate(request.all())) as unknown as Perfil
    return this.perfilRepository.store(payload)
  }

  async show({ params }: HttpContext): Promise<Perfil> {
    return this.perfilRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Perfil> | Perfil[]> {
    const payload = await PerfilIndexValidator.validate(request.all())
    return this.perfilRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<Perfil> {
    const payload = (await PerfilValidator.validate(request.all())) as unknown as Perfil
    return this.perfilRepository.update(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    try {
      await this.perfilRepository.delete(params.id)
    } catch (error) {
      throw new Error('Perfil não encontrado.')
    }
  }

  async getPerfilRoles({ params }: HttpContext): Promise<PerfilRole[]> {
    return this.perfilRepository.getPerfilRoles(params.id)
  }

  async createPerfilRoles({ request }: HttpContext): Promise<PerfilRole> {
    const payload = (await PerfilRoleValidator.validate(request.all())) as unknown as PerfilRole
    return this.perfilRepository.createPerfilRoles(payload)
  }

  async deletePerfilRoles({ request }: HttpContext): Promise<void> {
    try {
      const payload = (await PerfilRoleValidator.validate(request.all())) as unknown as PerfilRole
      await this.perfilRepository.deletePerfilRoles(payload)
    } catch (error) {
      throw new Error('Perfil Role não encontrado')
    }
  }
}

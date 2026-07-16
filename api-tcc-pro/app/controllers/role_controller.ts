import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { RoleValidator } from '#validators/role/role_validator'
import { RoleIndexValidator } from '#validators/role/role_index_validator'
import RoleRepository from '../repositories/role_repository.js'
import Role from '#models/DAO/role'

@inject()
export default class RoleController {
  constructor(private roleRepository: RoleRepository) {}

  async store({ request }: HttpContext): Promise<Role> {
    const payload = (await RoleValidator.validate(request.all())) as unknown as Role
    return this.roleRepository.store(payload)
  }

  async show({ params }: HttpContext): Promise<Role> {
    return this.roleRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Role> | Role[]> {
    const payload = await RoleIndexValidator.validate(request.all())
    return this.roleRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<Role> {
    const payload = (await RoleValidator.validate(request.all())) as unknown as Role
    return this.roleRepository.update(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.roleRepository.delete(params.id)
  }
}

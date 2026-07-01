import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { TemaTccValidator, TemaTccIndexValidator } from '#validators/tema_tcc/tema_tcc_validator'
import TemaTccRepository from '../repositories/tema_tcc_repository.js'
import TemaTcc from '#models/DAO/tema_tcc'

@inject()
export default class TemaTccController {
  constructor(private temaTccRepository: TemaTccRepository) {}

  async store({ request }: HttpContext): Promise<TemaTcc> {
    const payload = (await TemaTccValidator.validate(request.all())) as unknown as TemaTcc
    return this.temaTccRepository.store(payload)
  }

  async show({ params }: HttpContext): Promise<TemaTcc> {
    return this.temaTccRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<TemaTcc> | TemaTcc[]> {
    const payload = await TemaTccIndexValidator.validate(request.all())
    return this.temaTccRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<TemaTcc> {
    const payload = (await TemaTccValidator.validate(request.all())) as unknown as TemaTcc
    return this.temaTccRepository.update(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.temaTccRepository.delete(params.id)
  }
}

import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { TccValidator, TccIndexValidator } from '#validators/tcc/tcc_validator'
import TccRepository from '../repositories/tcc_repository.js'
import Tcc from '#models/DAO/tcc'

@inject()
export default class TccController {
  constructor(private tccRepository: TccRepository) {}

  async store({ request }: HttpContext): Promise<Tcc> {
    const payload = (await TccValidator.validate(request.all())) as unknown as Tcc
    return this.tccRepository.store(payload)
  }

  async show({ params }: HttpContext): Promise<Tcc> {
    return this.tccRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Tcc> | Tcc[]> {
    const payload = await TccIndexValidator.validate(request.all())
    return this.tccRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<Tcc> {
    const payload = (await TccValidator.validate(request.all())) as unknown as Tcc
    return this.tccRepository.update(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.tccRepository.delete(params.id)
  }
}

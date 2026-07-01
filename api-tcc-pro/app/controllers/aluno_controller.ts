import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { AlunoValidator, AlunoIndexValidator } from '#validators/aluno/aluno_validator'
import AlunoRepository from '../repositories/aluno_repository.js'
import Aluno from '#models/DAO/aluno'

@inject()
export default class AlunoController {
  constructor(private alunoRepository: AlunoRepository) {}

  async store({ request }: HttpContext): Promise<Aluno> {
    const payload = (await AlunoValidator.validate(request.all())) as unknown as Aluno
    return this.alunoRepository.store(payload)
  }

  async show({ params }: HttpContext): Promise<Aluno> {
    return this.alunoRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Aluno> | Aluno[]> {
    const payload = await AlunoIndexValidator.validate(request.all())
    return this.alunoRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<Aluno> {
    const payload = (await AlunoValidator.validate(request.all())) as unknown as Aluno
    return this.alunoRepository.update(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.alunoRepository.delete(params.id)
  }
}

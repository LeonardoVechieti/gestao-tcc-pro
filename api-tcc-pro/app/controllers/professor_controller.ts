import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import {
  ProfessorValidator,
  ProfessorIndexValidator,
} from '#validators/professor/professor_validator'
import ProfessorRepository from '../repositories/professor_repository.js'
import Professor from '#models/DAO/professor'

@inject()
export default class ProfessorController {
  constructor(private professorRepository: ProfessorRepository) {}

  async store({ request }: HttpContext): Promise<Professor> {
    const payload = (await ProfessorValidator.validate(request.all())) as unknown as Professor
    return this.professorRepository.store(payload)
  }

  async show({ params }: HttpContext): Promise<Professor> {
    return this.professorRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Professor> | Professor[]> {
    const payload = await ProfessorIndexValidator.validate(request.all())
    return this.professorRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<Professor> {
    const payload = (await ProfessorValidator.validate(request.all())) as unknown as Professor
    return this.professorRepository.update(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.professorRepository.delete(params.id)
  }
}

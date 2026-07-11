import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import {
  AvaliacaoValidator,
  AvaliacaoCreateValidator,
  AvaliacaoIndexValidator,
} from '#validators/avaliacao/avaliacao_validator'
import AvaliacaoRepository from '../repositories/avaliacao_repository.js'
import Avaliacao from '#models/DAO/avaliacao'

@inject()
export default class AvaliacaoController {
  constructor(private avaliacaoRepository: AvaliacaoRepository) {}

  async store({ request }: HttpContext): Promise<Avaliacao> {
    const payload = (await AvaliacaoCreateValidator.validate(request.all())) as unknown as Avaliacao
    payload.publicado = false
    return this.avaliacaoRepository.store(payload)
  }

  async show({ params }: HttpContext): Promise<Avaliacao> {
    return this.avaliacaoRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Avaliacao> | Avaliacao[]> {
    const payload = await AvaliacaoIndexValidator.validate(request.all())
    return this.avaliacaoRepository.index(payload)
  }

  async update({ request }: HttpContext): Promise<Avaliacao> {
    const payload = (await AvaliacaoValidator.validate(request.all())) as unknown as Avaliacao
    return this.avaliacaoRepository.update(payload)
  }

  async delete({ params }: HttpContext): Promise<void> {
    await this.avaliacaoRepository.delete(params.id)
  }

  async publish({ params }: HttpContext): Promise<Avaliacao> {
    const avaliacao = await this.avaliacaoRepository.show(params.id)
    avaliacao.publicado = true
    return this.avaliacaoRepository.update(avaliacao)
  }

  async findByTccAndProfessor({ params, request: _request }: HttpContext): Promise<Avaliacao | null> {
    return this.avaliacaoRepository.findByTccAndProfessor(params.uuidTcc)
  }
}

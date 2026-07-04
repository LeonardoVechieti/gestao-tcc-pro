import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { UsuarioIndexValidator } from '#validators/usuario/usuario_index_validator'
import UsuarioRepository from '../repositories/usuario_repository.js'
import Usuario from '#models/DAO/usuario'

@inject()
export default class UsuarioController {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async show({ params }: HttpContext): Promise<Usuario> {
    return this.usuarioRepository.show(params.id)
  }

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Usuario> | Usuario[]> {
    const payload = await UsuarioIndexValidator.validate(request.all())
    return this.usuarioRepository.index(payload)
  }
}

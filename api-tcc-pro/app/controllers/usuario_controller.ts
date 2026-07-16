import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { UsuarioIndexValidator } from '#validators/usuario/usuario_index_validator'
import { UsuarioValidator } from '#validators/usuario/usuario_validator'
import GenericResponseException from '#exceptions/generic_response_exception'
import { hashPassword } from '#helpers/password'
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

  async update({ request }: HttpContext): Promise<Usuario> {
    const payload = await UsuarioValidator.validate(request.all())
    const authenticatedUser = (request as unknown as { user?: Usuario }).user

    if (authenticatedUser?.uuidUsuario && authenticatedUser.uuidUsuario !== payload.uuidUsuario) {
      throw new GenericResponseException('Usuário não autorizado para esta alteração', 403)
    }

    if (payload.email) {
      const existingUser = await this.usuarioRepository.findByEmail(payload.email)
      if (existingUser && existingUser.uuidUsuario !== payload.uuidUsuario) {
        throw new GenericResponseException('E-mail já cadastrado para outro usuário', 409)
      }
    }

    const password = payload.password?.trim()
    const data: Partial<Usuario> = {}

    if (payload.nome !== undefined) {
      data.nome = payload.nome.trim()
    }

    if (payload.email !== undefined) {
      data.email = payload.email.trim()
    }

    if (password) {
      data.password = hashPassword(password)
    }

    return this.usuarioRepository.update(payload.uuidUsuario, data)
  }
}

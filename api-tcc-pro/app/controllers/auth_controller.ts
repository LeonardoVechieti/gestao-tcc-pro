import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { randomBytes } from 'node:crypto'
import UsuarioRepository from '../repositories/usuario_repository.js'
import {
  LoginValidator,
  RegisterValidator,
  GoogleAuthValidator,
} from '#validators/auth/auth_validator'
import { hashPassword, verifyPassword } from '#helpers/password'
import env from '#start/env'
import * as authService from '#services/auth_service'

@inject()
export default class AuthController {
  constructor(private usuarioRepository: UsuarioRepository) {}

  private serializeAuthUser(usuario: Awaited<ReturnType<UsuarioRepository['show']>>) {
    const roles = authService.extractRoleCodes(usuario)

    return {
      uuidUsuario: usuario.uuidUsuario,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.perfil?.nomePerfil,
      perfilNome: usuario.perfil?.nomePerfil,
      roles,
    }
  }

  async register({ request, response }: HttpContext) {
    const payload = await RegisterValidator.validate(request.all())
    const existingUser = await this.usuarioRepository.findByEmail(payload.email)

    if (existingUser) {
      return response.conflict({
        message: 'E-mail já cadastrado',
        error: 'EMAIL_ALREADY_REGISTERED',
      })
    }

    const usuario = await this.usuarioRepository.create({
      nome: payload.nome ?? undefined,
      email: payload.email,
      password: hashPassword(payload.password),
      ativo: true,
      emailVerified: false,
    })

    const persistedUser = await this.usuarioRepository.show(usuario.uuidUsuario)

    return {
      token: authService.generateToken(persistedUser),
      user: this.serializeAuthUser(persistedUser),
    }
  }

  async login({ request, response }: HttpContext) {
    const payload = await LoginValidator.validate(request.all())
    const usuario = await this.usuarioRepository.findByEmail(payload.email)

    if (!usuario || !usuario.ativo || !verifyPassword(payload.password, usuario.password)) {
      return response.unauthorized({
        message: 'E-mail ou senha inválidos',
        error: 'INVALID_CREDENTIALS',
      })
    }

    return {
      token: authService.generateToken(usuario),
      user: this.serializeAuthUser(usuario),
    }
  }

  async loginWithGoogle({ request }: HttpContext) {
    const payload = await GoogleAuthValidator.validate(request.all())
    const googlePayload = await authService.verifyGoogleIdToken(payload.idToken)

    let usuario = await this.usuarioRepository.findByEmail(googlePayload.email)
    if (!usuario) {
      usuario = await this.usuarioRepository.create({
        nome: googlePayload.nome,
        email: googlePayload.email,
        // Google-only accounts receive an internal placeholder password.
        // The user authenticates with Google, not with this password.
        password: hashPassword(randomBytes(16).toString('hex')),
        ativo: true,
        emailVerified: true,
        uuidPerfil: env.get('GOOGLE_DEFAULT_PERFIL_UUID'),
      })
    }

    const persistedUser = await this.usuarioRepository.show(usuario.uuidUsuario)

    return {
      token: authService.generateToken(persistedUser),
      user: this.serializeAuthUser(persistedUser),
    }
  }

  async me({ request }: HttpContext) {
    const authorization = request.header('Authorization')
    const token = authorization?.split(' ')[1]

    if (!token) {
      return { message: 'Token não fornecido' }
    }

    const payload = authService.verifyToken(token)
    const usuario = await this.usuarioRepository.show(payload.sub)
    return this.serializeAuthUser(usuario)
  }
}

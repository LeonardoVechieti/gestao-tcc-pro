import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Usuario from '#models/DAO/usuario'
import * as authService from '#services/auth_service'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('Authorization')

    if (!authHeader) {
      return ctx.response.unauthorized({
        message: 'Token de autenticação não fornecido',
        error: 'UNAUTHORIZED',
      })
    }

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer') {
      return ctx.response.unauthorized({
        message: 'Formato de autenticação inválido. Use: Bearer <token>',
        error: 'INVALID_AUTH_FORMAT',
      })
    }

    if (!token) {
      return ctx.response.unauthorized({
        message: 'Token não fornecido',
        error: 'TOKEN_MISSING',
      })
    }

    try {
      const payload = authService.verifyToken(token)
      const usuario = await Usuario.query().where('uuidUsuario', payload.sub).first()

      if (!usuario) {
        throw new Error('Usuario não encontrado')
      }

      ;(ctx.request as any).user = usuario
      await next()
    } catch (error) {
      return ctx.response.unauthorized({
        message: 'Token de autenticação inválido',
        error: 'INVALID_TOKEN',
      })
    }
  }
}

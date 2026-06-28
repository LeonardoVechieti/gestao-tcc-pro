import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

/**
 * Middleware de autenticação básica usando Bearer Token
 * Valida se o token enviado no header Authorization corresponde ao token configurado no .env
 */
export default class AuthMiddleware {
  /**
   * Handle request
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('Authorization')

    // Verifica se o header Authorization está presente
    if (!authHeader) {
      return ctx.response.unauthorized({
        message: 'Token de autenticação não fornecido',
        error: 'UNAUTHORIZED',
      })
    }

    // Extrai o token do header (formato: "Bearer <token>")
    const [scheme, token] = authHeader.split(' ')

    // Verifica se o esquema é Bearer
    if (scheme !== 'Bearer') {
      return ctx.response.unauthorized({
        message: 'Formato de autenticação inválido. Use: Bearer <token>',
        error: 'INVALID_AUTH_FORMAT',
      })
    }

    // Verifica se o token foi extraído
    if (!token) {
      return ctx.response.unauthorized({
        message: 'Token não fornecido',
        error: 'TOKEN_MISSING',
      })
    }

    // Valida o token com o valor configurado no .env
    const apiToken = env.get('API_AUTH_TOKEN')

    if (token !== apiToken) {
      return ctx.response.unauthorized({
        message: 'Token de autenticação inválido',
        error: 'INVALID_TOKEN',
      })
    }

    // Token válido, continua com a requisição
    await next()
  }
}

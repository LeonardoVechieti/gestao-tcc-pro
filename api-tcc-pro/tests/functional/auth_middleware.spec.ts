import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth Middleware', (group) => {
  group.each.setup(() => testUtils.httpServer().start())

  test('deve retornar 401 quando o token não é fornecido', async ({ client }) => {
    const response = await client.get('/api/exemplo/protegido')

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Token de autenticação não fornecido',
      error: 'UNAUTHORIZED',
    })
  })

  test('deve retornar 401 quando o formato é inválido', async ({ client }) => {
    const response = await client.get('/api/exemplo/protegido').header('Authorization', 'Invalid')

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Formato de autenticação inválido. Use: Bearer <token>',
      error: 'INVALID_AUTH_FORMAT',
    })
  })

  test('deve retornar 401 quando o token é inválido', async ({ client }) => {
    const response = await client
      .get('/api/exemplo/protegido')
      .header('Authorization', 'Bearer token-invalido')

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Token de autenticação inválido',
      error: 'INVALID_TOKEN',
    })
  })

  test('deve permitir acesso quando o token é válido', async ({ client, assert }) => {
    const validToken = process.env.API_AUTH_TOKEN

    const response = await client
      .get('/api/exemplo/protegido')
      .header('Authorization', `Bearer ${validToken}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['message', 'authenticated'])
  })

  test('rota de health deve ser pública', async ({ client }) => {
    const response = await client.get('/portal-dados/health')

    // Deve retornar 200 sem necessidade de token
    response.assertStatus(200)
  })
})

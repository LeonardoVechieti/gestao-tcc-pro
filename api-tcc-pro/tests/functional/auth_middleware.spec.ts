import { test } from '@japa/runner'

test.group('Auth Middleware', () => {
  test('deve retornar 401 quando o token não é fornecido', async ({ client }) => {
    const response = await client.get('/tcc-pro/auth/me')

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Token de autenticação não fornecido',
      error: 'UNAUTHORIZED',
    })
  })

  test('deve retornar 401 quando o formato é inválido', async ({ client }) => {
    const response = await client.get('/tcc-pro/auth/me').header('Authorization', 'Invalid')

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Formato de autenticação inválido. Use: Bearer <token>',
      error: 'INVALID_AUTH_FORMAT',
    })
  })

  test('deve retornar 401 quando o token é inválido', async ({ client }) => {
    const response = await client
      .get('/tcc-pro/auth/me')
      .header('Authorization', 'Bearer token-invalido')

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Token de autenticação inválido',
      error: 'INVALID_TOKEN',
    })
  })

  test('deve permitir acesso quando o token é válido', async ({ client, assert }) => {
    const email = `usuario.teste.${Date.now()}@gestaotcc.local`
    const loginResponse = await client.post('/tcc-pro/auth/register').json({
      nome: 'Usuário Teste',
      email,
      password: 'Teste@12345',
    })
    const token = loginResponse.body().token

    const response = await client.get('/tcc-pro/auth/me').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['uuidUsuario', 'email'])
    assert.equal(response.body().email, email)
  })

  test('rota de swagger deve ser pública', async ({ client }) => {
    const response = await client.get('/tcc-pro/swagger.json')

    response.assertStatus(200)
  })
})

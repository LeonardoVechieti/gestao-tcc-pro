import { getDevAlunoSenha, isBackendActive } from '../config/env'
import { apiClient } from './api-client'
import type { AuthUser } from '../stores/auth-store'

export type LoginPayload = {
  email: string
  senha: string
}

type AlunoLookup = { uuidAluno: string; nome: string; email: string }

// Mensagem sempre genérica de propósito: não da pra dizer se o problema foi
// e-mail inexistente ou senha errada (evita confirmar pra quem esta tentando
// entrar quais e-mails existem no sistema).
const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha invalidos.'

// Login "de verdade" (senha validada no backend, OAuth do Google) ainda não
// existe — só o middleware de autenticação, hoje desabilitado. Enquanto
// isso, a senha e conferida contra VITE_DEV_ALUNO_SENHA (mesma senha de
// teste para qualquer aluno) e o aluno e identificado pelo e-mail
// cadastrado. Ver CLAUDE.md do frontend.
export async function loginAluno({ email, senha }: LoginPayload): Promise<AuthUser> {
  if (!isBackendActive()) {
    return { nome: 'Joao Silva', email, role: 'aluno' }
  }

  const devSenha = getDevAlunoSenha()
  if (devSenha && senha !== devSenha) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE)
  }

  const { data } = await apiClient.get<AlunoLookup[]>('/tcc-pro/aluno', {
    params: { filterEmail: email },
  })

  const aluno = data[0]
  if (!aluno) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE)
  }

  return { uuidAluno: aluno.uuidAluno, nome: aluno.nome, email: aluno.email, role: 'aluno' }
}

import { apiClient } from './api-client'
import type { AuthUser } from '../stores/auth-store'

export type LoginPayload = {
  email: string
  senha: string
}

export type RegisterPayload = {
  nome?: string
  email: string
  senha: string
}

export type GoogleLoginPayload = {
  idToken: string
}

type AuthResponse = {
  token: string
  user: AuthUser
}

export async function loginAluno({ email, senha }: LoginPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('/tcc-pro/auth/login', {
    email,
    password: senha,
  })

  return { ...data.user, token: data.token }
}

export async function registerAluno({ nome, email, senha }: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('/tcc-pro/auth/register', {
    nome,
    email,
    password: senha,
  })

  return { ...data.user, token: data.token }
}

export async function loginWithGoogle({ idToken }: GoogleLoginPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('/tcc-pro/auth/google', {
    idToken,
  })

  return { ...data.user, token: data.token }
}

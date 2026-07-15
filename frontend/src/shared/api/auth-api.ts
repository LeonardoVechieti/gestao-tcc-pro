import perfilMock from '../../assets/mocks/perfil.mock.json'
import { isBackendActive } from '../config/env'
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

type AuthUserPayload = Omit<AuthUser, 'token'>

export type MeResponse = {
  uuidUsuario: string
  nome?: string
  email: string
  ativo?: boolean
  emailVerified?: boolean
  createdAt?: string
  perfil?: {
    uuidPerfil?: string
    nomePerfil?: string
  }
  aluno?: {
    uuidAluno?: string
    nome?: string
    matricula?: string
    curso?: string
    telefone?: string
    semestre?: string
    situacao?: string
  }
}

export async function getMe(): Promise<MeResponse> {
  if (!isBackendActive()) {
    return perfilMock as MeResponse
  }

  const { data } = await apiClient.get<MeResponse>('/tcc-pro/auth/me')
  return data
}

export async function loginAluno({ email, senha }: LoginPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('/tcc-pro/auth/login', {
    email,
    password: senha,
  })

  return { ...data.user, token: data.token }
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUserPayload>('/tcc-pro/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { ...data, token }
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

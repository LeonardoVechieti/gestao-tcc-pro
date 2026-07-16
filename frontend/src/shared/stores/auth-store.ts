import { create } from 'zustand'

export type AuthUser = {
  uuidUsuario?: string
  uuidAluno?: string
  nome: string
  email: string
  role?: string
  roles?: string[]
  perfilNome?: string
  aluno?: {
    uuidAluno?: string
    nome?: string
    matricula?: string
    curso?: string
    telefone?: string
    semestre?: string
    situacao?: string
  }
  token: string
}

const STORAGE_KEY = 'gestaotcc:auth-user'

function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

function hydrateAuthUser(user: AuthUser): AuthUser {
  const payload = decodeJwtPayload<{ role?: string; roles?: string[]; perfil?: { nomePerfil?: string } }>(user.token)
  if (!payload) {
    return user
  }

  return {
    ...user,
    uuidAluno: user.uuidAluno ?? user.aluno?.uuidAluno,
    role: user.role ?? payload.role,
    roles: user.roles ?? payload.roles,
    perfilNome: user.perfilNome ?? payload.perfil?.nomePerfil,
  }
}

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const user = JSON.parse(raw) as AuthUser
    return hydrateAuthUser(user)
  } catch {
    return null
  }
}

type AuthState = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  login: (user) => {
    const hydrated = hydrateAuthUser(user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated))
    set({ user: hydrated })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null })
  },
}))

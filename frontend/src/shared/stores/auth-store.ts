import { create } from 'zustand'

export type AuthUser = {
  uuidUsuario?: string
  uuidAluno?: string
  nome: string
  email: string
  role: 'aluno'
  token: string
}

const STORAGE_KEY = 'gestaotcc:auth-user'

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null })
  },
}))

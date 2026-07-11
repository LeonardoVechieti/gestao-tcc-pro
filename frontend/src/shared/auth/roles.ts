import type { AuthUser } from '../stores/auth-store'

type RoleAwareUser = Pick<AuthUser, 'roles' | 'token'> | null | undefined

function parseJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

export function hasAnyRole(user: RoleAwareUser, roles: string[]): boolean {
  if (!user) {
    return false
  }

  if (Array.isArray(user.roles)) {
    return roles.some((role) => user.roles?.includes(role))
  }

  const payload = parseJwtPayload<{ roles?: string[] }>(user.token)
  return Boolean(payload?.roles?.some((role) => roles.includes(role)))
}

export function hasRole(user: RoleAwareUser, role: string): boolean {
  return hasAnyRole(user, [role])
}

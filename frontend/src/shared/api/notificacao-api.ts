import { getMe } from './auth-api'
import { apiClient } from './api-client'
import { useAuthStore } from '../stores/auth-store'

export type NotificationStatus = 'pendente' | 'lida' | 'concluida' | string

export type NotificationRow = {
  uuidTccNotificacao: string
  uuidTcc?: string | null
  uuidTemaTcc?: string | null
  uuidUsuario?: string | null
  tipo: string
  descricao?: string
  status: NotificationStatus
  linkAcao?: string
  createdAt?: string
  updatedAt?: string
}

async function getCurrentUserId(): Promise<string | undefined> {
  const storedUser = useAuthStore.getState().user
  if (storedUser?.uuidUsuario) {
    return storedUser.uuidUsuario
  }

  const me = await getMe()
  return me.uuidUsuario
}

export async function getMyNotifications(): Promise<NotificationRow[]> {
  const uuidUsuario = await getCurrentUserId()

  if (!uuidUsuario) {
    return []
  }

  const { data } = await apiClient.get<NotificationRow[]>(`/tcc-pro/notificacoes/${uuidUsuario}`)
  return data
}

export async function markNotificationAsRead(
  uuidTccNotificacao: string,
): Promise<NotificationRow> {
  const { data } = await apiClient.put<NotificationRow>(
    `/tcc-pro/notificacoes/${uuidTccNotificacao}/status`,
    { status: 'concluida' },
  )

  return data
}

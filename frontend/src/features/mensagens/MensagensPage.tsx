import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import type { TagProps } from 'primereact/tag'
import {
  getMyNotifications,
  markNotificationAsRead,
  type NotificationRow,
} from '../../shared/api/notificacao-api'

const notificationTitles: Record<string, string> = {
  ajuste_tema: 'Ajustes solicitados no tema',
  ajuste_trabalho: 'Ajustes solicitados no trabalho',
  aprovacao: 'Tema aprovado',
  cancelar_orientacao: 'Orientação cancelada',
  comentario: 'Comentário registrado',
  etapa_concluida: 'Etapa concluída',
  orientacao_aprovada: 'Orientação aceita',
  recusa: 'Solicitação recusada',
  resposta_aluno: 'Resposta do aluno',
}

function formatNotificationTitle(tipo: string): string {
  if (notificationTitles[tipo]) {
    return notificationTitles[tipo]
  }

  return tipo
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value?: string): string {
  if (!value) {
    return 'Data não informada'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getStatusSeverity(status: string): TagProps['severity'] {
  if (status === 'concluida' || status === 'lida') {
    return 'success'
  }

  return 'warning'
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    concluida: 'Lida',
    lida: 'Lida',
    pendente: 'Pendente',
  }

  return labels[status] ?? status
}

export function MensagensPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationRow[] | null>(null)
  const [error, setError] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getMyNotifications()
      .then((data) => {
        if (!cancelled) {
          setNotifications(data)
          setError(false)
        }
      })
      .catch((requestError) => {
        console.error(requestError)
        if (!cancelled) {
          setNotifications([])
          setError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const unreadCount = useMemo(
    () => notifications?.filter((notification) => notification.status === 'pendente').length ?? 0,
    [notifications],
  )

  async function handleMarkAsRead(notification: NotificationRow) {
    setUpdatingId(notification.uuidTccNotificacao)

    try {
      const updated = await markNotificationAsRead(notification.uuidTccNotificacao)
      setNotifications((current) =>
        (current ?? []).map((item) =>
          item.uuidTccNotificacao === updated.uuidTccNotificacao ? updated : item,
        ),
      )
    } finally {
      setUpdatingId(null)
    }
  }

  if (!notifications) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Mensagens</h1>
          <p>Atualizações reais do fluxo de orientação e acompanhamento.</p>
        </div>
        <Tag severity={unreadCount > 0 ? 'warning' : 'success'} value={`${unreadCount} pendentes`} />
      </section>

      {error && (
        <Message
          severity="error"
          text="Não foi possível carregar suas notificações reais do backend."
        />
      )}

      {notifications.length > 0 ? (
        <section className="notification-list">
          {notifications.map((notification) => (
            <article
              className={[
                'notification-card',
                notification.status === 'pendente' && 'is-unread',
              ]
                .filter(Boolean)
                .join(' ')}
              key={notification.uuidTccNotificacao}
            >
              <div className="notification-card__icon">
                <i className="pi pi-bell" aria-hidden="true" />
              </div>
              <div>
                <header className="notification-card__header">
                  <strong>{formatNotificationTitle(notification.tipo)}</strong>
                  <Tag
                    severity={getStatusSeverity(notification.status)}
                    value={formatStatus(notification.status)}
                  />
                </header>
                <p>{notification.descricao ?? 'Atualização registrada no fluxo do TCC.'}</p>
                <small>{formatDate(notification.createdAt)}</small>
              </div>
              <div className="notification-card__actions">
                {notification.linkAcao && (
                  <Button
                    icon="pi pi-arrow-right"
                    label="Abrir"
                    onClick={() => navigate(notification.linkAcao ?? '/')}
                    outlined
                    size="small"
                  />
                )}
                {notification.status === 'pendente' && (
                  <Button
                    disabled={updatingId === notification.uuidTccNotificacao}
                    icon="pi pi-check"
                    label="Marcar como lida"
                    loading={updatingId === notification.uuidTccNotificacao}
                    onClick={() => handleMarkAsRead(notification)}
                    size="small"
                  />
                )}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="orientation-empty">
          <i className="pi pi-comments" aria-hidden="true" />
          <strong>Nenhuma mensagem real encontrada.</strong>
          <span>As notificações aparecem aqui quando houver ações no fluxo de orientação.</span>
        </section>
      )}
    </div>
  )
}

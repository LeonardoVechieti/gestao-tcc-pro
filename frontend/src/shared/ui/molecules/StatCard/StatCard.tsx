import { IconBadge, type IconBadgeTone } from '../../atoms/IconBadge'

export type StatCardProps = {
  label: string
  value: string
  icon: string
  tone: IconBadgeTone
  action?: string
  onAction?: () => void
}

export function StatCard({ label, value, icon, tone, action, onAction }: StatCardProps) {
  return (
    <article className="stat-card">
      <IconBadge icon={icon} tone={tone} size="lg" />
      <span>{label}</span>
      <strong>{value}</strong>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
          <i className="pi pi-arrow-right" aria-hidden="true" />
        </button>
      )}
    </article>
  )
}

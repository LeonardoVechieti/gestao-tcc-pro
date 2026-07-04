import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import type { TagProps } from 'primereact/tag'
import { IconBadge, type IconBadgeTone } from '../../atoms/IconBadge'

export type AlertRowProps = {
  icon: string
  tone: IconBadgeTone
  title: string
  description: string
  status: string
  statusSeverity: TagProps['severity']
  action: string
  onAction?: () => void
}

export function AlertRow({
  icon,
  tone,
  title,
  description,
  status,
  statusSeverity,
  action,
  onAction,
}: AlertRowProps) {
  return (
    <div>
      <IconBadge icon={icon} tone={tone} size="sm" />
      <strong>{title}</strong>
      <span className="muted-text">{description}</span>
      <Tag severity={statusSeverity} value={status} />
      <Button icon="pi pi-eye" label={action} onClick={onAction} text />
    </div>
  )
}

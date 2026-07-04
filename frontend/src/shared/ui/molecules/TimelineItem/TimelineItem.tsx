import { Tag } from 'primereact/tag'
import type { TagProps } from 'primereact/tag'
import { IconBadge } from '../../atoms/IconBadge'

export type TimelineItemProps = {
  title: string
  date: string
  status: string
  severity: TagProps['severity']
  icon: string
}

export function TimelineItem({ title, date, status, severity, icon }: TimelineItemProps) {
  return (
    <li>
      <IconBadge icon={icon} size="sm" />
      <div>
        <strong>{title}</strong>
        <span className="student-timeline__date muted-text">{date}</span>
      </div>
      <Tag severity={severity} value={status} />
    </li>
  )
}

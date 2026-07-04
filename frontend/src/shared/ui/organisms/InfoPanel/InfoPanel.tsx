import type { ReactNode } from 'react'
import { IconBadge } from '../../atoms/IconBadge'

type InfoPanelProps = {
  icon: string
  title: string
  children: ReactNode
}

export function InfoPanel({ icon, title, children }: InfoPanelProps) {
  return (
    <div className="info-panel">
      <div className="panel-heading">
        <IconBadge icon={icon} size="md" />
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  )
}

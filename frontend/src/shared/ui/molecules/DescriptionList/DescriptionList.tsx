import type { ReactNode } from 'react'

export type DescriptionListItem = {
  label: string
  value: ReactNode
  wide?: boolean
}

type DescriptionListProps = {
  items: DescriptionListItem[]
}

export function DescriptionList({ items }: DescriptionListProps) {
  return (
    <div className="theme-details">
      {items.map((item) => (
        <div className={item.wide ? 'theme-details__wide' : undefined} key={item.label}>
          <span className="muted-text">{item.label}</span>
          {typeof item.value === 'string' ? <strong>{item.value}</strong> : item.value}
        </div>
      ))}
    </div>
  )
}

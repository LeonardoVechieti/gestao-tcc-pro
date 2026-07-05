import type { CSSProperties } from 'react'

export type IconBadgeTone = 'blue' | 'green' | 'purple' | 'orange' | 'danger'

type IconBadgeProps = {
  icon: string
  tone?: IconBadgeTone
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<NonNullable<IconBadgeProps['size']>, CSSProperties> = {
  sm: { width: '2rem', height: '2rem', fontSize: '1rem' },
  md: { width: '2.5rem', height: '2.5rem', fontSize: '1.3rem' },
  lg: { width: '3rem', height: '3rem', fontSize: '1.5rem' },
}

export function IconBadge({ icon, tone = 'blue', size = 'md' }: IconBadgeProps) {
  return (
    <span className={`icon-badge icon-badge--${tone}`} style={sizeMap[size]}>
      <i className={icon} aria-hidden="true" />
    </span>
  )
}

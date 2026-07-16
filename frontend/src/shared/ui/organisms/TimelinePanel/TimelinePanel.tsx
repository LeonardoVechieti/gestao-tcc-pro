import { Button } from 'primereact/button'
import { TimelineItem, type TimelineItemProps } from '../../molecules/TimelineItem/TimelineItem'

type TimelinePanelProps = {
  title: string
  items: TimelineItemProps[]
  onViewAll?: () => void
  emptyText?: string
}

export function TimelinePanel({ title, items, onViewAll, emptyText }: TimelinePanelProps) {
  return (
    <div className="work-panel">
      <div className="section-title">
        <h2>{title}</h2>
        <Button label="Ver todas" link onClick={onViewAll} />
      </div>
      {items.length > 0 ? (
        <ol className="student-timeline">
          {items.map((item) => (
            <TimelineItem key={item.title} {...item} />
          ))}
        </ol>
      ) : (
        <p className="empty-state">{emptyText ?? 'Nenhum item encontrado.'}</p>
      )}
    </div>
  )
}

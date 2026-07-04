import { Button } from 'primereact/button'
import { TimelineItem, type TimelineItemProps } from '../../molecules/TimelineItem/TimelineItem'

type TimelinePanelProps = {
  title: string
  items: TimelineItemProps[]
  onViewAll?: () => void
}

export function TimelinePanel({ title, items, onViewAll }: TimelinePanelProps) {
  return (
    <div className="work-panel">
      <div className="section-title">
        <h2>{title}</h2>
        <Button label="Ver todas" link onClick={onViewAll} />
      </div>
      <ol className="student-timeline">
        {items.map((item) => (
          <TimelineItem key={item.title} {...item} />
        ))}
      </ol>
    </div>
  )
}

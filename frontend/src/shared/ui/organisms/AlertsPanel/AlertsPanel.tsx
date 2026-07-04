import { Button } from 'primereact/button'
import { AlertRow, type AlertRowProps } from '../../molecules/AlertRow/AlertRow'

type AlertsPanelProps = {
  title: string
  alerts: AlertRowProps[]
  onViewAll?: () => void
}

export function AlertsPanel({ title, alerts, onViewAll }: AlertsPanelProps) {
  return (
    <section className="work-panel">
      <div className="section-title">
        <h2>{title}</h2>
        <Button label="Ver todas" link onClick={onViewAll} />
      </div>
      <div className="student-alerts">
        {alerts.map((alert) => (
          <AlertRow key={alert.title} {...alert} />
        ))}
      </div>
    </section>
  )
}

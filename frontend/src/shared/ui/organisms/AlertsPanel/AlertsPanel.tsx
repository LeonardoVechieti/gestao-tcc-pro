import { Button } from 'primereact/button'
import { AlertRow, type AlertRowProps } from '../../molecules/AlertRow/AlertRow'

type AlertsPanelProps = {
  title: string
  alerts: AlertRowProps[]
  onViewAll?: () => void
  emptyText?: string
}

export function AlertsPanel({ title, alerts, onViewAll, emptyText }: AlertsPanelProps) {
  return (
    <section className="work-panel">
      <div className="section-title">
        <h2>{title}</h2>
        <Button label="Ver todas" link onClick={onViewAll} />
      </div>
      {alerts.length > 0 ? (
        <div className="student-alerts">
          {alerts.map((alert) => (
            <AlertRow key={alert.title} {...alert} />
          ))}
        </div>
      ) : (
        <p className="empty-state">{emptyText ?? 'Nenhum aviso encontrado.'}</p>
      )}
    </section>
  )
}

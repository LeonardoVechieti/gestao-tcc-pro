import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import type { TagProps } from 'primereact/tag'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getDashboardProfessor,
  type DashboardProfessorData,
  type ProfessorEvaluationRow,
  type ProfessorEvaluationStatus,
  type ProfessorPanelRow,
} from '../../shared/api/dashboard-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import { SummaryCards } from '../../shared/ui/organisms/SummaryCards/SummaryCards'
import { AlertsPanel } from '../../shared/ui/organisms/AlertsPanel/AlertsPanel'

const statusLabel: Record<ProfessorEvaluationStatus, string> = {
  pendente: 'Aguardando Banca',
  rascunho: 'Em Andamento',
  concluida: 'Concluído',
}

const statusSeverity: Record<ProfessorEvaluationStatus, TagProps['severity']> = {
  pendente: 'warning',
  rascunho: 'info',
  concluida: 'success',
}

function renderStatus(row: ProfessorEvaluationRow) {
  return <Tag severity={statusSeverity[row.status]} value={statusLabel[row.status]} />
}

function UpcomingPanelRow({ panel, onNavigate }: { panel: ProfessorPanelRow; onNavigate: () => void }) {
  return (
    <article className="professor-schedule-item professor-schedule-item--clickable" onClick={onNavigate}>
      <div className="professor-schedule-date">
        <strong>{panel.day}</strong>
        <span>{panel.month}</span>
      </div>
      <div>
        <strong>{panel.aluno}</strong>
        <span>{panel.titulo}</span>
        <small>
          {panel.time} - {panel.weekday}
        </small>
      </div>
      <Tag icon="pi pi-map-marker" severity="info" value={panel.local} />
    </article>
  )
}

export function ProfessorDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardProfessorData | null>(null)

  useEffect(() => {
    let cancelled = false

    getDashboardProfessor().then((result) => {
      if (!cancelled) {
        setData(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  if (!data) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  // Atualizar labels dos summary cards para refletir TCCs
  const summaryCardsWithLabels = data.summaryCards.map((card, index) => {
    const labels = [
      { label: 'Em andamento', action: 'Ver orientações' },
      { label: 'Concluídos', action: 'Ver histórico' },
      { label: 'Aguardando banca', action: 'Ver agendas' },
      { label: 'Próximas apresentações', action: 'Ver calendário' },
    ]
    return {
      ...card,
      label: labels[index]?.label || card.label,
      action: labels[index]?.action || card.action,
    }
  })

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Olá, Prof. {user?.nome ?? 'Professor'}!</h1>
          <p>Visão geral de todos os TCCs que você está orientando e suas etapas.</p>
        </div>
        <Button icon="pi pi-arrow-right" label="Gerenciar orientações" onClick={() => navigate('/orientacoes')} />
      </section>

      <SummaryCards cards={summaryCardsWithLabels} />

      <section className="table-panel professor-evaluations">
        <div className="section-title">
          <h2>Seus TCCs em orientação</h2>
          <Button label="Gerenciar detalhes" icon="pi pi-arrow-right" iconPos="right" link onClick={() => navigate('/orientacoes')} />
        </div>

        <DataTable
          dataKey="id"
          emptyMessage="Você não está orientando TCCs no momento"
          onRowClick={() => navigate('/orientacoes')}
          paginator
          rows={10}
          rowClassName={() => 'cursor-pointer'}
          selectionMode="single"
          value={data.evaluationRows}
        >
          <Column field="aluno" header="Aluno" />
          <Column field="tcc" header="Título do TCC" />
          <Column field="apresentacao" header="Data Apresentação" style={{ width: '14rem' }} />
          <Column body={renderStatus} header="Situação" style={{ width: '10rem' }} />
          <Column field="nota" header="Nota Final" style={{ width: '8rem' }} />
        </DataTable>
      </section>

      <section className="professor-dashboard-grid">
        <div className="work-panel">
          <div className="section-title">
            <h2>Próximas apresentações (próximos 7 dias)</h2>
            <Button label="Ver agendamento" icon="pi pi-calendar" iconPos="right" link onClick={() => navigate('/orientacoes')} />
          </div>
          <div className="professor-schedule-list">
            {data.upcomingPanels.length > 0 ? (
              data.upcomingPanels.map((panel) => (
                <UpcomingPanelRow
                  key={panel.id}
                  panel={panel}
                  onNavigate={() => navigate('/orientacoes')}
                />
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
                Sem apresentações agendadas para os próximos 7 dias
              </p>
            )}
          </div>
        </div>

        <AlertsPanel title="Atenção" alerts={data.alerts} />
      </section>
    </div>
  )
}

import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardAluno, type DashboardAlunoData } from '../../shared/api/dashboard-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import { DescriptionList } from '../../shared/ui/molecules/DescriptionList/DescriptionList'
import { SummaryCards } from '../../shared/ui/organisms/SummaryCards/SummaryCards'
import { TimelinePanel } from '../../shared/ui/organisms/TimelinePanel/TimelinePanel'
import { AlertsPanel } from '../../shared/ui/organisms/AlertsPanel/AlertsPanel'

export function AlunoDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardAlunoData | null>(null)

  useEffect(() => {
    let cancelled = false

    getDashboardAluno().then((result) => {
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

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Ola, {user?.nome ?? 'aluno'}!</h1>
          <p>Acompanhe o andamento do seu Trabalho de Conclusão de Curso.</p>
        </div>
        <Button icon="pi pi-file-edit" label="Registrar tema" onClick={() => navigate('/tema')} />
      </section>

      <SummaryCards cards={data.summaryCards} />

      <section className="student-dashboard-grid">
        <div className="work-panel">
          <div className="section-title">
            <h2>Meu Tema</h2>
            <Button label="Ver detalhes" link />
          </div>
          <DescriptionList
            items={[
              { label: 'Titulo do tema', value: data.meuTema.titulo, wide: true },
              { label: 'Area de interesse', value: data.meuTema.areaInteresse },
              { label: 'Orientador', value: data.meuTema.orientador },
              { label: 'Ultima atualizacao', value: data.meuTema.ultimaAtualizacao },
              {
                label: 'Status atual',
                value: (
                  <Tag
                    severity={data.meuTema.statusAtual.severity}
                    value={data.meuTema.statusAtual.label}
                  />
                ),
              },
            ]}
          />
        </div>

        <TimelinePanel title="Linha do Tempo" items={data.timelineItems} />
      </section>

      <AlertsPanel title="Avisos e pendencias" alerts={data.alerts} />
    </div>
  )
}

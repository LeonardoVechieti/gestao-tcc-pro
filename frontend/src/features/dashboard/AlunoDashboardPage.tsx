import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
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
import { DraggablePanels } from '../../shared/ui/organisms/DraggablePanels/DraggablePanels'

// Rota para onde cada card de resumo deve levar. Mapeado pelo label porque os
// dados vêm da API/mock sem uma rota associada.
const summaryCardRoutes: Record<string, string> = {
  'Tema atual': '/tema',
  Status: '/tccs',
  'Próxima Entrega': '/cronograma',
  Apresentação: '/apresentacao',
}

// Idem para os avisos: mapeado pelo texto da ação, único dado disponível na
// origem que indica a intenção do botão.
const alertActionRoutes: Record<string, string> = {
  'Ver detalhes': '/tema',
  'Enviar agora': '/documentos',
  'Ler mensagem': '/mensagens',
}

export function AlunoDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardAlunoData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    getDashboardAluno()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(false)
        }
      })
      .catch((requestError) => {
        console.error(requestError)
        if (!cancelled) {
          setError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="page-stack">
        <section className="page-header">
          <div>
            <h1>Olá, {user?.nome ?? 'aluno'}!</h1>
            <p>Acompanhe o andamento do seu Trabalho de Conclusão de Curso.</p>
          </div>
        </section>
        <Message
          severity="error"
          text="Não foi possível carregar o dashboard do aluno agora."
        />
      </div>
    )
  }

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
          <h1>Olá, {user?.nome ?? 'aluno'}!</h1>
          <p>Acompanhe o andamento do seu Trabalho de Conclusão de Curso.</p>
        </div>
        <Button icon="pi pi-file-edit" label="Registrar tema" onClick={() => navigate('/tema')} />
      </section>

      <SummaryCards
        cards={data.summaryCards.map((card) => ({
          ...card,
          onAction: summaryCardRoutes[card.label]
            ? () => navigate(summaryCardRoutes[card.label])
            : undefined,
        }))}
      />

      <DraggablePanels
        className="student-dashboard-grid"
        panels={[
          {
            id: 'meu-tema',
            content: (
              <div className="work-panel">
                <div className="section-title">
                  <h2>Meu tema</h2>
                  <Button label="Ver detalhes" link onClick={() => navigate('/tema')} />
                </div>
                <DescriptionList
                  items={[
                    { label: 'Título do tema', value: data.meuTema.titulo, wide: true },
                    { label: 'Área de interesse', value: data.meuTema.areaInteresse },
                    { label: 'Orientador', value: data.meuTema.orientador },
                    { label: 'Última atualização', value: data.meuTema.ultimaAtualizacao },
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
            ),
          },
          {
            id: 'linha-tempo',
            content: (
              <TimelinePanel
                emptyText="Nenhuma etapa real cadastrada para o seu TCC."
                onViewAll={() => navigate('/tccs')}
                title="Linha do tempo"
                items={data.timelineItems}
              />
            ),
          },
          {
            id: 'avisos-pendencias',
            content: (
              <AlertsPanel
                emptyText="Nenhum aviso real registrado para o seu TCC."
                onViewAll={() => navigate('/mensagens')}
                title="Avisos e pendências"
                alerts={data.alerts.map((alert) => {
                  const route = alert.target ?? alertActionRoutes[alert.action]

                  return {
                    ...alert,
                    onAction: route ? () => navigate(route) : undefined,
                  }
                })}
              />
            ),
          },
        ]}
      />
    </div>
  )
}

import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { useNavigate } from 'react-router-dom'

const summaryCards = [
  {
    label: 'Tema Atual',
    value: 'Marketing Digital e Comportamento do Consumidor',
    icon: 'pi pi-book',
    action: 'Ver detalhes',
    tone: 'blue',
  },
  {
    label: 'Status',
    value: 'Em revisao',
    icon: 'pi pi-check-circle',
    action: 'Ver andamento',
    tone: 'green',
  },
  {
    label: 'Proxima Entrega',
    value: '05/06/2025',
    icon: 'pi pi-calendar',
    action: 'Ver cronograma',
    tone: 'purple',
  },
  {
    label: 'Apresentacao',
    value: '22/06/2025',
    icon: 'pi pi-clipboard',
    action: 'Ver detalhes',
    tone: 'orange',
  },
]

const timelineItems = [
  {
    title: 'Tema enviado',
    date: '02/04/2025 as 15:45',
    status: 'Concluido',
    severity: 'success' as const,
    icon: 'pi pi-check',
  },
  {
    title: 'Em revisao pelo orientador',
    date: '05/05/2025 as 09:20',
    status: 'Em andamento',
    severity: 'info' as const,
    icon: 'pi pi-clock',
  },
  {
    title: 'Orientador vinculado',
    date: '10/04/2025 as 11:10',
    status: 'Concluido',
    severity: 'success' as const,
    icon: 'pi pi-check',
  },
  {
    title: 'Apresentacao agendada',
    date: '15/05/2025 as 16:30',
    status: 'Agendado',
    severity: 'warning' as const,
    icon: 'pi pi-calendar',
  },
]

const alerts = [
  {
    type: 'Ajustes solicitados',
    description: 'Orientador solicitou ajustes na metodologia e nos objetivos especificos.',
    status: 'Pendente',
    icon: 'pi pi-exclamation-circle danger',
    action: 'Ver detalhes',
  },
  {
    type: 'Documentos pendentes',
    description: 'Enviar o Termo de Autorizacao de Publicacao preenchido e assinado.',
    status: 'Pendente',
    icon: 'pi pi-file warning',
    action: 'Enviar agora',
  },
  {
    type: 'Comentario do orientador',
    description: 'Bom trabalho ate aqui. Atente-se aos ajustes sugeridos na metodologia.',
    status: 'Novo',
    icon: 'pi pi-comments info',
    action: 'Ler mensagem',
  },
]

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Ola, Joao Silva!</h1>
          <p>Acompanhe o andamento do seu Trabalho de Conclusao de Curso.</p>
        </div>
        <Button icon="pi pi-file-edit" label="Registrar tema" onClick={() => navigate('/tema')} />
      </section>

      <section className="student-summary-grid" aria-label="Resumo do TCC">
        {summaryCards.map((card) => (
          <article className={`stat-card stat-card--${card.tone}`} key={card.label}>
            <i className={card.icon} aria-hidden="true" />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <button type="button">
              {card.action}
              <i className="pi pi-arrow-right" aria-hidden="true" />
            </button>
          </article>
        ))}
      </section>

      <section className="student-dashboard-grid">
        <div className="work-panel">
          <div className="section-title">
            <h2>Meu Tema</h2>
            <Button label="Ver detalhes" link />
          </div>
          <div className="theme-details">
            <div className="theme-details__wide">
              <span>Titulo do tema</span>
              <strong>Marketing Digital e Comportamento do Consumidor no Varejo Online</strong>
            </div>
            <div>
              <span>Area de interesse</span>
              <strong>Marketing</strong>
            </div>
            <div>
              <span>Orientador</span>
              <strong>Profa. Ana Paula Costa</strong>
            </div>
            <div>
              <span>Ultima atualizacao</span>
              <strong>20/05/2025 as 10:30</strong>
            </div>
            <div>
              <span>Status atual</span>
              <Tag severity="success" value="Em revisao" />
            </div>
          </div>
        </div>

        <div className="work-panel">
          <div className="section-title">
            <h2>Linha do Tempo</h2>
            <Button label="Ver todas" link />
          </div>
          <ol className="student-timeline">
            {timelineItems.map((item) => (
              <li key={item.title}>
                <i className={item.icon} aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
                <Tag severity={item.severity} value={item.status} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="work-panel">
        <div className="section-title">
          <h2>Avisos e pendencias</h2>
          <Button label="Ver todas" link />
        </div>
        <div className="student-alerts">
          {alerts.map((alert) => (
            <div key={alert.type}>
              <i className={alert.icon} aria-hidden="true" />
              <strong>{alert.type}</strong>
              <span>{alert.description}</span>
              <Tag severity={alert.status === 'Novo' ? 'info' : 'danger'} value={alert.status} />
              <Button icon="pi pi-eye" label={alert.action} text />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Message } from 'primereact/message'
import { ProgressBar } from 'primereact/progressbar'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import {
  formatStageStatus,
  getCronogramaTccs,
  getStageSeverity,
  type CronogramaResponse,
  type CronogramaStage,
  type CronogramaTcc,
} from '../../shared/api/cronograma-api'
import { getFeriadosByYear, type Feriado } from '../../shared/api/feriado-api'

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const EMPTY_CRONOGRAMAS: CronogramaTcc[] = []

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
  isWeekend: boolean
}

type SummaryItem = {
  label: string
  value: string
  detail: string
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildMonthGrid(reference: Date): CalendarDay[] {
  const year = reference.getFullYear()
  const month = reference.getMonth()

  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  const totalCells = 42
  const days: CalendarDay[] = []

  for (let i = 0; i < totalCells; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    const dayOfWeek = date.getDay()
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    })
  }

  return days
}

function parseDateOnly(value?: string): Date | null {
  if (!value || value === 'A definir') {
    return null
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function getStageIcon(stage: CronogramaStage): string {
  if (stage.status === 'concluida') {
    return 'pi pi-check'
  }

  if (stage.isAtual) {
    return 'pi pi-clock'
  }

  return 'pi pi-circle'
}

function getScopeDescription(scope?: CronogramaResponse['scope']): string {
  if (scope === 'professor') {
    return 'Prazos reais dos TCCs orientados por você.'
  }

  if (scope === 'aluno') {
    return 'Prazos reais do seu TCC.'
  }

  return 'Prazos reais dos TCCs registrados no sistema.'
}

function getOpenStages(cronogramas: CronogramaTcc[]): CronogramaStage[] {
  return cronogramas
    .flatMap((cronograma) => cronograma.etapas)
    .filter((stage) => stage.status !== 'concluida')
}

function getNearestStage(cronogramas: CronogramaTcc[]): CronogramaStage | undefined {
  return getOpenStages(cronogramas)
    .filter((stage) => stage.diasRestantes !== null)
    .sort((current, next) => {
      const currentDays = current.diasRestantes ?? Number.MAX_SAFE_INTEGER
      const nextDays = next.diasRestantes ?? Number.MAX_SAFE_INTEGER
      return currentDays - nextDays
    })[0]
}

function buildSummary(cronogramas: CronogramaTcc[]): SummaryItem[] {
  const stages = cronogramas.flatMap((cronograma) => cronograma.etapas)
  const openStages = getOpenStages(cronogramas)
  const overdueStages = openStages.filter((stage) => stage.deadlineState === 'atrasada')
  const nearestStage = getNearestStage(cronogramas)

  return [
    {
      label: 'TCCs',
      value: String(cronogramas.length),
      detail: cronogramas.length === 1 ? 'cronograma ativo' : 'cronogramas ativos',
    },
    {
      label: 'Etapas',
      value: `${stages.filter((stage) => stage.status === 'concluida').length}/${stages.length}`,
      detail: 'concluídas',
    },
    {
      label: 'Próximo prazo',
      value: nearestStage?.prazoLabel ?? 'A definir',
      detail: nearestStage?.titulo ?? 'sem etapa aberta com data',
    },
    {
      label: 'Atrasos',
      value: String(overdueStages.length),
      detail: overdueStages.length === 1 ? 'etapa atrasada' : 'etapas atrasadas',
    },
  ]
}

export function CronogramaPage() {
  const [referenceDate, setReferenceDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [cronograma, setCronograma] = useState<CronogramaResponse | null>(null)
  const [selectedCronogramaId, setSelectedCronogramaId] = useState('todos')
  const [feriados, setFeriados] = useState<Feriado[]>([])
  const [isScheduleLoading, setIsScheduleLoading] = useState(true)
  const [isCalendarLoading, setIsCalendarLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const didSetInitialMonth = useRef(false)

  useEffect(() => {
    let cancelled = false
    setIsScheduleLoading(true)

    getCronogramaTccs()
      .then((data) => {
        if (cancelled) {
          return
        }

        setCronograma(data)
        setHasError(false)

        const firstDeadline = data.cronogramas
          .flatMap((item) => item.etapas)
          .map((stage) => parseDateOnly(stage.prazo))
          .find((date): date is Date => Boolean(date))

        if (firstDeadline && !didSetInitialMonth.current) {
          setReferenceDate(new Date(firstDeadline.getFullYear(), firstDeadline.getMonth(), 1))
          didSetInitialMonth.current = true
        }
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) {
          setCronograma({ scope: 'coordenacao', cronogramas: [] })
          setHasError(true)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsScheduleLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsCalendarLoading(true)

    getFeriadosByYear(referenceDate.getFullYear())
      .then((data) => {
        if (!cancelled) {
          setFeriados(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeriados([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCalendarLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [referenceDate])

  const feriadoPorData = useMemo(() => {
    return new Map(feriados.map((feriado) => [feriado.date, feriado.name]))
  }, [feriados])

  const cronogramas = cronograma?.cronogramas ?? EMPTY_CRONOGRAMAS
  const visibleCronogramas = useMemo(() => {
    if (selectedCronogramaId === 'todos') {
      return cronogramas
    }

    return cronogramas.filter((item) => item.id === selectedCronogramaId)
  }, [cronogramas, selectedCronogramaId])
  const summary = useMemo(() => buildSummary(visibleCronogramas), [visibleCronogramas])
  const cronogramaOptions = useMemo(
    () => [
      { label: 'Todos os TCCs', value: 'todos' },
      ...cronogramas.map((item) => ({
        label: `${item.aluno} - ${item.titulo}`,
        value: item.id,
      })),
    ],
    [cronogramas],
  )
  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, CronogramaStage[]>()

    cronogramas.forEach((item) => {
      item.etapas.forEach((stage) => {
        const date = parseDateOnly(stage.prazo)
        if (!date) {
          return
        }

        const dateKey = toDateKey(date)
        const stages = map.get(dateKey) ?? []
        stages.push(stage)
        map.set(dateKey, stages)
      })
    })

    return map
  }, [cronogramas])
  const days = useMemo(() => buildMonthGrid(referenceDate), [referenceDate])
  const todayKey = toDateKey(new Date())

  function goToPreviousMonth() {
    setReferenceDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setReferenceDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  function goToToday() {
    const today = new Date()
    setReferenceDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  if (isScheduleLoading || !cronograma) {
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
          <h1>Cronograma</h1>
          <p>{getScopeDescription(cronograma.scope)}</p>
        </div>
      </section>

      {hasError && (
        <Message
          severity="error"
          text="Não foi possível carregar o cronograma real do backend."
        />
      )}

      {cronogramas.length > 0 ? (
        <>
          <section className="calendar-panel">
            <header className="calendar-panel__toolbar">
              <div className="calendar-panel__month-nav">
                <Button
                  aria-label="Mês anterior"
                  icon="pi pi-chevron-left"
                  onClick={goToPreviousMonth}
                  rounded
                  text
                />
                <strong className="calendar-panel__month-label">
                  {MONTH_LABELS[referenceDate.getMonth()]} {referenceDate.getFullYear()}
                </strong>
                <Button
                  aria-label="Próximo mês"
                  icon="pi pi-chevron-right"
                  onClick={goToNextMonth}
                  rounded
                  text
                />
              </div>

              <Button label="Hoje" onClick={goToToday} outlined size="small" />
            </header>

            <div className="calendar-panel__legend">
              <span className="calendar-legend-item">
                <i className="calendar-legend-swatch calendar-legend-swatch--weekend" />
                Final de semana
              </span>
              <span className="calendar-legend-item">
                <i className="calendar-legend-swatch calendar-legend-swatch--holiday" />
                Feriado
              </span>
              <span className="calendar-legend-item">
                <i className="calendar-legend-swatch calendar-legend-swatch--deadline" />
                Prazo do TCC
              </span>
            </div>

            {isCalendarLoading ? (
              <div className="page-loading">
                <ProgressSpinner strokeWidth="4" style={{ width: '2.5rem', height: '2.5rem' }} />
              </div>
            ) : (
              <div className="calendar-grid">
                {WEEKDAY_LABELS.map((label) => (
                  <div className="calendar-grid__weekday" key={label}>
                    {label}
                  </div>
                ))}

                {days.map((day) => {
                  const dateKey = toDateKey(day.date)
                  const feriadoNome = feriadoPorData.get(dateKey)
                  const isHoliday = Boolean(feriadoNome)
                  const deadlines = deadlinesByDate.get(dateKey) ?? []
                  const hasDeadline = deadlines.length > 0

                  return (
                    <div
                      className={[
                        'calendar-day',
                        !day.isCurrentMonth && 'calendar-day--muted',
                        day.isWeekend && 'calendar-day--weekend',
                        isHoliday && 'calendar-day--holiday',
                        hasDeadline && 'calendar-day--deadline',
                        dateKey === todayKey && 'calendar-day--today',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={`${dateKey}-${day.isCurrentMonth ? 'current' : 'adjacent'}`}
                      title={[feriadoNome, ...deadlines.map((stage) => stage.titulo)]
                        .filter(Boolean)
                        .join(' • ')}
                    >
                      <span className="calendar-day__number">{day.date.getDate()}</span>
                      {isHoliday && <span className="calendar-day__label">{feriadoNome}</span>}
                      {hasDeadline && (
                        <span className="calendar-day__label calendar-day__label--deadline">
                          {deadlines.length === 1 ? deadlines[0].titulo : `${deadlines.length} prazos`}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="cronograma-summary-grid">
            {summary.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </article>
            ))}
          </section>

          {cronogramas.length > 1 && (
            <section className="cronograma-toolbar">
              <Dropdown
                className="cronograma-selector"
                onChange={(event) => setSelectedCronogramaId(event.value)}
                options={cronogramaOptions}
                value={selectedCronogramaId}
              />
            </section>
          )}

          <section className="cronograma-list">
            {visibleCronogramas.map((item) => (
              <article className="cronograma-card" key={item.id}>
                <header className="cronograma-card__header">
                  <div>
                    <Tag severity="info" value={item.aluno} />
                    <h2>{item.titulo}</h2>
                    <p>
                      Orientador: {item.orientador} • Etapa atual: {item.etapaAtual}
                    </p>
                  </div>
                  <Tag value={`${item.progresso}%`} severity="info" />
                </header>

                <ProgressBar showValue={false} value={item.progresso} />

                <div className="cronograma-stage-list">
                  {item.etapas.map((stage) => (
                    <div
                      className={[
                        'cronograma-stage-row',
                        stage.isAtual && 'is-current',
                        stage.deadlineState === 'atrasada' && 'is-overdue',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={stage.id}
                    >
                      <span className="cronograma-stage-row__icon">
                        <i className={getStageIcon(stage)} aria-hidden="true" />
                      </span>
                      <div>
                        <strong>{stage.titulo}</strong>
                        <span>Prazo: {stage.prazoLabel}</span>
                      </div>
                      <Tag severity={getStageSeverity(stage)} value={formatStageStatus(stage.status)} />
                      <span className="cronograma-stage-row__days">{stage.diasTexto}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className="orientation-empty">
          <i className="pi pi-calendar" aria-hidden="true" />
          <strong>Nenhum cronograma real encontrado.</strong>
          <span>As etapas aparecem quando o tema aprovado gera um TCC com timeline.</span>
        </section>
      )}

    </div>
  )
}

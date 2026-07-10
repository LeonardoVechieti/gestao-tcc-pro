import { useEffect, useMemo, useState } from 'react'
import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'
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

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
  isWeekend: boolean
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

export function CronogramaPage() {
  const [referenceDate, setReferenceDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [feriados, setFeriados] = useState<Feriado[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

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
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [referenceDate])

  const feriadoPorData = useMemo(() => {
    return new Map(feriados.map((feriado) => [feriado.date, feriado.name]))
  }, [feriados])

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

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Cronograma</h1>
          <p>Acompanhe feriados, finais de semana e datas importantes do TCC.</p>
        </div>
      </section>

      <section className="calendar-panel">
        <header className="calendar-panel__toolbar">
          <div className="calendar-panel__month-nav">
            <Button
              aria-label="Mes anterior"
              icon="pi pi-chevron-left"
              onClick={goToPreviousMonth}
              rounded
              text
            />
            <strong className="calendar-panel__month-label">
              {MONTH_LABELS[referenceDate.getMonth()]} {referenceDate.getFullYear()}
            </strong>
            <Button
              aria-label="Proximo mes"
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
        </div>

        {isLoading ? (
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

              return (
                <div
                  className={[
                    'calendar-day',
                    !day.isCurrentMonth && 'calendar-day--muted',
                    day.isWeekend && 'calendar-day--weekend',
                    isHoliday && 'calendar-day--holiday',
                    dateKey === todayKey && 'calendar-day--today',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={dateKey}
                  title={feriadoNome}
                >
                  <span className="calendar-day__number">{day.date.getDate()}</span>
                  {isHoliday && <span className="calendar-day__label">{feriadoNome}</span>}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

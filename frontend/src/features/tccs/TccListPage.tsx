import { useEffect, useMemo, useReducer, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { getTccList, type TccRow } from '../../shared/api/tcc-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import {
  initialTccFilters,
  tccFiltersReducer,
  type TccStatus,
} from './tcc-filter-reducer'

type TccStatusSeverity = 'info' | 'warning' | 'success' | 'danger' | 'secondary'

const knownStatusLabels: Record<string, string> = {
  ajustes_solicitados: 'Ajustes solicitados',
  aprovado: 'Aprovado',
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  banca: 'Banca',
  concluido: 'Concluído',
  concluida: 'Concluída',
  sem_status: 'Sem status',
}

function normalizeKey(value?: string): string {
  return value?.toLowerCase().trim().replace(/\s+/g, '_') ?? ''
}

function formatStatusLabel(status?: string): string {
  const key = normalizeKey(status)

  if (knownStatusLabels[key]) {
    return knownStatusLabels[key]
  }

  return key
    ? key
        .split('_')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Sem status'
}

function getStatusSeverity(status?: string): TccStatusSeverity {
  const key = normalizeKey(status)

  if (key.includes('ajuste') || key.includes('recus') || key.includes('cancel')) {
    return 'danger'
  }

  if (key.includes('concluid') || key.includes('aprovad')) {
    return 'success'
  }

  if (key.includes('banca') || key.includes('pendente')) {
    return 'warning'
  }

  if (key === 'sem_status') {
    return 'secondary'
  }

  return 'info'
}

function normalizeProfileName(profileName?: string): string {
  return (
    profileName
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

function getHeaderDescription(profileName?: string): string {
  const normalizedProfile = normalizeProfileName(profileName)

  if (normalizedProfile === 'aluno') {
    return 'Seu TCC registrado no sistema.'
  }

  if (normalizedProfile === 'professor') {
    return 'TCCs orientados por você.'
  }

  return 'Trabalhos registrados no sistema.'
}

export function TccListPage() {
  const [filters, dispatch] = useReducer(tccFiltersReducer, initialTccFilters)
  const [tccs, setTccs] = useState<TccRow[] | null>(null)
  const [hasError, setHasError] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    let cancelled = false

    getTccList()
      .then((result) => {
        if (!cancelled) {
          setTccs(result)
          setHasError(false)
        }
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) {
          setTccs([])
          setHasError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const statusOptions = useMemo<{ label: string; value: TccStatus }[]>(() => {
    const uniqueStatuses = new Set<string>()

    tccs?.forEach((tcc) => {
      uniqueStatuses.add(tcc.status)
    })

    return [
      { label: 'Todos', value: 'todos' },
      ...Array.from(uniqueStatuses).map((status) => ({
        label: formatStatusLabel(status),
        value: status,
      })),
    ]
  }, [tccs])

  const filteredTccs = useMemo(() => {
    return (tccs ?? []).filter((tcc) => {
      const matchesStatus = filters.status === 'todos' || tcc.status === filters.status
      const normalizedSearch = filters.search.trim().toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [tcc.aluno, tcc.titulo, tcc.orientador, tcc.id]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [filters, tccs])

  if (!tccs) {
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
          <Tag value="Gestão" severity="info" />
          <h1>TCCs</h1>
          <p>{getHeaderDescription(user?.perfilNome ?? user?.role)}</p>
        </div>
      </section>

      <section className="table-panel">
        {hasError && (
          <Message
            severity="error"
            text="Não foi possível carregar os TCCs reais do backend."
          />
        )}

        <div className="table-toolbar">
          <span className="p-input-icon-left search-field">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              onChange={(event) =>
                dispatch({ type: 'search_changed', value: event.target.value })
              }
              placeholder="Buscar"
              value={filters.search}
            />
          </span>

          <Dropdown
            className="status-filter"
            onChange={(event) =>
              dispatch({ type: 'status_changed', value: event.value as TccStatus })
            }
            options={statusOptions}
            value={filters.status}
          />

          <Button
            icon="pi pi-filter-slash"
            label="Limpar"
            onClick={() => dispatch({ type: 'cleared' })}
            outlined
          />
        </div>

        <DataTable
          dataKey="id"
          emptyMessage="Nenhum TCC encontrado"
          paginator
          rows={5}
          value={filteredTccs}
        >
          <Column field="id" header="Código" style={{ width: '8rem' }} />
          <Column field="aluno" header="Aluno" />
          <Column field="titulo" header="Título" />
          <Column field="orientador" header="Orientador" />
          <Column
            body={(row: TccRow) => (
              <Tag
                severity={getStatusSeverity(row.status)}
                value={formatStatusLabel(row.status)}
              />
            )}
            header="Status"
            style={{ width: '11rem' }}
          />
        </DataTable>
      </section>
    </div>
  )
}

import { useEffect, useMemo, useReducer, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { getTccList, type TccRow } from '../../shared/api/tcc-api'
import {
  initialTccFilters,
  tccFiltersReducer,
  type TccStatus,
} from './tcc-filter-reducer'

const statusOptions: { label: string; value: TccStatus }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Banca', value: 'banca' },
  { label: 'Concluido', value: 'concluido' },
]

const statusLabel: Record<TccRow['status'], string> = {
  em_andamento: 'Em andamento',
  banca: 'Banca',
  concluido: 'Concluido',
}

const statusSeverity: Record<TccRow['status'], 'info' | 'warning' | 'success'> = {
  em_andamento: 'info',
  banca: 'warning',
  concluido: 'success',
}

export function TccListPage() {
  const [filters, dispatch] = useReducer(tccFiltersReducer, initialTccFilters)
  const [tccs, setTccs] = useState<TccRow[] | null>(null)

  useEffect(() => {
    let cancelled = false

    getTccList().then((result) => {
      if (!cancelled) {
        setTccs(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

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
          <Tag value="Gestao" severity="info" />
          <h1>TCCs</h1>
          <p>Trabalhos cadastrados, orientadores e situacao atual.</p>
        </div>
        <Button icon="pi pi-plus" label="Cadastrar" />
      </section>

      <section className="table-panel">
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
          <Column field="id" header="Codigo" style={{ width: '8rem' }} />
          <Column field="aluno" header="Aluno" />
          <Column field="titulo" header="Titulo" />
          <Column field="orientador" header="Orientador" />
          <Column
            body={(row: TccRow) => (
              <Tag severity={statusSeverity[row.status]} value={statusLabel[row.status]} />
            )}
            header="Status"
            style={{ width: '11rem' }}
          />
        </DataTable>
      </section>
    </div>
  )
}

import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { getPerfis, type PerfilRow } from '../../shared/api/admin-api'

export function PerfisPage() {
  const [perfis, setPerfis] = useState<PerfilRow[] | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const toast = useRef<Toast | null>(null)

  useEffect(() => {
    let cancelled = false

    getPerfis().then((data) => {
      if (!cancelled) {
        setPerfis(data)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredPerfis = useMemo(() => {
    return (perfis ?? []).filter((perfil) => {
      const normalized = search.trim().toLowerCase()
      return (
        normalized.length === 0 ||
        [perfil.nomePerfil]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      )
    })
  }, [search, perfis])

  if (!perfis) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <Toast ref={toast} />
      <section className="page-header">
        <div>
          <h1>Perfis</h1>
          <p>Gerencie perfis do sistema e estabeleça regras para cada cargo.</p>
        </div>
        <Button label="Novo perfil" icon="pi pi-plus" onClick={() => navigate('/admin/perfis/novo')} />
      </section>

      <section className="table-panel">
        <div className="table-toolbar">
          <span className="p-input-icon-left search-field">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              placeholder="Buscar perfis"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </div>

        <DataTable
          dataKey="uuidPerfil"
          emptyMessage="Nenhum perfil encontrado"
          paginator
          rows={8}
          value={filteredPerfis}
        >
          <Column field="nomePerfil" header="Nome do perfil" />
          <Column
            body={(perfil: PerfilRow) => (
              <Button
                className="p-button-text"
                icon="pi pi-pencil"
                label="Editar"
                onClick={() => navigate(`/admin/perfis/${perfil.uuidPerfil}`)}
              />
            )}
            header="Ações"
            style={{ width: '10rem' }}
          />
        </DataTable>
      </section>
    </div>
  )
}

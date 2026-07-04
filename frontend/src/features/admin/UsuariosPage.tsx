import { useEffect, useMemo, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { useNavigate } from 'react-router-dom'
import { getUsuarios, type UsuarioRow } from '../../shared/api/admin-api'

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioRow[] | null>(null)
  const [search, setSearch] = useState('')
  const toast = useRef<Toast | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    getUsuarios().then((data) => {
      if (!cancelled) {
        setUsuarios(data)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredUsuarios = useMemo(() => {
    return (usuarios ?? []).filter((usuario) => {
      const normalized = search.trim().toLowerCase()
      return (
        normalized.length === 0 ||
        [usuario.nome, usuario.email, usuario.perfil?.nomePerfil, usuario.aluno?.nome]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      )
    })
  }, [search, usuarios])

  if (!usuarios) {
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
          <h1>Usuários</h1>
          <p>Listagem de usuários do sistema com filtro rápido por nome, e-mail ou perfil.</p>
        </div>
      </section>

      <section className="table-panel">
        <div className="table-toolbar">
          <span className="p-input-icon-left search-field">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              placeholder="Buscar usuários"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </div>

        <DataTable
          dataKey="uuidUsuario"
          emptyMessage="Nenhum usuário encontrado"
          paginator
          rows={8}
          value={filteredUsuarios}
        >
          <Column field="nome" header="Nome" />
          <Column field="email" header="E-mail" />
          <Column
            header="Perfil"
            body={(row: UsuarioRow) => row.perfil?.nomePerfil ?? '—'}
          />
          <Column
            header="Aluno vinculado"
            body={(row: UsuarioRow) => row.aluno?.nome ?? '—'}
          />
          <Column
            body={(row: UsuarioRow) => (row.ativo ? 'Ativo' : 'Inativo')}
            header="Status"
            style={{ width: '8rem' }}
          />
          <Column
            body={(row: UsuarioRow) => (
              <div className="table-actions">
                <Button
                  className="p-button-text"
                  icon="pi pi-search"
                  label="Ver"
                  onClick={() => navigate(`/admin/usuarios/${row.uuidUsuario}`)}
                />
              </div>
            )}
            header="Ações"
            style={{ width: '12rem' }}
          />
        </DataTable>
      </section>
    </div>
  )
}

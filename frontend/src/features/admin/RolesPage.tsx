import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { deleteRole, getRoles, type RoleRow } from '../../shared/api/admin-api'
import { getApiErrorMessage } from '../../shared/api/api-errors'

export function RolesPage() {
  const [roles, setRoles] = useState<RoleRow[] | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const toast = useRef<Toast | null>(null)

  useEffect(() => {
    let cancelled = false

    getRoles().then((data) => {
      if (!cancelled) {
        setRoles(data)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredRoles = useMemo(() => {
    return (roles ?? []).filter((role) => {
      const normalized = search.trim().toLowerCase()
      return (
        normalized.length === 0 ||
        [role.desRole, role.codRole]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      )
    })
  }, [search, roles])

  async function removeRole(role: RoleRow) {
    try {
      await deleteRole(role.uuidRole)
      setRoles((current) => current?.filter((item) => item.uuidRole !== role.uuidRole) ?? null)
      toast.current?.show({
        severity: 'success',
        summary: 'Role removida',
        detail: 'A role foi removida com sucesso.',
        life: 3000,
      })
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao remover',
        detail: getApiErrorMessage(error, 'Não foi possível remover a role.'),
        life: 5000,
      })
    }
  }

  function handleDeleteRole(role: RoleRow) {
    confirmDialog({
      header: 'Remover role',
      message: `Remover "${role.desRole}"? Roles vinculadas a perfis são protegidas pelo sistema.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => void removeRole(role),
    })
  }

  if (!roles) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <Toast ref={toast} />
      <ConfirmDialog />
      <section className="page-header">
        <div>
          <h1>Roles</h1>
          <p>Crie roles auxiliares e preserve códigos já vinculados a perfis.</p>
        </div>
        <Button label="Nova role" icon="pi pi-plus" onClick={() => navigate('/admin/roles/novo')} />
      </section>

      <section className="table-panel">
        <div className="table-toolbar">
          <span className="p-input-icon-left search-field">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              placeholder="Buscar roles"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </div>

        <DataTable
          dataKey="uuidRole"
          emptyMessage="Nenhuma role encontrada"
          paginator
          rows={8}
          value={filteredRoles}
        >
          <Column field="desRole" header="Descrição" />
          <Column field="codRole" header="Código" style={{ width: '12rem' }} />
          <Column
            body={(role: RoleRow) => (
              <div className="table-actions">
                <Button
                  className="p-button-text"
                  icon="pi pi-pencil"
                  label="Editar"
                  onClick={() => navigate(`/admin/roles/${role.uuidRole}`)}
                />
                <Button
                  className="p-button-text p-button-danger"
                  icon="pi pi-trash"
                  label="Remover"
                  onClick={() => handleDeleteRole(role)}
                />
              </div>
            )}
            header="Ações"
            style={{ width: '18rem' }}
          />
        </DataTable>
      </section>
    </div>
  )
}

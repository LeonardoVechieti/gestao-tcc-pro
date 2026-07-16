import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { deletePerfil, getPerfis, type PerfilRow } from '../../shared/api/admin-api'
import { getApiErrorMessage } from '../../shared/api/api-errors'

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

  async function removePerfil(perfil: PerfilRow) {
    try {
      await deletePerfil(perfil.uuidPerfil)
      setPerfis((current) => current?.filter((item) => item.uuidPerfil !== perfil.uuidPerfil) ?? null)
      toast.current?.show({
        severity: 'success',
        summary: 'Perfil removido',
        detail: 'O perfil foi removido com sucesso.',
        life: 3000,
      })
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao remover',
        detail: getApiErrorMessage(error, 'Não foi possível remover o perfil.'),
        life: 5000,
      })
    }
  }

  function handleDeletePerfil(perfil: PerfilRow) {
    confirmDialog({
      header: 'Remover perfil',
      message: `Remover "${perfil.nomePerfil}"? Perfis estruturais ou vinculados a usuários são protegidos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => void removePerfil(perfil),
    })
  }

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
      <ConfirmDialog />
      <section className="page-header">
        <div>
          <h1>Perfis</h1>
          <p>Gerencie perfis e roles sem remover vínculos estruturais do sistema.</p>
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
              <div className="table-actions">
                <Button
                  className="p-button-text"
                  icon="pi pi-pencil"
                  label="Editar"
                  onClick={() => navigate(`/admin/perfis/${perfil.uuidPerfil}`)}
                />
                <Button
                  className="p-button-text p-button-danger"
                  icon="pi pi-trash"
                  label="Remover"
                  onClick={() => handleDeletePerfil(perfil)}
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

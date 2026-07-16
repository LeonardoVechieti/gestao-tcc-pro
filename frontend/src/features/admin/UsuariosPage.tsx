import { useEffect, useMemo, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsuario, getUsuarios, type UsuarioRow } from '../../shared/api/admin-api'

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioRow[] | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioRow | null>(null)
  const [isLoadingSelected, setIsLoadingSelected] = useState(false)
  const [search, setSearch] = useState('')
  const toast = useRef<Toast | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()

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

  useEffect(() => {
    if (!id) {
      setSelectedUsuario(null)
      return
    }

    let cancelled = false
    setIsLoadingSelected(true)

    getUsuario(id)
      .then((usuario) => {
        if (!cancelled) {
          setSelectedUsuario(usuario)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedUsuario(null)
          toast.current?.show({
            severity: 'error',
            summary: 'Erro ao carregar usuário',
            detail: 'Não foi possível carregar os detalhes do usuário.',
            life: 5000,
          })
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSelected(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

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
          <p>Consulta de usuários, perfis e vínculos de aluno. Alterações cadastrais são feitas em Meu perfil ou nos cadastros específicos.</p>
        </div>
      </section>

      {id ? (
        <section className="admin-detail-panel">
          {isLoadingSelected ? (
            <div className="loading-panel">
              <ProgressSpinner strokeWidth="4" />
            </div>
          ) : selectedUsuario ? (
            <>
              <div className="section-title">
                <div>
                  <h2>{selectedUsuario.nome ?? 'Usuário sem nome'}</h2>
                  <span className="muted-text">{selectedUsuario.email}</span>
                </div>
                <Button
                  className="p-button-text"
                  icon="pi pi-arrow-left"
                  label="Voltar para lista"
                  onClick={() => navigate('/admin/usuarios')}
                />
              </div>
              <div className="admin-detail-grid">
                <div>
                  <span>Perfil</span>
                  <strong>{selectedUsuario.perfil?.nomePerfil ?? 'Sem perfil'}</strong>
                </div>
                <div>
                  <span>Aluno vinculado</span>
                  <strong>{selectedUsuario.aluno?.nome ?? 'Sem vínculo'}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <Tag
                    severity={selectedUsuario.ativo ? 'success' : 'warning'}
                    value={selectedUsuario.ativo ? 'Ativo' : 'Inativo'}
                  />
                </div>
                <div>
                  <span>E-mail verificado</span>
                  <Tag
                    severity={selectedUsuario.emailVerified ? 'success' : 'warning'}
                    value={selectedUsuario.emailVerified ? 'Sim' : 'Não'}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="orientation-empty">
              <i className="pi pi-user" aria-hidden="true" />
              <strong>Usuário não encontrado.</strong>
              <Button label="Voltar" onClick={() => navigate('/admin/usuarios')} />
            </div>
          )}
        </section>
      ) : null}

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
            body={(row: UsuarioRow) => (
              <Tag severity={row.ativo ? 'success' : 'warning'} value={row.ativo ? 'Ativo' : 'Inativo'} />
            )}
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

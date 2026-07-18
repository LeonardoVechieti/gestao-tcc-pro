import { useEffect, useMemo, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getUsuario, getUsuarios, getPerfis, updateUsuario, type PerfilRow, type UsuarioRow } from '../../shared/api/admin-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import { hasRole } from '../../shared/auth/roles'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Informe o nome do usuário.'),
  email: z.string().email('Informe um e-mail válido.'),
  uuidPerfil: z.string().optional(),
  ativo: z.boolean().optional(),
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioRow[] | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioRow | null>(null)
  const [perfils, setPerfis] = useState<PerfilRow[] | null>(null)
  const [isLoadingSelected, setIsLoadingSelected] = useState(false)
  const [search, setSearch] = useState('')
  const toast = useRef<Toast | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const user = useAuthStore((state) => state.user)
  const canEditUsuarios = hasRole(user, 'ROLE_USUARIO_EDIT')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    defaultValues: {
      nome: '',
      email: '',
      uuidPerfil: '',
      ativo: true,
    },
    resolver: zodResolver(usuarioSchema),
  })

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
          reset({
            nome: usuario.nome ?? '',
            email: usuario.email ?? '',
            uuidPerfil: usuario.uuidPerfil ?? '',
            ativo: usuario.ativo ?? true,
          })
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
  }, [id, reset])

  async function handleSave(data: UsuarioFormData) {
    if (!id) return

    try {
      const payload: UsuarioRow = {
        uuidUsuario: id,
        nome: data.nome,
        email: data.email,
        uuidPerfil: data.uuidPerfil || undefined,
        ativo: data.ativo,
      }

      const updatedUsuario = await updateUsuario(payload)
      setSelectedUsuario(updatedUsuario)
      toast.current?.show({
        severity: 'success',
        summary: 'Usuário atualizado',
        detail: 'O usuário foi atualizado com sucesso.',
        life: 3000,
      })
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: 'Não foi possível atualizar o usuário. Verifique os dados e tente novamente.',
        life: 5000,
      })
    }
  }

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

              {!canEditUsuarios ? (
                <div className="admin-form-note" role="status">
                  <strong>Visualização apenas.</strong> Você não tem permissão para alterar este usuário.
                </div>
              ) : null}

              <form className="admin-form admin-form-grid" onSubmit={handleSubmit(handleSave)}>
                <FormField label="Nome" htmlFor="nome" error={errors.nome?.message}>
                  <Controller
                    control={control}
                    name="nome"
                    render={({ field }) => (
                      <InputText id="nome" placeholder="Nome do usuário" disabled={!canEditUsuarios} {...field} />
                    )}
                  />
                </FormField>

                <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <InputText id="email" placeholder="E-mail do usuário" disabled={!canEditUsuarios} {...field} />
                    )}
                  />
                </FormField>

                <FormField label="Perfil" htmlFor="uuidPerfil" error={errors.uuidPerfil?.message}>
                  <Controller
                    control={control}
                    name="uuidPerfil"
                    render={({ field }) => (
                      <select id="uuidPerfil" className="p-inputtext" disabled={!canEditUsuarios} {...field}>
                        <option value="">Nenhum perfil</option>
                        {perfils?.map((perfil) => (
                          <option key={perfil.uuidPerfil} value={perfil.uuidPerfil}>
                            {perfil.nomePerfil ?? perfil.uuidPerfil}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FormField>

                <FormField label="Ativo" htmlFor="ativo" error={errors.ativo?.message}>
                  <Controller
                    control={control}
                    name="ativo"
                    render={({ field }) => (
                      <select
                        id="ativo"
                        className="p-inputtext"
                        disabled={!canEditUsuarios}
                        value={field.value === true ? 'true' : 'false'}
                        onChange={(event) => field.onChange(event.target.value === 'true')}
                        onBlur={field.onBlur}
                      >
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                      </select>
                    )}
                  />
                </FormField>

                <div className="form-actions">
                  <Button type="submit" label="Salvar" loading={isSubmitting} disabled={!canEditUsuarios} />
                  <Button type="button" label="Cancelar" className="p-button-text" onClick={() => navigate('/admin/usuarios')} />
                </div>
              </form>
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
                  icon="pi pi-pencil"
                  label="Editar"
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

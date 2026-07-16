import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  createPerfil,
  createPerfilRole,
  deletePerfilRole,
  getPerfil,
  getPerfilRoles,
  getRoles,
  type PerfilRow,
  type RoleRow,
  updatePerfil,
} from '../../shared/api/admin-api'
import { getApiErrorMessage } from '../../shared/api/api-errors'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const perfilSchema = z.object({
  nomePerfil: z.string().min(3, 'Informe o nome do perfil.'),
  roles: z.array(z.string()).optional(),
})

type PerfilFormData = z.infer<typeof perfilSchema>

export function PerfilFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const toast = useRef<Toast | null>(null)
  const [roles, setRoles] = useState<RoleRow[] | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'perfil' | 'roles'>('perfil')
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PerfilFormData>({
    defaultValues: { nomePerfil: '', roles: [] },
    resolver: zodResolver(perfilSchema),
  })

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

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    setIsLoading(true)

    Promise.all([getPerfil(id), getPerfilRoles(id)])
      .then(([perfil, perfilRoles]) => {
        if (!cancelled) {
          const selected = perfilRoles.map((item) => item.uuidRole)
          setSelectedRoles(selected)
          reset({ nomePerfil: perfil.nomePerfil ?? '', roles: selected })
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro ao carregar',
          detail: 'Não foi possível carregar o perfil.',
          life: 5000,
        })
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id, reset])

  async function handleSave(data: PerfilFormData) {
    try {
      const payload: PerfilRow = {
        uuidPerfil: id ?? '',
        nomePerfil: data.nomePerfil,
      }

      const savedPerfil = id ? await updatePerfil(payload) : await createPerfil({ nomePerfil: data.nomePerfil })
      const perfilUuid = savedPerfil.uuidPerfil

      const existingRoles = id ? await getPerfilRoles(perfilUuid) : []
      const existingRoleUuids = new Set(existingRoles.map((item) => item.uuidRole))

      const rolesToAdd = selectedRoles.filter((roleUuid) => !existingRoleUuids.has(roleUuid))
      const rolesToRemove = existingRoles.filter((item) => !selectedRoles.includes(item.uuidRole))

      await Promise.all(
        rolesToAdd.map((uuidRole) => createPerfilRole({ uuidPerfil: perfilUuid, uuidRole }))
      )
      await Promise.all(
        rolesToRemove.map((item) => deletePerfilRole({ uuidPerfil: perfilUuid, uuidRole: item.uuidRole }))
      )

      toast.current?.show({
        severity: 'success',
        summary: id ? 'Perfil atualizado' : 'Perfil criado',
        detail: 'As alterações foram salvas com sucesso.',
        life: 3000,
      })

      navigate('/admin/perfis')
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: getApiErrorMessage(
          error,
          'Não foi possível salvar o perfil. Verifique os dados e tente novamente.'
        ),
        life: 5000,
      })
    }
  }

  const currentRoleItems = roles?.filter((role) => selectedRoles.includes(role.uuidRole)) ?? []

  if (isLoading) {
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
          <h1>{id ? 'Editar perfil' : 'Novo perfil'}</h1>
          <p>{id ? 'Ajuste os dados do perfil e suas roles.' : 'Cadastre um novo perfil com roles associadas.'}</p>
        </div>
      </section>

      <section className="form-panel">
        <div className="tab-header">
          <button
            type="button"
            className={activeTab === 'perfil' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('perfil')}
          >
            Perfil
          </button>
          <button
            type="button"
            className={activeTab === 'roles' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
        </div>

        <form className="admin-form" onSubmit={handleSubmit(handleSave)}>
          {id ? (
            <Message
              className="admin-form-note"
              severity="info"
              text="Perfis estruturais como Administrador, Aluno, Professor e Coordenador têm nome e roles essenciais protegidos para evitar perda de acesso."
            />
          ) : null}

          {activeTab === 'perfil' ? (
            <>
              <FormField label="Nome do perfil" htmlFor="nomePerfil" error={errors.nomePerfil?.message}>
                <Controller
                  control={control}
                  name="nomePerfil"
                  render={({ field }) => (
                    <InputText id="nomePerfil" placeholder="Nome do perfil" {...field} />
                  )}
                />
              </FormField>
            </>
          ) : (
            <>
              <div className="form-panel-row">
                <div>
                  <Button type="button" label="Adicionar role" onClick={() => setRoleModalOpen(true)} />
                </div>
                <div>
                  <DataTable value={currentRoleItems} dataKey="uuidRole" responsiveLayout="scroll">
                    <Column field="desRole" header="Role" />
                    <Column
                      header="Ações"
                      body={(role: RoleRow) => (
                        <Button
                          className="p-button-text p-button-danger"
                          icon="pi pi-trash"
                          label="Remover"
                          onClick={() =>
                            setSelectedRoles((current) => current.filter((uuid) => uuid !== role.uuidRole))
                          }
                        />
                      )}
                      style={{ width: '12rem' }}
                    />
                  </DataTable>
                </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <Button type="submit" label="Salvar" loading={isSubmitting} />
            <Button type="button" label="Cancelar" className="p-button-text" onClick={() => navigate('/admin/perfis')} />
          </div>
        </form>

        <Dialog
          header="Adicionar Roles"
          visible={roleModalOpen}
          style={{ width: '40rem' }}
          onHide={() => setRoleModalOpen(false)}
          footer={
            <div>
              <Button label="Fechar" icon="pi pi-times" onClick={() => setRoleModalOpen(false)} className="p-button-text" />
            </div>
          }
        >
          <div className="field-group">
            <p className="muted-text">Marque as roles que deseja vincular a este perfil.</p>
            <div className="role-checkbox-list">
              {roles?.length ? (
                roles.map((role) => (
                  <label key={role.uuidRole} className="role-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.uuidRole)}
                      onChange={(event) => {
                        const checked = event.target.checked
                        setSelectedRoles((current) =>
                          checked
                            ? [...current, role.uuidRole]
                            : current.filter((uuid) => uuid !== role.uuidRole)
                        )
                      }}
                    />
                    <span>{role.desRole}</span>
                  </label>
                ))
              ) : (
                <p>Nenhuma role disponível.</p>
              )}
            </div>
          </div>
        </Dialog>
      </section>
    </div>
  )
}

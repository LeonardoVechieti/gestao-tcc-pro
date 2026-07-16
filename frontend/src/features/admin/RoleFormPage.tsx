import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  createRole,
  getRole,
  type RoleRow,
  updateRole,
} from '../../shared/api/admin-api'
import { getApiErrorMessage } from '../../shared/api/api-errors'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const roleSchema = z.object({
  codRole: z.string().optional(),
  desRole: z.string().min(3, 'Informe a descrição da role.'),
})

type RoleFormData = z.infer<typeof roleSchema>

export function RoleFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const toast = useRef<Toast | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    defaultValues: { codRole: '', desRole: '' },
    resolver: zodResolver(roleSchema),
  })

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    setIsLoading(true)

    getRole(id)
      .then((role) => {
        if (!cancelled) {
          reset({ codRole: role.codRole ?? '', desRole: role.desRole })
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro ao carregar',
          detail: 'Não foi possível carregar a role.',
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

  async function handleSave(data: RoleFormData) {
    try {
      const payload: RoleRow = {
        uuidRole: id ?? '',
        codRole: data.codRole,
        desRole: data.desRole,
      }

      if (id) {
        await updateRole(payload)
      } else {
        await createRole({ codRole: data.codRole, desRole: data.desRole })
      }

      toast.current?.show({
        severity: 'success',
        summary: id ? 'Role atualizada' : 'Role criada',
        detail: 'As informações foram salvas com sucesso.',
        life: 3000,
      })

      navigate('/admin/roles')
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: getApiErrorMessage(
          error,
          'Não foi possível salvar a role. Verifique os campos e tente novamente.'
        ),
        life: 5000,
      })
    }
  }

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
          <h1>{id ? 'Editar role' : 'Nova role'}</h1>
          <p>{id ? 'Ajuste os dados da role existente.' : 'Cadastre uma nova role.'}</p>
        </div>
      </section>

      <section className="form-panel">
        <form className="admin-form" onSubmit={handleSubmit(handleSave)}>
          {id ? (
            <Message
              className="admin-form-note"
              severity="info"
              text="O código da role é usado para liberar menus e rotas. Se a role já estiver vinculada a algum perfil, o backend bloqueará a troca do código."
            />
          ) : null}

          <FormField label="Código da role" htmlFor="codRole" error={errors.codRole?.message}>
            <Controller
              control={control}
              name="codRole"
              render={({ field }) => (
                <InputText id="codRole" placeholder="Digite um código opcional" {...field} />
              )}
            />
          </FormField>

          <FormField label="Descrição" htmlFor="desRole" error={errors.desRole?.message}>
            <Controller
              control={control}
              name="desRole"
              render={({ field }) => (
                <InputText id="desRole" placeholder="Digite a descrição da role" {...field} />
              )}
            />
          </FormField>

          <div className="form-actions">
            <Button type="submit" label="Salvar" loading={isSubmitting} />
            <Button type="button" label="Cancelar" className="p-button-text" onClick={() => navigate('/admin/roles')} />
          </div>
        </form>
      </section>
    </div>
  )
}

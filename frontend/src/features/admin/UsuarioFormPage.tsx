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
import { getUsuario, getPerfis, updateUsuario, type PerfilRow, type UsuarioRow } from '../../shared/api/admin-api'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'
import { getApiErrorMessage } from '../../shared/api/api-errors'
import { useAuthStore } from '../../shared/stores/auth-store'
import { hasRole } from '../../shared/auth/roles'

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Informe o nome do usuário.'),
  email: z.string().email('Informe um e-mail válido.'),
  uuidPerfil: z.string().optional(),
  ativo: z.boolean().optional(),
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

export function UsuarioFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const toast = useRef<Toast | null>(null)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioRow | null>(null)
  const [perfils, setPerfis] = useState<PerfilRow[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
    setIsLoading(true)

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
            detail: 'Não foi possível carregar os dados do usuário.',
            life: 5000,
          })
        }
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

      await updateUsuario(payload)
      toast.current?.show({
        severity: 'success',
        summary: 'Usuário atualizado',
        detail: 'O usuário foi atualizado com sucesso.',
        life: 3000,
      })
      navigate('/admin/usuarios')
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: getApiErrorMessage(error, 'Não foi possível atualizar o usuário. Verifique os dados e tente novamente.'),
        life: 5000,
      })
    }
  }

  if (!id) {
    return (
      <div className="orientation-empty">
        <i className="pi pi-exclamation-triangle" aria-hidden="true" />
        <strong>ID do usuário ausente.</strong>
        <Button label="Voltar" onClick={() => navigate('/admin/usuarios')} />
      </div>
    )
  }

  if (isLoading || !selectedUsuario) {
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
          <h1>Editar usuário</h1>
          <p>Atualize os dados e o perfil do usuário.</p>
        </div>
      </section>

      <section className="form-panel">
        {!canEditUsuarios ? (
          <Message
            className="admin-form-note"
            severity="info"
            text="Você tem apenas permissão para visualizar este usuário. A edição exige ROLE_USUARIO_EDIT."
          />
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
      </section>
    </div>
  )
}

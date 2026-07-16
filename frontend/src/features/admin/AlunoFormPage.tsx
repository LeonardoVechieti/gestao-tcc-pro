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
import { FormField } from '../../shared/ui/molecules/FormField/FormField'
import {
  createAluno,
  getAluno,
  getPerfis,
  type AlunoRow,
  type PerfilRow,
  updateAluno,
} from '../../shared/api/admin-api'
import { getApiErrorMessage } from '../../shared/api/api-errors'

const alunoSchema = z.object({
  nome: z.string().min(3, 'Informe o nome do aluno.'),
  matricula: z.string().min(3, 'Informe a matrícula.'),
  curso: z.string().min(2, 'Informe o curso.'),
  email: z.string().email('Informe um e-mail válido.'),
  telefone: z.string().optional(),
  observacao: z.string().optional(),
  semestre: z.string().optional(),
  situacao: z.string().optional(),
  ativo: z.boolean().optional(),
  uuidPerfil: z.string().optional(),
})

type AlunoFormData = z.infer<typeof alunoSchema>

export function AlunoFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const toast = useRef<Toast | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [perfils, setPerfis] = useState<PerfilRow[] | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AlunoFormData>({
    defaultValues: {
      nome: '',
      matricula: '',
      curso: '',
      email: '',
      telefone: '',
      observacao: '',
      semestre: '',
      situacao: '',
      ativo: true,
      uuidPerfil: '',
    },
    resolver: zodResolver(alunoSchema),
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
      return
    }

    let cancelled = false
    setIsLoading(true)

    getAluno(id)
      .then((aluno) => {
        if (!cancelled) {
          reset({
            nome: aluno.nome ?? '',
            matricula: aluno.matricula ?? '',
            curso: aluno.curso ?? '',
            email: aluno.email ?? '',
            telefone: aluno.telefone ?? '',
            observacao: aluno.observacao ?? '',
            semestre: aluno.semestre ?? '',
            situacao: aluno.situacao ?? '',
            ativo: aluno.ativo ?? true,
            uuidPerfil: aluno.uuidPerfil ?? '',
          })
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro ao carregar aluno',
          detail: 'Não foi possível carregar os dados do aluno.',
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

  async function handleSave(data: AlunoFormData) {
    try {
      const payload: AlunoRow = {
        uuidAluno: id ?? '',
        nome: data.nome,
        matricula: data.matricula,
        curso: data.curso,
        email: data.email,
        telefone: data.telefone,
        observacao: data.observacao,
        semestre: data.semestre,
        situacao: data.situacao,
        ativo: data.ativo,
        uuidPerfil: data.uuidPerfil || undefined,
      }

      if (id) {
        await updateAluno(payload)
      } else {
        await createAluno({
          nome: data.nome,
          matricula: data.matricula,
          curso: data.curso,
          email: data.email,
          telefone: data.telefone,
          observacao: data.observacao,
          semestre: data.semestre,
          situacao: data.situacao,
          ativo: data.ativo,
          uuidPerfil: data.uuidPerfil || undefined,
        })
      }

      toast.current?.show({
        severity: 'success',
        summary: id ? 'Aluno atualizado' : 'Aluno cadastrado',
        detail: 'Os dados foram salvos com sucesso.',
        life: 3000,
      })
      navigate('/admin/alunos')
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: getApiErrorMessage(
          error,
          'Não foi possível salvar o aluno. Verifique os campos e tente novamente.'
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
          <h1>{id ? 'Editar aluno' : 'Cadastrar aluno'}</h1>
          <p>Cadastre um aluno apto ao TCC e mantenha os dados atualizados.</p>
        </div>
      </section>

      <section className="form-panel">
        <form className="admin-form admin-form-grid" onSubmit={handleSubmit(handleSave)}>
          {id ? (
            <Message
              className="admin-form-note"
              severity="info"
              text="Matrícula e e-mail são identificadores sensíveis. Se este aluno já tiver usuário, tema ou TCC, o backend bloqueará alterações que possam quebrar o histórico."
            />
          ) : null}

          <FormField label="Nome" htmlFor="nome" error={errors.nome?.message}>
            <Controller
              control={control}
              name="nome"
              render={({ field }) => (
                <InputText id="nome" placeholder="Nome completo" {...field} />
              )}
            />
          </FormField>

          <FormField label="Matrícula" htmlFor="matricula" error={errors.matricula?.message}>
            <Controller
              control={control}
              name="matricula"
              render={({ field }) => (
                <InputText id="matricula" placeholder="Número da matrícula" {...field} />
              )}
            />
          </FormField>

          <FormField label="Curso" htmlFor="curso" error={errors.curso?.message}>
            <Controller
              control={control}
              name="curso"
              render={({ field }) => (
                <InputText id="curso" placeholder="Curso" {...field} />
              )}
            />
          </FormField>

          <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <InputText id="email" placeholder="E-mail do aluno" {...field} />
              )}
            />
          </FormField>

          <FormField label="Telefone" htmlFor="telefone" error={errors.telefone?.message}>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <InputText id="telefone" placeholder="Telefone" {...field} />
              )}
            />
          </FormField>

          <FormField label="Semestre" htmlFor="semestre" error={errors.semestre?.message}>
            <Controller
              control={control}
              name="semestre"
              render={({ field }) => (
                <InputText id="semestre" placeholder="Semestre" {...field} />
              )}
            />
          </FormField>

          <FormField label="Situação" htmlFor="situacao" error={errors.situacao?.message}>
            <Controller
              control={control}
              name="situacao"
              render={({ field }) => (
                <InputText id="situacao" placeholder="Ativo / Inativo / Concluído" {...field} />
              )}
            />
          </FormField>

          <FormField label="Perfil" htmlFor="uuidPerfil" error={errors.uuidPerfil?.message}>
            <Controller
              control={control}
              name="uuidPerfil"
              render={({ field }) => (
                <select id="uuidPerfil" {...field} className="p-inputtext">
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
              render={({ field }) => {
                const currentValue = field.value === true ? 'true' : 'false'
                return (
                  <select
                    id="ativo"
                    className="p-inputtext"
                    value={currentValue}
                    onChange={(event) => field.onChange(event.target.value === 'true')}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                )
              }}
            />
          </FormField>

          <FormField label="Observação" htmlFor="observacao" error={errors.observacao?.message}>
            <Controller
              control={control}
              name="observacao"
              render={({ field }) => (
                <InputText id="observacao" placeholder="Observações" {...field} />
              )}
            />
          </FormField>

          <div className="form-actions">
            <Button type="submit" label="Salvar" loading={isSubmitting} />
            <Button type="button" label="Cancelar" className="p-button-text" onClick={() => navigate('/admin/alunos')} />
          </div>
        </form>
      </section>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { MultiSelect } from 'primereact/multiselect'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  createProfessor,
  getProfessorById,
  updateProfessor,
  type ProfessorRow,
} from '../../shared/api/professor-api'
import {
  normalizeResearchValues,
  professorAreaOptions,
  professorLineOptions,
} from '../../shared/professor/research-options'
import { getApiErrorMessage } from '../../shared/api/api-errors'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const professorSchema = z.object({
  nome: z.string().min(3, 'Informe o nome do professor.'),
  email: z.string().email('Informe um e-mail válido.'),
  areasInteresse: z.array(z.string()).min(1, 'Selecione ao menos uma área.'),
  linhasPesquisa: z.array(z.string()).min(1, 'Selecione ao menos uma linha de pesquisa.'),
  ativo: z.boolean().optional(),
})

type ProfessorFormData = z.infer<typeof professorSchema>

export function ProfessorFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const toast = useRef<Toast | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfessorFormData>({
    defaultValues: {
      nome: '',
      email: '',
      areasInteresse: [],
      linhasPesquisa: [],
      ativo: true,
    },
    resolver: zodResolver(professorSchema),
  })

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    setIsLoading(true)

    getProfessorById(id)
      .then((professor) => {
        if (!cancelled) {
          reset({
            nome: professor.nome ?? '',
            email: professor.email ?? '',
            areasInteresse: normalizeResearchValues(professor.areasInteresse),
            linhasPesquisa: normalizeResearchValues(professor.linhasPesquisa),
            ativo: professor.ativo ?? true,
          })
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro ao carregar professor',
          detail: 'Não foi possível carregar os dados do professor.',
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

  async function handleSave(data: ProfessorFormData) {
    try {
      if (id) {
        const payload: ProfessorRow = {
          uuidProfessor: id,
          nome: data.nome,
          email: data.email,
          areasInteresse: data.areasInteresse,
          linhasPesquisa: data.linhasPesquisa,
          ativo: data.ativo,
        }
        await updateProfessor(payload)
      } else {
        await createProfessor({
          nome: data.nome,
          email: data.email,
          areasInteresse: data.areasInteresse,
          linhasPesquisa: data.linhasPesquisa,
          ativo: data.ativo,
        })
      }

      toast.current?.show({
        severity: 'success',
        summary: id ? 'Professor atualizado' : 'Professor cadastrado',
        detail: 'Os dados foram salvos com sucesso.',
        life: 3000,
      })
      navigate('/admin/professores')
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: getApiErrorMessage(
          error,
          'Não foi possível salvar o professor. Verifique os campos e tente novamente.'
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
          <h1>{id ? 'Editar professor' : 'Cadastrar professor'}</h1>
          <p>Mantenha os dados usados na indicação de orientadores.</p>
        </div>
      </section>

      <section className="form-panel">
        <form className="admin-form admin-form-grid" onSubmit={handleSubmit(handleSave)}>
          {id ? (
            <Message
              className="admin-form-note"
              severity="info"
              text="O e-mail identifica o professor em várias telas. Se ele já estiver vinculado a temas, TCCs, agendas ou avaliações, o backend bloqueará a troca do e-mail."
            />
          ) : null}

          <FormField label="Nome" htmlFor="nome" error={errors.nome?.message}>
            <Controller
              control={control}
              name="nome"
              render={({ field }) => <InputText id="nome" placeholder="Nome completo" {...field} />}
            />
          </FormField>

          <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => <InputText id="email" placeholder="E-mail institucional" {...field} />}
            />
          </FormField>

          <FormField label="Áreas de interesse" htmlFor="areasInteresse" error={errors.areasInteresse?.message}>
            <Controller
              control={control}
              name="areasInteresse"
              render={({ field }) => (
                <MultiSelect
                  id="areasInteresse"
                  display="chip"
                  filter
                  options={professorAreaOptions}
                  placeholder="Selecione as áreas"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.value ?? [])}
                />
              )}
            />
          </FormField>

          <FormField label="Linhas de pesquisa" htmlFor="linhasPesquisa" error={errors.linhasPesquisa?.message}>
            <Controller
              control={control}
              name="linhasPesquisa"
              render={({ field }) => (
                <MultiSelect
                  id="linhasPesquisa"
                  display="chip"
                  filter
                  options={professorLineOptions}
                  placeholder="Selecione as linhas"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.value ?? [])}
                />
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

          <div className="form-actions">
            <Button type="submit" label="Salvar" loading={isSubmitting} />
            <Button type="button" label="Cancelar" className="p-button-text" onClick={() => navigate('/admin/professores')} />
          </div>
        </form>
      </section>
    </div>
  )
}

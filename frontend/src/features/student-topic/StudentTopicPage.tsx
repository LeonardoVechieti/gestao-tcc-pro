import { useRef, useState, useEffect } from 'react'

// Guard to avoid double auto-loading in React Strict Mode during development
let __devAutoLoaded = false
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { createTemaTcc, getTemaTccList, type TemaTcc } from '../../shared/api/tema-tcc-api'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'
import { InfoPanel } from '../../shared/ui/organisms/InfoPanel/InfoPanel'

const topicSchema = z.object({
  title: z.string().min(8, 'Informe um titulo com pelo menos 8 caracteres.').max(150),
  area: z.string().min(1, 'Selecione uma area.'),
  researchLine: z.string().min(1, 'Selecione uma linha de pesquisa.'),
  description: z
    .string()
    .min(80, 'Descreva melhor a justificativa do tema.')
    .max(2000),
})

type TopicForm = z.infer<typeof topicSchema>

const areaOptions = [
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sistemas de Informacao', value: 'sistemas' },
  { label: 'Ciencia de Dados', value: 'dados' },
  { label: 'Engenharia de Software', value: 'software' },
]

const lineOptions = [
  { label: 'Transformacao digital', value: 'transformacao-digital' },
  { label: 'Analise de dados educacionais', value: 'dados-educacionais' },
  { label: 'Experiencia do usuario', value: 'ux' },
  { label: 'Gestao e processos', value: 'gestao-processos' },
]

export function StudentTopicPage() {
  useEffect(() => {
    console.log('StudentTopicPage mounted')
    if (import.meta.env.DEV && !__devAutoLoaded) {
      __devAutoLoaded = true
      console.log('DEV: guarded auto-loading temas for debug')
      void loadTemas()
    }
  }, [])
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TopicForm>({
    defaultValues: {
      title: '',
      area: '',
      researchLine: '',
      description: '',
    },
    resolver: zodResolver(topicSchema),
  })

  const title = watch('title')
  const area = watch('area')
  const researchLine = watch('researchLine')
  const description = watch('description')

  const requirements = [
    { label: 'Titulo provisorio', done: title.trim().length >= 8 },
    { label: 'Area de interesse', done: area.trim().length > 0 },
    { label: 'Linha de pesquisa', done: researchLine.trim().length > 0 },
    { label: 'Descricao / justificativa', done: description.trim().length >= 80 },
  ]

  const toast = useRef<Toast | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTemas, setIsLoadingTemas] = useState(false)
  const [hasLoadedTemas, setHasLoadedTemas] = useState(false)
  const [temas, setTemas] = useState<TemaTcc[]>([])

  const studentId: string | undefined = undefined

  function handleSaveDraft(data: TopicForm) {
    console.log('draft', data)

    toast.current?.show({
      severity: 'info',
      summary: 'Rascunho salvo',
      detail: 'Rascunho salvo localmente. Ainda nao esta integrado ao backend.',
      life: 5000,
    })
  }

  async function handleSendTopic(data: TopicForm) {
    setIsSubmitting(true)

    try {
      await createTemaTcc({
        titulo: data.title,
        descricao: data.description,
        area: data.area,
        linhaPesquisa: data.researchLine,
      })

      toast.current?.show({
        severity: 'success',
        summary: 'Tema cadastrado',
        detail: 'Seu tema foi enviado com sucesso para o backend.',
        life: 5000,
      })
    } catch (error) {
      console.error(error)
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao cadastrar',
        detail: 'Nao foi possivel cadastrar o tema. Tente novamente.',
        life: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function loadTemas() {
    setIsLoadingTemas(true)
    console.log('loadTemas called', { studentId })

    try {
      const params = studentId ? { uuidAluno: studentId } : undefined
      const data = await getTemaTccList(params)
      setTemas(data)

      toast.current?.show({
        severity: 'success',
        summary: 'Temas carregados',
        detail: `Encontrados ${data.length} temas${studentId ? ` para o aluno ${studentId}` : ''}.`,
        life: 5000,
      })
    } catch (error) {
      console.error(error)
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar temas',
        detail: 'Falha ao buscar os temas. Tente novamente.',
        life: 5000,
      })
    } finally {
      setIsLoadingTemas(false)
      setHasLoadedTemas(true)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Registrar Tema de TCC</h1>
          <p>
            Informe os dados do seu tema de Trabalho de Conclusao de Curso. Apos o
            cadastro, ele sera analisado pelo coordenador.
          </p>
        </div>
      </section>

      <section className="student-topic-grid">
        <form className="form-panel" onSubmit={handleSubmit(handleSendTopic)}>
          <Toast ref={toast} />
          <div className={`form-loading ${isSubmitting ? 'active' : ''}`}>
            <ProgressSpinner strokeWidth="4" />
          </div>

          <FormField
            label="Titulo provisorio *"
            htmlFor="title"
            error={errors.title?.message}
            counter={{ current: title.length, max: 150 }}
          >
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <InputText
                  id="title"
                  invalid={Boolean(errors.title)}
                  placeholder="Digite um titulo provisorio para o seu tema de TCC"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormField>

          <FormField label="Area de interesse *" htmlFor="area" error={errors.area?.message}>
            <Controller
              control={control}
              name="area"
              render={({ field }) => (
                <Dropdown
                  id="area"
                  invalid={Boolean(errors.area)}
                  options={areaOptions}
                  placeholder="Selecione a area de interesse"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormField>

          <FormField
            label="Linha de pesquisa *"
            htmlFor="researchLine"
            error={errors.researchLine?.message}
          >
            <Controller
              control={control}
              name="researchLine"
              render={({ field }) => (
                <Dropdown
                  id="researchLine"
                  invalid={Boolean(errors.researchLine)}
                  options={lineOptions}
                  placeholder="Selecione a linha de pesquisa"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormField>

          <FormField
            label="Descricao / justificativa *"
            htmlFor="description"
            hint="Explique a relevancia, o problema de pesquisa e os objetivos do seu tema."
            error={errors.description?.message}
            counter={{ current: description.length, max: 2000 }}
          >
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <InputTextarea
                  id="description"
                  invalid={Boolean(errors.description)}
                  placeholder="Descreva seu tema, justificativa, problema de pesquisa, objetivos e a relevancia para a area escolhida..."
                  rows={6}
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
          </FormField>

          <div className="form-actions">
            <Button
              icon="pi pi-save"
              label="Salvar como rascunho"
              onClick={handleSubmit(handleSaveDraft)}
              outlined
              type="button"
              disabled={isSubmitting || isLoadingTemas}
            />
            <Button
              icon="pi pi-cloud-download"
              label={isLoadingTemas ? 'Carregando...' : 'Buscar meus temas'}
              onClick={loadTemas}
              outlined
              type="button"
              disabled={isSubmitting || isLoadingTemas}
            />
            <Button
              icon="pi pi-send"
              label="Cadastrar Tema"
              loading={isSubmitting}
              type="submit"
              disabled={isSubmitting || isLoadingTemas}
            />
          </div>
        </form>

        <aside className="student-topic-aside">
          <InfoPanel icon="pi pi-clipboard" title="Requisitos">
            <p>Para cadastrar seu tema, todos os itens abaixo devem ser preenchidos.</p>
            <ul className="check-list">
              {requirements.map((item) => (
                <li key={item.label}>
                  <i
                    className={item.done ? 'pi pi-check-circle is-done' : 'pi pi-circle'}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <Message severity="info" text="Todos os campos sao obrigatorios." />
          </InfoPanel>

          <InfoPanel icon="pi pi-list-check" title="Status do envio">
            <div className="draft-status">
              <div className="draft-status__icon">
                <i className="pi pi-pencil" aria-hidden="true" />
              </div>
              <div>
                <strong>Rascunho</strong>
                <span>Seu tema ainda nao foi enviado.</span>
              </div>
            </div>
            <p className="muted-text">
              Salve como rascunho para continuar editando. Quando estiver pronto,
              clique em <strong>Cadastrar Tema</strong> para enviar para analise.
            </p>
            <Tag severity="warning" value="Aguardando envio" />
          </InfoPanel>

          <InfoPanel icon="pi pi-book" title="Temas do aluno">
            {isLoadingTemas ? (
              <div className="loading-panel">
                <ProgressSpinner strokeWidth="4" />
              </div>
            ) : temas.length > 0 ? (
              <ul className="tema-list">
                {temas.map((tema) => (
                  <li key={tema.uuidTemaTcc}>
                    <strong>{tema.titulo}</strong>
                    <span>{tema.area}</span>
                  </li>
                ))}
              </ul>
            ) : hasLoadedTemas ? (
              <div className="empty-state">
                <p>O aluno ainda não tem nenhum tema de TCC registrado.</p>
                <p>Clique em Buscar meus temas para verificar se há temas no sistema.</p>
              </div>
            ) : (
              <p>Clique em Buscar meus temas para ver os temas do aluno.</p>
            )}
          </InfoPanel>
        </aside>
      </section>
    </div>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

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

const requirements = [
  'Titulo provisorio',
  'Area de interesse',
  'Linha de pesquisa',
  'Descricao / justificativa',
]

export function StudentTopicPage() {
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
  const description = watch('description')

  function handleSaveDraft(data: TopicForm) {
    console.log('draft', data)
  }

  function handleSendTopic(data: TopicForm) {
    console.log('send topic', data)
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
          <div className="field-group">
            <label htmlFor="title">Titulo provisorio *</label>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <InputText
                  id="title"
                  invalid={Boolean(errors.title)}
                  placeholder="Digite um titulo provisorio para o seu tema de TCC"
                  {...field}
                />
              )}
            />
            <div className="field-footer">
              <small>{errors.title?.message}</small>
              <span>{title.length}/150</span>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="area">Area de interesse *</label>
            <Controller
              control={control}
              name="area"
              render={({ field }) => (
                <Dropdown
                  id="area"
                  invalid={Boolean(errors.area)}
                  options={areaOptions}
                  placeholder="Selecione a area de interesse"
                  {...field}
                />
              )}
            />
            <small>{errors.area?.message}</small>
          </div>

          <div className="field-group">
            <label htmlFor="researchLine">Linha de pesquisa *</label>
            <Controller
              control={control}
              name="researchLine"
              render={({ field }) => (
                <Dropdown
                  id="researchLine"
                  invalid={Boolean(errors.researchLine)}
                  options={lineOptions}
                  placeholder="Selecione a linha de pesquisa"
                  {...field}
                />
              )}
            />
            <small>{errors.researchLine?.message}</small>
          </div>

          <div className="field-group">
            <label htmlFor="description">Descricao / justificativa *</label>
            <span>
              Explique a relevancia, o problema de pesquisa e os objetivos do seu tema.
            </span>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <InputTextarea
                  id="description"
                  invalid={Boolean(errors.description)}
                  placeholder="Descreva seu tema, justificativa, problema de pesquisa, objetivos e a relevancia para a area escolhida..."
                  rows={6}
                  {...field}
                />
              )}
            />
            <div className="field-footer">
              <small>{errors.description?.message}</small>
              <span>{description.length}/2000</span>
            </div>
          </div>

          <div className="form-actions">
            <Button
              icon="pi pi-save"
              label="Salvar como rascunho"
              onClick={handleSubmit(handleSaveDraft)}
              outlined
              type="button"
            />
            <Button icon="pi pi-send" label="Cadastrar Tema" type="submit" />
          </div>
        </form>

        <aside className="student-topic-aside">
          <div className="info-panel">
            <div className="panel-heading">
              <i className="pi pi-clipboard" aria-hidden="true" />
              <h2>Requisitos</h2>
            </div>
            <p>Para cadastrar seu tema, todos os itens abaixo devem ser preenchidos.</p>
            <ul className="check-list">
              {requirements.map((item) => (
                <li key={item}>
                  <i className="pi pi-check-circle" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Message severity="info" text="Todos os campos sao obrigatorios." />
          </div>

          <div className="info-panel">
            <div className="panel-heading">
              <i className="pi pi-list-check" aria-hidden="true" />
              <h2>Status do envio</h2>
            </div>
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
          </div>
        </aside>
      </section>
    </div>
  )
}

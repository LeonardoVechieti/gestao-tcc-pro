import { useEffect, useRef, useState } from 'react'
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
import { createTemaTcc, getTemaTccList, getMyTemaTcc, type TemaTcc } from '../../shared/api/tema-tcc-api'
import { getProfessorRecommendations, getProfessorById, type ProfessorRecommendation } from '../../shared/api/professor-api'
import {
  professorAreaOptions as areaOptions,
  professorLineOptions as lineOptions,
} from '../../shared/professor/research-options'
import { useAuthStore } from '../../shared/stores/auth-store'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'
import { InfoPanel } from '../../shared/ui/organisms/InfoPanel/InfoPanel'

const topicSchema = z.object({
  title: z.string().min(8, 'Informe um título com pelo menos 8 caracteres.').max(150),
  area: z.string().min(1, 'Selecione uma área.'),
  researchLine: z.string().min(1, 'Selecione uma linha de pesquisa.'),
  description: z
    .string()
    .min(80, 'Descreva melhor a justificativa do tema.')
    .max(2000),
})

type TopicForm = z.infer<typeof topicSchema>

export function StudentTopicPage() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    async function loadMinhaSolicitacao() {
      setIsLoadingMinhaSolicitacao(true)

      try {
        const tema = await getMyTemaTcc()
        if (tema) {
          setCreatedTema(tema)

          if (tema.uuidProfessor) {
            try {
              const professor = await getProfessorById(tema.uuidProfessor)
              setSelectedProfessor(professor)
            } catch (error) {
              console.error('Erro ao buscar professor associado:', error)
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar minha solicitação:', error)
      } finally {
        setIsLoadingMinhaSolicitacao(false)
      }
    }

    void loadMinhaSolicitacao()
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

  const toast = useRef<Toast | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTemas, setIsLoadingTemas] = useState(false)
  const [hasLoadedTemas, setHasLoadedTemas] = useState(false)
  const [temas, setTemas] = useState<TemaTcc[]>([])
  const [professores, setProfessores] = useState<ProfessorRecommendation[]>([])
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorRecommendation | null>(null)
  const [createdTema, setCreatedTema] = useState<TemaTcc | null>(null)
  const [isLoadingProfessores, setIsLoadingProfessores] = useState(false)
  const [, setIsLoadingMinhaSolicitacao] = useState(false)

  const title = watch('title')
  const area = watch('area')
  const researchLine = watch('researchLine')
  const description = watch('description')

  useEffect(() => {
    if (area && researchLine) {
      void loadProfessores(area, researchLine)
    }
  }, [area, researchLine])

  const requirements = [
    { label: 'Título provisório', done: title.trim().length >= 8 },
    { label: 'Área de interesse', done: area.trim().length > 0 },
    { label: 'Linha de pesquisa', done: researchLine.trim().length > 0 },
    { label: 'Descrição / justificativa', done: description.trim().length >= 80 },
    { label: 'Professor selecionado', done: Boolean(selectedProfessor) },
  ]

  const isRequestSent = Boolean(createdTema)

  const requestPanel = isRequestSent ? (
    <div className="form-panel">
      <Toast ref={toast} />
      <div className="submitted-panel">
        <h2>Solicitação recebida</h2>
        <p>Seu pedido de tema foi enviado e está aguardando aprovação.</p>
        <div className="submitted-details">
          <div>
            <strong>Título:</strong>
            <p>{createdTema?.titulo}</p>
          </div>
          <div>
            <strong>Área:</strong>
            <p>{createdTema?.area}</p>
          </div>
          <div>
            <strong>Linha de pesquisa:</strong>
            <p>{createdTema?.linhaPesquisa}</p>
          </div>
          <div>
            <strong>Professor indicado:</strong>
            <p>{selectedProfessor?.nome ?? 'Não informado'}</p>
            <p>{selectedProfessor?.email ?? ''}</p>
          </div>
          <div>
            <strong>Status:</strong>
            <p>{createdTema?.status ?? 'aguardando aprovação'}</p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <form className="form-panel" onSubmit={handleSubmit(handleSendTopic)}>
      <Toast ref={toast} />
      <div className={`form-loading ${isSubmitting ? 'active' : ''}`}>
        <ProgressSpinner strokeWidth="4" />
      </div>

      <FormField
        label="Título provisório *"
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
              placeholder="Digite um título provisório para o seu tema de TCC"
              disabled={isSubmitting}
              {...field}
            />
          )}
        />
      </FormField>

      <FormField label="Área de interesse *" htmlFor="area" error={errors.area?.message}>
        <Controller
          control={control}
          name="area"
          render={({ field }) => (
            <Dropdown
              id="area"
              invalid={Boolean(errors.area)}
              options={areaOptions}
              placeholder="Selecione a área de interesse"
              disabled={isSubmitting}
              value={field.value}
              onChange={(event) => field.onChange(event.value)}
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
              value={field.value}
              onChange={(event) => field.onChange(event.value)}
            />
          )}
        />
      </FormField>

      <InfoPanel icon="pi pi-users" title="Professores disponíveis">
        {isLoadingProfessores ? (
          <div className="loading-panel">
            <ProgressSpinner strokeWidth="4" />
          </div>
        ) : area && researchLine ? (
          professores.length > 0 ? (
            <>
              <p className="muted-text">Escolha o professor que será envolvido na solicitação.</p>
              <ul className="tema-list">
                {professores.map((professor) => (
                  <li
                    key={professor.uuidProfessor}
                    className={`professor-item ${
                      selectedProfessor?.uuidProfessor === professor.uuidProfessor
                        ? 'is-selected'
                        : ''
                    }`}
                    onClick={() => setSelectedProfessor(professor)}
                  >
                    <strong>{professor.nome}</strong>
                    <span>{professor.email ?? 'Sem email registrado'}</span>
                  </li>
                ))}
              </ul>
              {selectedProfessor ? (
                <div className="selected-professor-summary">
                  <strong>Professor selecionado:</strong>
                  <p>{selectedProfessor.nome}</p>
                  <p>{selectedProfessor.email ?? 'Sem email registrado'}</p>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Selecione um professor acima para incluir na solicitação.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Nenhum professor encontrado para os filtros selecionados.</p>
            </div>
          )
        ) : (
          <p>Selecione área e linha de pesquisa para ver os professores disponíveis.</p>
        )}
      </InfoPanel>

      <FormField
        label="Descrição / justificativa *"
        htmlFor="description"
        hint="Explique a relevância, o problema de pesquisa e os objetivos do seu tema."
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
              placeholder="Descreva seu tema, justificativa, problema de pesquisa, objetivos e a relevância para a área escolhida..."
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
          label="Solicitar Tema"
          loading={isSubmitting}
          type="submit"
          disabled={isSubmitting || isLoadingTemas}
        />
      </div>
    </form>
  )

  const studentId = user?.uuidAluno

  function handleSaveDraft(data: TopicForm) {
    localStorage.setItem('gestaotcc:tema-draft', JSON.stringify(data))

    toast.current?.show({
      severity: 'info',
      summary: 'Rascunho salvo',
      detail: 'Rascunho salvo localmente.',
      life: 5000,
    })
  }

  async function handleSendTopic(data: TopicForm) {
    setIsSubmitting(true)

    if (!selectedProfessor) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Professor não selecionado',
        detail: 'Escolha um professor disponível antes de enviar o tema.',
        life: 5000,
      })
      setIsSubmitting(false)
      return
    }

    if (!studentId) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Aluno não identificado',
        detail: 'Não foi possível identificar o aluno logado para enviar o tema.',
        life: 5000,
      })
      setIsSubmitting(false)
      return
    }

    try {
      const tema = await createTemaTcc({
        uuidAluno: studentId,
        titulo: data.title,
        descricao: data.description,
        area: data.area,
        linhaPesquisa: data.researchLine,
        uuidProfessor: selectedProfessor.uuidProfessor,
      })

      setCreatedTema(tema)

      toast.current?.show({
        severity: 'success',
        summary: 'Solicitação enviada',
        detail: 'Seu tema foi enviado com sucesso para o backend.',
        life: 5000,
      })
    } catch (error) {
      console.error(error)
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao cadastrar',
        detail: 'Não foi possível cadastrar o tema. Tente novamente.',
        life: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function loadTemas() {
    setIsLoadingTemas(true)

    try {
      const params = studentId ? { uuidAluno: studentId } : undefined
      const data = await getTemaTccList(params)
      setTemas(data)
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

  async function loadProfessores(area: string, linhaPesquisa: string) {
    setIsLoadingProfessores(true)

    try {
      const data = await getProfessorRecommendations({ area, linhaPesquisa })

      setProfessores(data)

      toast.current?.show({
        severity: 'success',
        summary: 'Professores carregados',
        detail: `Encontrados ${data.length} professores para os filtros selecionados.`,
        life: 5000,
      })
    } catch (error) {
      console.error(error)
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar professores',
        detail: 'Falha ao buscar os professores. Tente novamente.',
        life: 5000,
      })
    } finally {
      setIsLoadingProfessores(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Registrar Tema de TCC</h1>
          <p>
            Informe os dados do seu tema de Trabalho de Conclusão de Curso. Após o
            cadastro, ele será analisado pelo possível orientador.
          </p>
        </div>
      </section>

      <section className="student-topic-grid">
        {requestPanel}

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
                <span>Seu tema ainda não foi enviado.</span>
              </div>
            </div>
            <p className="muted-text">
              Salve como rascunho para continuar editando. Quando estiver pronto,
              clique em <strong>Cadastrar Tema</strong> para enviar para análise.
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

          <InfoPanel icon="pi pi-users" title="Professores disponíveis">
            {isLoadingProfessores ? (
              <div className="loading-panel">
                <ProgressSpinner strokeWidth="4" />
              </div>
            ) : professores.length > 0 ? (
              <>
                <p className="muted-text">Selecione um professor disponível abaixo.</p>
                <ul className="tema-list">
                  {professores.map((professor) => (
                    <li
                      key={professor.uuidProfessor}
                      className={`professor-item ${selectedProfessor?.uuidProfessor === professor.uuidProfessor ? 'is-selected' : ''}`}
                      onClick={() => setSelectedProfessor(professor)}
                    >
                      <strong>{professor.nome}</strong>
                      <span>{professor.email ?? 'Sem email registrado'}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : area && researchLine ? (
              <div className="empty-state">
                <p>Nenhum professor encontrado para os filtros selecionados.</p>
              </div>
            ) : (
              <p>Selecione área e linha de pesquisa para ver os professores disponíveis.</p>
            )}
          </InfoPanel>
        </aside>
      </section>
    </div>
  )
}

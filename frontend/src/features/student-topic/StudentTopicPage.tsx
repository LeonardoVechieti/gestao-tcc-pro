import { useCallback, useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import type { TagProps } from 'primereact/tag'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  addStudentOrientationResponse,
  getAlunoOrientations,
  type OrientationItem,
  type OrientationStage,
  type OrientationStatus,
} from '../../shared/api/orientation-api'
import { createTemaTcc, getTemaTccList, type TemaTcc } from '../../shared/api/tema-tcc-api'
import { getProfessorRecommendations, type ProfessorRecommendation } from '../../shared/api/professor-api'
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

const statusLabel: Record<OrientationStatus, string> = {
  solicitacao_pendente: 'Solicitação pendente',
  tema_pendente: 'Tema pendente',
  ajustes_solicitados: 'Ajustes solicitados',
  em_acompanhamento: 'Em acompanhamento',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  banca: 'Banca',
  cancelado: 'Cancelado',
}

const statusSeverity: Record<OrientationStatus, TagProps['severity']> = {
  solicitacao_pendente: 'warning',
  tema_pendente: 'warning',
  ajustes_solicitados: 'danger',
  em_acompanhamento: 'info',
  aprovado: 'success',
  recusado: 'danger',
  banca: 'warning',
  cancelado: 'danger',
}

const stageLabel: Record<OrientationStage['status'], string> = {
  pendente: 'Pendente',
  em_analise: 'Em análise',
  concluida: 'Concluída',
}

const stageSeverity: Record<OrientationStage['status'], TagProps['severity']> = {
  pendente: 'secondary',
  em_analise: 'warning',
  concluida: 'success',
}

function formatDateBr(date?: string): string {
  if (!date || date === 'A definir') {
    return date ?? 'A definir'
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString('pt-BR')
}

function sortStudentOrientations(orientations: OrientationItem[]): OrientationItem[] {
  return [...orientations].sort((current, next) => {
    const currentTime = Date.parse(current.atualizadoEm)
    const nextTime = Date.parse(next.atualizadoEm)

    return (Number.isNaN(nextTime) ? 0 : nextTime) - (Number.isNaN(currentTime) ? 0 : currentTime)
  })
}

export function StudentTopicPage() {
  const user = useAuthStore((state) => state.user)
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
  const [studentOrientations, setStudentOrientations] = useState<OrientationItem[]>([])
  const [isLoadingProfessores, setIsLoadingProfessores] = useState(false)
  const [isLoadingMinhaSolicitacao, setIsLoadingMinhaSolicitacao] = useState(false)
  const [hasLoadedMinhaSolicitacao, setHasLoadedMinhaSolicitacao] = useState(false)
  const [acompanhamentoError, setAcompanhamentoError] = useState(false)
  const [studentReply, setStudentReply] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [proposalDraft, setProposalDraft] = useState<TopicForm>({
    title: '',
    area: '',
    researchLine: '',
    description: '',
  })

  const title = watch('title')
  const area = watch('area')
  const researchLine = watch('researchLine')
  const description = watch('description')
  const studentId = user?.uuidAluno ?? user?.aluno?.uuidAluno
  const currentOrientation = studentOrientations[0] ?? null
  const latestAdjustment = currentOrientation?.comentarios.find((comment) =>
    ['ajuste_tema', 'ajuste_trabalho'].includes(comment.categoria ?? ''),
  )
  const canReplyToProfessor = Boolean(
    currentOrientation &&
      currentOrientation.status !== 'aprovado' &&
      currentOrientation.status !== 'cancelado' &&
      currentOrientation.status !== 'recusado' &&
      (currentOrientation.comentarios.length > 0 ||
        currentOrientation.status === 'ajustes_solicitados'),
  )
  const canEditAdjustedTheme = Boolean(
    currentOrientation?.status === 'ajustes_solicitados' &&
      (currentOrientation.sourceType === 'tema' || latestAdjustment?.categoria === 'ajuste_tema'),
  )
  const isProposalDraftValid =
    !canEditAdjustedTheme ||
    (proposalDraft.title.trim().length >= 8 &&
      proposalDraft.area.trim().length > 0 &&
      proposalDraft.researchLine.trim().length > 0 &&
      proposalDraft.description.trim().length >= 80)
  const isStudentReplyDisabled =
    isSendingReply || !currentOrientation || studentReply.trim().length === 0 || !isProposalDraftValid

  const loadAcompanhamentoAluno = useCallback(async () => {
    setIsLoadingMinhaSolicitacao(true)
    setAcompanhamentoError(false)

    try {
      const data = await getAlunoOrientations(studentId)
      const sorted = sortStudentOrientations(data)
      const primary = sorted[0]

      setStudentOrientations(sorted)

      if (primary) {
        setCreatedTema(null)
      }

      if (primary?.professor?.uuidProfessor) {
        setSelectedProfessor({
          uuidProfessor: primary.professor.uuidProfessor,
          nome: primary.professor.nome ?? 'Professor não informado',
          email: primary.professor.email,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar acompanhamento do aluno:', error)
      setStudentOrientations([])
      setAcompanhamentoError(true)
    } finally {
      setIsLoadingMinhaSolicitacao(false)
      setHasLoadedMinhaSolicitacao(true)
    }
  }, [studentId])

  useEffect(() => {
    if (area && researchLine) {
      void loadProfessores(area, researchLine)
    }
  }, [area, researchLine])

  useEffect(() => {
    void loadAcompanhamentoAluno()
  }, [loadAcompanhamentoAluno])

  useEffect(() => {
    if (!currentOrientation) {
      return
    }

    setProposalDraft({
      title: currentOrientation.titulo === 'Tema não encontrado' ? '' : currentOrientation.titulo,
      area: currentOrientation.area === 'Área não informada' ? '' : currentOrientation.area,
      researchLine:
        currentOrientation.linhaPesquisa === 'Linha não informada'
          ? ''
          : currentOrientation.linhaPesquisa,
      description:
        currentOrientation.resumo === 'Proposta de tema aguardando análise.'
          ? ''
          : currentOrientation.resumo,
    })
  }, [currentOrientation])

  const requirements = [
    { label: 'Título provisório', done: title.trim().length >= 8 },
    { label: 'Área de interesse', done: area.trim().length > 0 },
    { label: 'Linha de pesquisa', done: researchLine.trim().length > 0 },
    { label: 'Descrição / justificativa', done: description.trim().length >= 80 },
    { label: 'Professor selecionado', done: Boolean(selectedProfessor) },
  ]

  const isRequestSent = Boolean(currentOrientation || createdTema)
  const submittedProfessor = currentOrientation?.professor ?? selectedProfessor
  const submittedTitle = currentOrientation?.titulo ?? createdTema?.titulo
  const submittedArea = currentOrientation?.area ?? createdTema?.area
  const submittedLine = currentOrientation?.linhaPesquisa ?? createdTema?.linhaPesquisa
  const submittedDescription = currentOrientation?.resumo ?? createdTema?.descricao
  const submittedStatus = currentOrientation
    ? statusLabel[currentOrientation.status]
    : createdTema?.status ?? 'Solicitação pendente'

  const requestPanel = isLoadingMinhaSolicitacao ? (
    <div className="form-panel">
      <Toast ref={toast} />
      <div className="loading-panel">
        <ProgressSpinner strokeWidth="4" />
      </div>
    </div>
  ) : isRequestSent ? (
    <div className="form-panel">
      <Toast ref={toast} />
      <div className="submitted-panel">
        <div className="submitted-panel__header">
          <div>
            <h2>
              {currentOrientation?.sourceType === 'tcc'
                ? 'TCC em acompanhamento'
                : 'Solicitação recebida'}
            </h2>
            <p>
              {currentOrientation
                ? currentOrientation.etapaAtual
                : 'Seu pedido de tema foi enviado e está aguardando aprovação.'}
            </p>
          </div>
          <Tag
            severity={currentOrientation ? statusSeverity[currentOrientation.status] : 'warning'}
            value={submittedStatus}
          />
        </div>

        <div className="submitted-details">
          <div>
            <strong>Título:</strong>
            <p>{submittedTitle}</p>
          </div>
          <div>
            <strong>Área:</strong>
            <p>{submittedArea}</p>
          </div>
          <div>
            <strong>Linha de pesquisa:</strong>
            <p>{submittedLine}</p>
          </div>
          <div>
            <strong>Professor indicado/orientador:</strong>
            <p>{submittedProfessor?.nome ?? 'Não informado'}</p>
            <p>{submittedProfessor?.email ?? ''}</p>
          </div>
          <div>
            <strong>Última atualização:</strong>
            <p>{formatDateBr(currentOrientation?.atualizadoEm)}</p>
          </div>
          <div>
            <strong>Progresso:</strong>
            <p>{currentOrientation ? `${currentOrientation.progresso}%` : '0%'}</p>
          </div>
        </div>

        {submittedDescription ? <p className="muted-text">{submittedDescription}</p> : null}

        {currentOrientation ? (
          <>
            <section className="submitted-section">
              <div className="section-title">
                <div>
                  <h2>Etapas</h2>
                  <span>Somente etapas reais vinculadas ao TCC são exibidas aqui.</span>
                </div>
              </div>

              {currentOrientation.etapas.length > 0 ? (
                <div className="orientation-stage-list">
                  {currentOrientation.etapas.map((stage) => (
                    <div className="orientation-stage-row" key={stage.id}>
                      <span className="orientation-stage-icon">
                        <i className="pi pi-flag" aria-hidden="true" />
                      </span>
                      <div>
                        <strong>{stage.titulo}</strong>
                        <span>Prazo: {formatDateBr(stage.prazo)}</span>
                      </div>
                      <Tag severity={stageSeverity[stage.status]} value={stageLabel[stage.status]} />
                    </div>
                  ))}
                </div>
              ) : (
                <Message
                  severity="info"
                  text="As etapas serão exibidas quando o tema for aprovado e virar um TCC."
                />
              )}
            </section>

            <section className="submitted-section">
              <div className="section-title">
                <div>
                  <h2>Comentários</h2>
                  <span>Mensagens registradas pelo professor ou pelo sistema.</span>
                </div>
              </div>

              {currentOrientation.comentarios.length > 0 ? (
                <div className="orientation-comments-list">
                  {currentOrientation.comentarios.map((comment) => (
                    <article key={comment.id}>
                      <div>
                        <strong>{comment.autor}</strong>
                        <Tag severity={comment.tipo === 'Professor' ? 'info' : 'secondary'} value={comment.tipo} />
                        <small>{formatDateBr(comment.data)}</small>
                      </div>
                      <p>{comment.mensagem}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <Message severity="info" text="Nenhum comentário registrado para esta solicitação." />
              )}
            </section>

            {canReplyToProfessor ? (
              <section className="submitted-section student-response-form">
                <div className="section-title">
                  <div>
                    <h2>Resposta do aluno</h2>
                    <span>
                      {currentOrientation.status === 'ajustes_solicitados'
                        ? 'Retorne a solicitação para reanálise do professor.'
                        : 'Envie uma mensagem para o professor.'}
                    </span>
                  </div>
                </div>

                {canEditAdjustedTheme ? (
                  <div className="student-response-grid">
                    <FormField label="Título revisado *" htmlFor="proposal-title">
                      <InputText
                        id="proposal-title"
                        value={proposalDraft.title}
                        disabled={isSendingReply}
                        onChange={(event) =>
                          setProposalDraft((draft) => ({ ...draft, title: event.target.value }))
                        }
                      />
                    </FormField>

                    <FormField label="Área revisada *" htmlFor="proposal-area">
                      <Dropdown
                        id="proposal-area"
                        options={areaOptions}
                        value={proposalDraft.area}
                        disabled={isSendingReply}
                        onChange={(event) =>
                          setProposalDraft((draft) => ({ ...draft, area: event.value }))
                        }
                      />
                    </FormField>

                    <FormField label="Linha revisada *" htmlFor="proposal-line">
                      <Dropdown
                        id="proposal-line"
                        options={lineOptions}
                        value={proposalDraft.researchLine}
                        disabled={isSendingReply}
                        onChange={(event) =>
                          setProposalDraft((draft) => ({ ...draft, researchLine: event.value }))
                        }
                      />
                    </FormField>

                    <FormField label="Descrição revisada *" htmlFor="proposal-description">
                      <InputTextarea
                        id="proposal-description"
                        value={proposalDraft.description}
                        rows={6}
                        disabled={isSendingReply}
                        onChange={(event) =>
                          setProposalDraft((draft) => ({
                            ...draft,
                            description: event.target.value,
                          }))
                        }
                      />
                    </FormField>
                  </div>
                ) : null}

                {!isProposalDraftValid ? (
                  <Message
                    severity="warn"
                    text="Revise título, área, linha de pesquisa e descrição antes de responder."
                  />
                ) : null}

                <FormField label="Mensagem *" htmlFor="student-reply">
                  <InputTextarea
                    id="student-reply"
                    value={studentReply}
                    rows={4}
                    disabled={isSendingReply}
                    onChange={(event) => setStudentReply(event.target.value)}
                  />
                </FormField>

                <div className="submitted-actions">
                  <Button
                    icon="pi pi-send"
                    label="Enviar resposta"
                    loading={isSendingReply}
                    onClick={() => void handleStudentResponse()}
                    type="button"
                    disabled={isStudentReplyDisabled}
                  />
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <Message severity="info" text="Acompanhamento será atualizado após a confirmação do backend." />
        )}

        <div className="submitted-actions">
          <Button
            icon="pi pi-refresh"
            label="Atualizar acompanhamento"
            onClick={() => void loadAcompanhamentoAluno()}
            outlined
            type="button"
            disabled={!studentId || isLoadingMinhaSolicitacao}
          />
        </div>
      </div>
    </div>
  ) : (
    <form className="form-panel" onSubmit={handleSubmit(handleSendTopic)}>
      <Toast ref={toast} />
      <div className={`form-loading ${isSubmitting ? 'active' : ''}`}>
        <ProgressSpinner strokeWidth="4" />
      </div>

      {acompanhamentoError ? (
        <Message
          severity="error"
          text="Não foi possível carregar seu acompanhamento agora. Tente atualizar a página."
        />
      ) : null}

      {hasLoadedMinhaSolicitacao ? (
        <Message severity="info" text="Nenhuma proposta enviada." />
      ) : null}

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

  async function handleStudentResponse() {
    if (!currentOrientation || isStudentReplyDisabled) {
      return
    }

    setIsSendingReply(true)

    try {
      const updated = await addStudentOrientationResponse(currentOrientation, {
        mensagem: studentReply.trim(),
        tema: canEditAdjustedTheme
          ? {
              titulo: proposalDraft.title,
              descricao: proposalDraft.description,
              area: proposalDraft.area,
              linhaPesquisa: proposalDraft.researchLine,
            }
          : undefined,
      })

      setStudentOrientations((orientations) =>
        sortStudentOrientations([
          updated,
          ...orientations.filter((orientation) => orientation.id !== updated.id),
        ]),
      )
      setStudentReply('')

      toast.current?.show({
        severity: 'success',
        summary: 'Resposta enviada',
        detail: 'Sua resposta foi registrada para reanálise.',
        life: 5000,
      })
    } catch (error) {
      console.error(error)
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao responder',
        detail: 'Não foi possível registrar sua resposta. Tente novamente.',
        life: 5000,
      })
    } finally {
      setIsSendingReply(false)
    }
  }

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
      void loadAcompanhamentoAluno()

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
            {isLoadingMinhaSolicitacao ? (
              <div className="loading-panel">
                <ProgressSpinner strokeWidth="4" />
              </div>
            ) : currentOrientation ? (
              <>
                <div className="draft-status">
                  <div className="draft-status__icon">
                    <i className="pi pi-check-circle" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>{statusLabel[currentOrientation.status]}</strong>
                    <span>{currentOrientation.etapaAtual}</span>
                  </div>
                </div>
                <p className="muted-text">
                  Professor: {currentOrientation.professor?.nome ?? 'Não informado'}.
                </p>
                <Tag
                  severity={statusSeverity[currentOrientation.status]}
                  value={currentOrientation.sourceType === 'tcc' ? 'TCC' : 'Proposta'}
                />
              </>
            ) : createdTema ? (
              <>
                <div className="draft-status">
                  <div className="draft-status__icon">
                    <i className="pi pi-send" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Solicitação enviada</strong>
                    <span>Aguardando confirmação do acompanhamento.</span>
                  </div>
                </div>
                <Tag severity="warning" value={createdTema.status ?? 'Solicitação pendente'} />
              </>
            ) : (
              <>
                <div className="draft-status">
                  <div className="draft-status__icon">
                    <i className="pi pi-pencil" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Nenhuma proposta enviada</strong>
                    <span>Seu tema ainda não foi enviado.</span>
                  </div>
                </div>
                <p className="muted-text">
                  Salve como rascunho para continuar editando. Quando estiver pronto,
                  clique em <strong>Solicitar Tema</strong> para enviar para análise.
                </p>
                <Tag severity="warning" value="Aguardando envio" />
              </>
            )}
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

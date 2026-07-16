import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
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
import {
  getProfessorRecommendations,
  getProfessorResearchOptions,
  type ProfessorRecommendation,
} from '../../shared/api/professor-api'
import {
  getResearchOptionLabel,
  professorAreaOptions as defaultAreaOptions,
  professorLineOptions as defaultLineOptions,
  type ResearchOption,
} from '../../shared/professor/research-options'
import { useAuthStore } from '../../shared/stores/auth-store'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

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

const closedOrientationStatuses = new Set<OrientationStatus>(['recusado', 'cancelado'])

function isClosedOrientation(orientation: OrientationItem): boolean {
  return closedOrientationStatuses.has(orientation.status)
}

function isActiveOrientation(orientation: OrientationItem): boolean {
  return !isClosedOrientation(orientation)
}

type ResearchOptionsState = {
  areas: ResearchOption[]
  lines: ResearchOption[]
}

function getTopicDraftFromOrientation(orientation: OrientationItem): TopicForm {
  return {
    title: orientation.titulo === 'Tema não encontrado' ? '' : orientation.titulo,
    area: orientation.area === 'Área não informada' ? '' : orientation.area,
    researchLine:
      orientation.linhaPesquisa === 'Linha não informada' ? '' : orientation.linhaPesquisa,
    description:
      orientation.resumo === 'Proposta de tema aguardando análise.' ? '' : orientation.resumo,
  }
}

function buildResearchOptions(values: string[] | undefined, fallback: ResearchOption[]): ResearchOption[] {
  if (!values || values.length === 0) {
    return fallback
  }

  return values.map((value) => ({
    value,
    label: getResearchOptionLabel(fallback, value),
  }))
}

function getClosureComment(orientation: OrientationItem) {
  return (
    orientation.comentarios.find((comment) =>
      ['recusa', 'cancelar_orientacao'].includes(comment.categoria ?? ''),
    ) ?? orientation.comentarios[0]
  )
}

function TopicFormSection({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode
  description: string
  icon: string
  title: string
}) {
  return (
    <section className="topic-form-section">
      <div className="topic-form-section__header">
        <span className="topic-form-section__icon">
          <i className={icon} aria-hidden="true" />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="topic-form-section__body">{children}</div>
    </section>
  )
}

export function StudentTopicPage() {
  const user = useAuthStore((state) => state.user)
  const {
    control,
    handleSubmit,
    reset,
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
  const [professores, setProfessores] = useState<ProfessorRecommendation[]>([])
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorRecommendation | null>(null)
  const [createdTema, setCreatedTema] = useState<TemaTcc | null>(null)
  const [studentOrientations, setStudentOrientations] = useState<OrientationItem[]>([])
  const [isLoadingProfessores, setIsLoadingProfessores] = useState(false)
  const [isLoadingResearchOptions, setIsLoadingResearchOptions] = useState(false)
  const [isLoadingMinhaSolicitacao, setIsLoadingMinhaSolicitacao] = useState(false)
  const [hasLoadedMinhaSolicitacao, setHasLoadedMinhaSolicitacao] = useState(false)
  const [acompanhamentoError, setAcompanhamentoError] = useState(false)
  const [researchOptions, setResearchOptions] = useState<ResearchOptionsState>({
    areas: defaultAreaOptions,
    lines: defaultLineOptions,
  })
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
  const currentOrientation = studentOrientations.find(isActiveOrientation) ?? null
  const historicalOrientations = studentOrientations.filter(isClosedOrientation)
  const latestHistoricalOrientation = historicalOrientations[0] ?? null
  const latestHistoricalComment = latestHistoricalOrientation
    ? getClosureComment(latestHistoricalOrientation)
    : null
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
      const activeOrientation = sorted.find(isActiveOrientation)

      setStudentOrientations(sorted)

      if (activeOrientation) {
        setCreatedTema(null)
      }

      if (activeOrientation?.professor?.uuidProfessor) {
        setSelectedProfessor({
          uuidProfessor: activeOrientation.professor.uuidProfessor,
          nome: activeOrientation.professor.nome ?? 'Professor não informado',
          email: activeOrientation.professor.email,
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
    void loadResearchOptions()
    void loadAcompanhamentoAluno()
  }, [loadAcompanhamentoAluno])

  useEffect(() => {
    if (!currentOrientation) {
      return
    }

    setProposalDraft(getTopicDraftFromOrientation(currentOrientation))
  }, [currentOrientation])  

  const requirements = [
    { label: 'Título provisório', done: title.trim().length >= 8 },
    { label: 'Área de interesse', done: area.trim().length > 0 },
    { label: 'Linha de pesquisa', done: researchLine.trim().length > 0 },
    { label: 'Descrição / justificativa', done: description.trim().length >= 80 },
    { label: 'Professor selecionado', done: Boolean(selectedProfessor) },
  ]
  const completedRequirements = requirements.filter((item) => item.done).length

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
                        options={researchOptions.areas}
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
                        options={researchOptions.lines}
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
    <form className="form-panel topic-form-panel" onSubmit={handleSubmit(handleSendTopic)}>
      <Toast ref={toast} />
      <div className={`form-loading ${isSubmitting ? 'active' : ''}`}>
        <ProgressSpinner strokeWidth="4" />
      </div>

      <div className="topic-form-header">
        <div>
          <Tag icon="pi pi-file-edit" severity="info" value="Nova proposta" />
          <h2>Dados para análise do orientador</h2>
          <p>Organize a proposta antes de enviar para o professor escolhido.</p>
        </div>
        <div className="topic-form-progress">
          <strong>{completedRequirements}/{requirements.length}</strong>
          <span>itens completos</span>
        </div>
      </div>

      {acompanhamentoError ? (
        <Message
          severity="error"
          text="Não foi possível carregar seu acompanhamento agora. Tente atualizar a página."
        />
      ) : null}

      {hasLoadedMinhaSolicitacao ? (
        latestHistoricalOrientation ? (
          <section className="historical-proposal-panel">
            <div className="submitted-panel__header">
              <div>
                <h2>Última proposta encerrada</h2>
                <p>
                  Esta solicitação ficou no histórico e não bloqueia uma nova proposta.
                </p>
              </div>
              <Tag
                severity={statusSeverity[latestHistoricalOrientation.status]}
                value={statusLabel[latestHistoricalOrientation.status]}
              />
            </div>
            <div className="submitted-details">
              <div>
                <strong>Título:</strong>
                <p>{latestHistoricalOrientation.titulo}</p>
              </div>
              <div>
                <strong>Professor indicado:</strong>
                <p>{latestHistoricalOrientation.professor?.nome ?? 'Não informado'}</p>
                <p>{latestHistoricalOrientation.professor?.email ?? ''}</p>
              </div>
              <div>
                <strong>Atualizado em:</strong>
                <p>{formatDateBr(latestHistoricalOrientation.atualizadoEm)}</p>
              </div>
            </div>
            {latestHistoricalComment ? (
              <Message
                severity={latestHistoricalOrientation.status === 'recusado' ? 'warn' : 'info'}
                text={`${latestHistoricalComment.autor}: ${latestHistoricalComment.mensagem}`}
              />
            ) : null}
            <div className="submitted-actions">
              <Button
                icon="pi pi-copy"
                label="Usar dados da proposta"
                onClick={() => handleReuseHistoricalProposal(latestHistoricalOrientation)}
                outlined
                type="button"
              />
            </div>
          </section>
        ) : (
          <Message severity="info" text="Nenhuma proposta enviada." />
        )
      ) : null}

      <TopicFormSection
        description="Defina o assunto e a área usada para encontrar orientadores compatíveis."
        icon="pi pi-bookmark"
        title="Tema e linha de pesquisa"
      >
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

        <div className="topic-field-grid">
          <FormField label="Área de interesse *" htmlFor="area" error={errors.area?.message}>
            <Controller
              control={control}
              name="area"
              render={({ field }) => (
                <Dropdown
                  id="area"
                  invalid={Boolean(errors.area)}
                  options={researchOptions.areas}
                  placeholder="Selecione a área de interesse"
                  disabled={isSubmitting || isLoadingResearchOptions}
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
                  options={researchOptions.lines}
                  placeholder="Selecione a linha de pesquisa"
                  disabled={isSubmitting || isLoadingResearchOptions}
                  value={field.value}
                  onChange={(event) => field.onChange(event.value)}
                />
              )}
            />
          </FormField>
        </div>
      </TopicFormSection>

      <TopicFormSection
        description="A lista aparece conforme a área e linha de pesquisa escolhidas."
        icon="pi pi-users"
        title="Professor orientador"
      >
        <div className="professor-picker">
          {isLoadingProfessores ? (
            <div className="loading-panel">
              <ProgressSpinner strokeWidth="4" />
            </div>
          ) : area && researchLine ? (
            professores.length > 0 ? (
              <>
                <ul className="tema-list topic-professor-list">
                  {professores.map((professor) => (
                    <li key={professor.uuidProfessor}>
                      <button
                        className={`professor-item ${
                          selectedProfessor?.uuidProfessor === professor.uuidProfessor
                            ? 'is-selected'
                            : ''
                        }`}
                        onClick={() => setSelectedProfessor(professor)}
                        type="button"
                      >
                        <span>
                          <strong>{professor.nome}</strong>
                          <small>{professor.email ?? 'Sem e-mail registrado'}</small>
                        </span>
                        {selectedProfessor?.uuidProfessor === professor.uuidProfessor ? (
                          <i className="pi pi-check-circle" aria-hidden="true" />
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
                {selectedProfessor ? (
                  <div className="selected-professor-summary">
                    <strong>Professor selecionado</strong>
                    <p>{selectedProfessor.nome}</p>
                    <p>{selectedProfessor.email ?? 'Sem e-mail registrado'}</p>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Selecione um professor para incluir na solicitação.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>Nenhum professor encontrado para os filtros selecionados.</p>
              </div>
            )
          ) : (
            <div className="empty-state">
              <p>Informe área e linha de pesquisa para carregar os professores disponíveis.</p>
            </div>
          )}
          {!selectedProfessor && area && researchLine && !isLoadingProfessores ? (
            <Message
              severity="warn"
              text="A indicação de professor é obrigatória antes de enviar a solicitação."
            />
          ) : null}
        </div>
      </TopicFormSection>

      <TopicFormSection
        description="Explique relevância, problema de pesquisa, objetivos e contexto do trabalho."
        icon="pi pi-align-left"
        title="Descrição e justificativa"
      >
        <FormField
          label="Descrição / justificativa *"
          htmlFor="description"
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
                placeholder="Descreva seu tema, justificativa, problema de pesquisa, objetivos e relevância para a área escolhida..."
                rows={7}
                disabled={isSubmitting}
                {...field}
              />
            )}
          />
        </FormField>
      </TopicFormSection>

      <div className="form-actions">
        <Button
          icon="pi pi-send"
          label="Solicitar tema"
          loading={isSubmitting}
          type="submit"
          disabled={isSubmitting || !selectedProfessor}
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

  function handleReuseHistoricalProposal(orientation: OrientationItem) {
    const draft = getTopicDraftFromOrientation(orientation)
    reset(draft)
    setCreatedTema(null)

    if (orientation.professor?.uuidProfessor) {
      setSelectedProfessor({
        uuidProfessor: orientation.professor.uuidProfessor,
        nome: orientation.professor.nome ?? 'Professor não informado',
        email: orientation.professor.email,
      })
    }

    toast.current?.show({
      severity: 'info',
      summary: 'Dados reaproveitados',
      detail: 'Revise os dados antes de enviar uma nova proposta.',
      life: 5000,
    })
  }

  async function handleSendTopic(data: TopicForm) {
    setIsSubmitting(true)

    console.log('Student topic submit debug:', {
      user,
      studentId,
      selectedProfessor,
      title: data.title,
      area: data.area,
      researchLine: data.researchLine,
    })

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

  async function loadResearchOptions() {
    setIsLoadingResearchOptions(true)

    try {
      const data = await getProfessorResearchOptions()
      setResearchOptions({
        areas: buildResearchOptions(data.areas, defaultAreaOptions),
        lines: buildResearchOptions(data.lines, defaultLineOptions),
      })
    } catch (error) {
      console.error('Erro ao carregar opções de pesquisa:', error)
      setResearchOptions({
        areas: defaultAreaOptions,
        lines: defaultLineOptions,
      })
    } finally {
      setIsLoadingResearchOptions(false)
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
          <h1>Registrar tema de TCC</h1>
          <p>
            Informe os dados do seu tema de Trabalho de Conclusão de Curso. Após o
            cadastro, ele será analisado pelo possível orientador.
          </p>
        </div>
      </section>

      <section className="student-topic-grid">
        {requestPanel}
      </section>
    </div>
  )
}

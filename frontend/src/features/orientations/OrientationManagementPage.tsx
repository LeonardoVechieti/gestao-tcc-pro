import { useEffect, useMemo, useState } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { ProgressBar } from 'primereact/progressbar'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import type { TagProps } from 'primereact/tag'
import {
  addOrientationComment,
  approveOrientation,
  approveThemeWithDeadlines,
  cancelOrientation,
  completeOrientationStage,
  getManagedOrientations,
  rejectOrientation,
  requestOrientationAdjustments,
  type OrientationItem,
  type OrientationStage,
  type OrientationStatus,
} from '../../shared/api/orientation-api'

type OrientationFilter = OrientationStatus | 'todos'
type ModalAction =
  | 'ajustes_tema'
  | 'ajustes_trabalho'
  | 'comentario'
  | 'recusa'
  | 'cancelamento'
  | null

type ApprovalDeadlines = {
  'Tema aprovado'?: Date
  'Projeto de TCC'?: Date
  'Entrega parcial'?: Date
  'Versão final'?: Date
  Banca?: Date
}

const statusOptions: { label: string; value: OrientationFilter }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Solicitações', value: 'solicitacao_pendente' },
  { label: 'Temas pendentes', value: 'tema_pendente' },
  { label: 'Ajustes', value: 'ajustes_solicitados' },
  { label: 'Em acompanhamento', value: 'em_acompanhamento' },
  { label: 'Aprovados', value: 'aprovado' },
  { label: 'Recusados', value: 'recusado' },
  { label: 'Banca', value: 'banca' },
  { label: 'Cancelados', value: 'cancelado' },
]

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

const stageSeverity: Record<OrientationStage['status'], TagProps['severity']> = {
  pendente: 'secondary',
  em_analise: 'warning',
  concluida: 'success',
}

const stageLabel: Record<OrientationStage['status'], string> = {
  pendente: 'Pendente',
  em_analise: 'Em análise',
  concluida: 'Concluída',
}

const requiredStageOrder = [
  'Tema aprovado',
  'Projeto de TCC',
  'Entrega parcial',
  'Versão final',
  'Banca',
]

function normalizeStageTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getStageOrder(stage: OrientationStage): number {
  const normalizedTitle = normalizeStageTitle(stage.titulo)
  const index = requiredStageOrder.findIndex((title) =>
    normalizedTitle.includes(normalizeStageTitle(title)),
  )

  return index >= 0 ? index : requiredStageOrder.length
}

function sortOrientationStages(stages: OrientationStage[]): OrientationStage[] {
  return [...stages].sort((current, next) => getStageOrder(current) - getStageOrder(next))
}

function formatDateBr(date: string): string {
  if (date === 'A definir') {
    return date
  }

  const parsed = new Date(date)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('pt-BR')
  }

  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}/${month}/${year}` : date
}

function getSummary(orientations: OrientationItem[]) {
  return {
    solicitacoes: orientations.filter((item) => item.status === 'solicitacao_pendente').length,
    temas: orientations.filter((item) => item.status === 'tema_pendente').length,
    ajustes: orientations.filter((item) => item.status === 'ajustes_solicitados').length,
    acompanhamento: orientations.filter((item) => item.status === 'em_acompanhamento').length,
    total: orientations.length,
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? 'O'
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
  return `${first}${second}`.toUpperCase()
}

function canApproveTheme(orientation: OrientationItem): boolean {
  return (
    orientation.sourceType === 'tema' &&
    ['tema_pendente', 'ajustes_solicitados'].includes(orientation.status)
  )
}

function canRejectOrientation(orientation: OrientationItem): boolean {
  return (
    orientation.sourceType === 'tema' &&
    ['solicitacao_pendente', 'tema_pendente', 'ajustes_solicitados'].includes(orientation.status)
  )
}

function canRequestThemeAdjustments(orientation: OrientationItem): boolean {
  return (
    orientation.sourceType === 'tema' &&
    ['solicitacao_pendente', 'tema_pendente', 'em_acompanhamento'].includes(orientation.status)
  )
}

function canRequestWorkAdjustments(orientation: OrientationItem): boolean {
  return (
    orientation.sourceType === 'tcc' &&
    ['em_acompanhamento', 'ajustes_solicitados'].includes(orientation.status)
  )
}

function canManageActiveOrientation(orientation: OrientationItem): boolean {
  return (
    orientation.sourceType === 'tcc' &&
    ['em_acompanhamento', 'ajustes_solicitados'].includes(orientation.status)
  )
}

function OrientationCard({
  isSelected,
  orientation,
  onSelect,
}: {
  isSelected: boolean
  orientation: OrientationItem
  onSelect: () => void
}) {
  const currentStage =
    orientation.etapaAtual ||
    orientation.etapas.find((stage) => stage.status !== 'concluida')?.titulo ||
    'Aguardando análise'

  return (
    <button
      className={isSelected ? 'orientation-card is-selected' : 'orientation-card'}
      onClick={onSelect}
      type="button"
    >
      <span className="orientation-card__avatar">{getInitials(orientation.aluno)}</span>
      <span className="orientation-card__content">
        <span className="orientation-card__header">
          <strong>{orientation.aluno}</strong>
          <Tag severity={statusSeverity[orientation.status]} value={statusLabel[orientation.status]} />
        </span>
        <small>{orientation.titulo}</small>
        <span className="orientation-card__meta">
          <span>
            <i className="pi pi-flag" aria-hidden="true" />
            {currentStage}
          </span>
          <span>
            <i className="pi pi-clock" aria-hidden="true" />
            {formatDateBr(orientation.atualizadoEm)}
          </span>
        </span>
        <span className="orientation-card__progress" aria-hidden="true">
          <span style={{ width: `${orientation.progresso}%` }} />
        </span>
      </span>
    </button>
  )
}

function StageRow({
  canComplete,
  onComplete,
  stage,
}: {
  canComplete: boolean
  onComplete: (stageId: string) => void
  stage: OrientationStage
}) {
  return (
    <article className="orientation-stage-row">
      <div className="orientation-stage-icon">
        <i className={stage.status === 'concluida' ? 'pi pi-check' : 'pi pi-clock'} aria-hidden="true" />
      </div>
      <div>
        <strong>{stage.titulo}</strong>
        <span>Prazo: {formatDateBr(stage.prazo)}</span>
      </div>
      <Tag severity={stageSeverity[stage.status]} value={stageLabel[stage.status]} />
      {canComplete && (
        <Button
          icon="pi pi-check-circle"
          onClick={() => onComplete(stage.id)}
          outlined
          rounded
          severity="success"
          size="small"
          tooltip="Concluir esta etapa"
          type="button"
        />
      )}
    </article>
  )
}

type CompletingStageState = {
  stageId: string | null
  nota: number | undefined
}

export function OrientationManagementPage() {
  const [orientations, setOrientations] = useState<OrientationItem[] | null>(null)
  const [selectedId, setSelectedId] = useState<string>()
  const [filter, setFilter] = useState<OrientationFilter>('todos')
  const [modalAction, setModalAction] = useState<ModalAction>(null)
  const [modalText, setModalText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [completingStage, setCompletingStage] = useState<CompletingStageState>({
    stageId: null,
    nota: undefined,
  })
  const [approvingWithDeadlines, setApprovingWithDeadlines] = useState<string | null>(null)
  const [deadlines, setDeadlines] = useState<ApprovalDeadlines>({})

  useEffect(() => {
    let cancelled = false

    getManagedOrientations()
      .then((result) => {
        if (!cancelled) {
          setLoadError(false)
          setOrientations(result)
          setSelectedId(result[0]?.id)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          setOrientations([])
          setSelectedId(undefined)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => getSummary(orientations ?? []), [orientations])
  const summaryCards = [
    { label: 'Total', value: summary.total, icon: 'pi pi-list', tone: 'blue' },
    { label: 'Solicitações', value: summary.solicitacoes, icon: 'pi pi-inbox', tone: 'orange' },
    { label: 'Temas pendentes', value: summary.temas, icon: 'pi pi-file-edit', tone: 'purple' },
    { label: 'Ajustes', value: summary.ajustes, icon: 'pi pi-refresh', tone: 'danger' },
    { label: 'Em acompanhamento', value: summary.acompanhamento, icon: 'pi pi-check-circle', tone: 'green' },
  ]
  const filteredOrientations = useMemo(() => {
    return (orientations ?? []).filter((orientation) => filter === 'todos' || orientation.status === filter)
  }, [filter, orientations])
  const selected = useMemo(
    () => orientations?.find((orientation) => orientation.id === selectedId) ?? filteredOrientations[0],
    [filteredOrientations, orientations, selectedId],
  )
  const selectedStages = useMemo(() => sortOrientationStages(selected?.etapas ?? []), [selected])
  const selectedCurrentStage =
    selectedStages.length === 0
      ? selected?.etapaAtual ?? 'Etapas ainda não criadas'
      : selectedStages.find((stage) => stage.status !== 'concluida')?.titulo ?? 'Todas as etapas concluídas'
  const selectedNextStageId = selectedStages.find((stage) => stage.status !== 'concluida')?.id

  function replaceSelected(updated: OrientationItem) {
    if (!selected) {
      return
    }

    setOrientations((current) =>
      current?.map((orientation) => (orientation.id === selected.id ? updated : orientation)) ?? null,
    )
    setSelectedId(updated.id)
  }

  async function runAction(action: (orientation: OrientationItem) => Promise<OrientationItem>) {
    if (!selected || isSaving) {
      return
    }

    setIsSaving(true)
    try {
      replaceSelected(await action(selected))
    } finally {
      setIsSaving(false)
    }
  }

  async function completeStage(stageId: string) {
    const stage = selected?.etapas.find((s) => s.id === stageId)
    const isBanca = stage?.titulo === 'Banca'

    if (isBanca) {
      setCompletingStage({ stageId, nota: undefined })
      return
    }

    await runAction((orientation) => completeOrientationStage(orientation, stageId))
  }

  function openDeadlinesModal(orientationId: string) {
    setApprovingWithDeadlines(orientationId)
    setDeadlines({})
  }

  async function submitDeadlines() {
    if (!approvingWithDeadlines) return

    // Validar que próxima etapa (Tema aprovado) tem prazo
    if (!deadlines['Tema aprovado']) {
      return
    }

    const prazosPayload: Record<string, string> = {}
    Object.entries(deadlines).forEach(([titulo, date]) => {
      if (date) {
        const dateStr = date.toISOString().split('T')[0]
        prazosPayload[titulo] = dateStr
      }
    })

    try {
      await runAction((orientation) => approveThemeWithDeadlines(orientation, prazosPayload))
      setApprovingWithDeadlines(null)
      setDeadlines({})
    } catch (error) {
      console.error(error)
    }
  }

  async function submitBancaNota() {
    if (completingStage.stageId === null) return

    if (completingStage.nota === undefined) {
      return
    }

    try {
      await runAction((orientation) =>
        completeOrientationStage(orientation, completingStage.stageId!, completingStage.nota),
      )
      setCompletingStage({ stageId: null, nota: undefined })
    } catch (error) {
      console.error(error)
    }
  }

  async function submitModalAction() {
    if (!modalAction || !modalText.trim()) {
      return
    }

    const message = modalText.trim()
    await runAction((orientation) => {
      if (modalAction === 'comentario') {
        return addOrientationComment(orientation, message)
      }

      if (modalAction === 'recusa') {
        return rejectOrientation(orientation, message)
      }

      if (modalAction === 'cancelamento') {
        return cancelOrientation(orientation, message)
      }

      return requestOrientationAdjustments(
        orientation,
        message,
        modalAction === 'ajustes_trabalho' ? 'trabalho' : 'tema',
      )
    })
    setModalAction(null)
    setModalText('')
  }

  if (!orientations) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  return (
    <div className="page-stack orientation-page">
      <section className="page-header">
        <div>
          <Tag icon="pi pi-users" severity="info" value="Orientação" />
          <h1>Gestão da orientação</h1>
          <p>Acompanhe solicitações, propostas, ajustes, comentários e etapas reais registradas no sistema.</p>
        </div>
      </section>

      {loadError && (
        <Message
          severity="error"
          text="Não foi possível carregar as orientações do backend. Nenhum dado fictício foi exibido."
        />
      )}

      <section className="orientation-summary-grid">
        {summaryCards.map((card) => (
          <article className={`orientation-summary-card orientation-summary-card--${card.tone}`} key={card.label}>
            <span className="orientation-summary-card__icon">
              <i className={card.icon} aria-hidden="true" />
            </span>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="orientation-workspace">
        <aside className="orientation-list">
          <div className="section-title">
            <div>
              <h2>Orientandos</h2>
              <span>{filteredOrientations.length} registro(s) no filtro atual</span>
            </div>
            <Dropdown
              onChange={(event) => setFilter(event.value as OrientationFilter)}
              options={statusOptions}
              value={filter}
            />
          </div>

          <div className="orientation-list-items">
            {filteredOrientations.length > 0 ? (
              filteredOrientations.map((orientation) => (
                <OrientationCard
                  isSelected={orientation.id === selected?.id}
                  key={orientation.id}
                  onSelect={() => setSelectedId(orientation.id)}
                  orientation={orientation}
                />
              ))
            ) : (
              <div className="orientation-list-empty">
                <i className="pi pi-inbox" aria-hidden="true" />
                <span>Nenhuma orientação encontrada no banco.</span>
              </div>
            )}
          </div>
        </aside>

        {selected ? (
          <main className="orientation-detail">
            <section className="orientation-hero">
              <div>
                <div className="orientation-hero__badges">
                  <Tag severity={statusSeverity[selected.status]} value={statusLabel[selected.status]} />
                  <Tag
                    severity={selected.sourceType === 'tcc' ? 'info' : 'secondary'}
                    value={selected.sourceType === 'tcc' ? 'TCC em andamento' : 'Proposta de tema'}
                  />
                </div>
                <h2>{selected.titulo}</h2>
                <p>{selected.resumo}</p>
              </div>
              <div className="orientation-meta-grid">
                <div>
                  <span>Aluno</span>
                  <strong>{selected.aluno}</strong>
                </div>
                <div>
                  <span>Área</span>
                  <strong>{selected.area}</strong>
                </div>
                <div>
                  <span>Linha de pesquisa</span>
                  <strong>{selected.linhaPesquisa}</strong>
                </div>
                <div>
                  <span>Atualizado em</span>
                  <strong>{formatDateBr(selected.atualizadoEm)}</strong>
                </div>
              </div>
            </section>

            <section className="orientation-actions-panel">
              <div className="section-title">
                <div>
                  <h2>Ações do professor</h2>
                  <span>Ações disponíveis conforme status da orientação selecionada.</span>
                </div>
              </div>
              <div className="orientation-actions">
                {selected.status === 'solicitacao_pendente' && (
                  <Button
                    disabled={isSaving}
                    icon="pi pi-check"
                    label="Aprovar orientação"
                    loading={isSaving}
                    onClick={() => runAction(approveOrientation)}
                    severity="success"
                  />
                )}
                {canApproveTheme(selected) && (
                  <Button
                    disabled={isSaving}
                    icon="pi pi-verified"
                    label="Aprovar tema"
                    loading={isSaving}
                    onClick={() => selected && openDeadlinesModal(selected.id)}
                    severity="success"
                  />
                )}
                {canRequestThemeAdjustments(selected) && (
                  <Button
                    disabled={isSaving}
                    icon="pi pi-file-edit"
                    label="Solicitar ajustes"
                    onClick={() => setModalAction('ajustes_tema')}
                    outlined
                    severity="warning"
                  />
                )}
                <Button
                  disabled={isSaving}
                  icon="pi pi-comment"
                  label="Registrar comentário"
                  onClick={() => setModalAction('comentario')}
                  outlined
                />
                {canRejectOrientation(selected) && (
                  <Button
                    disabled={isSaving}
                    icon="pi pi-times"
                    label="Recusar"
                    onClick={() => setModalAction('recusa')}
                    outlined
                    severity="danger"
                  />
                )}
              </div>
            </section>

            {canManageActiveOrientation(selected) && (
              <section className="orientation-secondary-actions">
                <Button
                  disabled={isSaving}
                  icon="pi pi-ban"
                  label="Cancelar orientação"
                  onClick={() => setModalAction('cancelamento')}
                  outlined
                  severity="danger"
                />
              </section>
            )}

            <section className="orientation-progress-panel">
              <div className="section-title">
                <div>
                  <h2>Etapas obrigatórias</h2>
                  <span>Etapa atual: {selectedCurrentStage}</span>
                </div>
                <div className="orientation-progress-value">
                  <strong>{selected.progresso}%</strong>
                  <span>concluído</span>
                </div>
              </div>
              {selectedStages.length > 0 ? (
                <>
                  <ProgressBar showValue={false} value={selected.progresso} />
                  <div className="orientation-stage-list">
                    {selectedStages.map((stage) => (
                      <StageRow
                        canComplete={stage.id === selectedNextStageId && stage.status === 'em_analise'}
                        key={stage.id}
                        onComplete={completeStage}
                        stage={stage}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Message
                  severity="info"
                  text="As etapas de timeline ainda não existem para esta proposta. Elas serão criadas quando o tema for aprovado para acompanhamento."
                />
              )}
              {canRequestWorkAdjustments(selected) && (
                <Button
                  disabled={isSaving}
                  icon="pi pi-refresh"
                  label="Solicitar ajustes no trabalho"
                  onClick={() => setModalAction('ajustes_trabalho')}
                  outlined
                  severity="warning"
                />
              )}
            </section>

            <section className="orientation-comments-panel">
              <div className="section-title">
                <div>
                  <h2>Acompanhamento</h2>
                  <span>{selected.comentarios.length} registro(s) no histórico</span>
                </div>
                <Button icon="pi pi-plus" label="Novo comentário" onClick={() => setModalAction('comentario')} text />
              </div>
              <div className="orientation-comments-list">
                {selected.comentarios.length > 0 ? (
                  selected.comentarios.map((comment) => (
                    <article key={comment.id}>
                      <div>
                        <strong>{comment.autor}</strong>
                        <Tag severity={comment.tipo === 'Professor' ? 'info' : 'secondary'} value={comment.tipo} />
                        <small>{formatDateBr(comment.data)}</small>
                      </div>
                      <p>{comment.mensagem}</p>
                    </article>
                  ))
                ) : (
                  <div className="orientation-list-empty">
                    <i className="pi pi-comments" aria-hidden="true" />
                    <span>Nenhum comentário registrado para esta orientação.</span>
                  </div>
                )}
              </div>
            </section>
          </main>
        ) : (
          <main className="orientation-empty">
            <i className="pi pi-inbox" aria-hidden="true" />
            <strong>Nenhuma orientação encontrada</strong>
          </main>
        )}
      </section>

      <Dialog
        header={
          modalAction === 'comentario'
            ? 'Registrar comentário'
            : modalAction === 'recusa'
              ? 'Recusar orientação'
              : modalAction === 'cancelamento'
                ? 'Cancelar orientação'
              : modalAction === 'ajustes_trabalho'
                ? 'Solicitar ajustes no trabalho'
                : 'Solicitar ajustes no tema'
        }
        onHide={() => setModalAction(null)}
        style={{ width: 'min(36rem, calc(100vw - 2rem))' }}
        visible={Boolean(modalAction)}
      >
        <div className="orientation-dialog">
          <InputTextarea
            autoFocus
            onChange={(event) => setModalText(event.target.value)}
            rows={6}
            value={modalText}
          />
          <div className="orientation-dialog-actions">
            <Button disabled={isSaving} label="Cancelar" onClick={() => setModalAction(null)} outlined />
            <Button
              disabled={!modalText.trim() || isSaving}
              icon="pi pi-send"
              label="Registrar"
              loading={isSaving}
              onClick={submitModalAction}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Nota da banca"
        onHide={() => setCompletingStage({ stageId: null, nota: undefined })}
        style={{ width: 'min(24rem, calc(100vw - 2rem))' }}
        visible={completingStage.stageId !== null}
        footer={
          <div className="orientation-dialog-actions">
            <Button
              label="Cancelar"
              onClick={() => setCompletingStage({ stageId: null, nota: undefined })}
              text
            />
            <Button
              label="Confirmar"
              onClick={submitBancaNota}
              disabled={completingStage.nota === undefined}
              loading={isSaving}
            />
          </div>
        }
      >
        <div className="form-group">
          <label>
            Nota da banca <span className="required">*</span>
          </label>
          <InputNumber
            value={completingStage.nota}
            onValueChange={(e) => setCompletingStage({ ...completingStage, nota: e.value ?? undefined })}
            min={0}
            max={10}
            step={0.5}
            placeholder="0 a 10"
            mode="decimal"
            minFractionDigits={1}
            maxFractionDigits={2}
          />
        </div>
      </Dialog>

      <Dialog
        header="Definir prazos das etapas"
        onHide={() => setApprovingWithDeadlines(null)}
        style={{ width: 'min(32rem, calc(100vw - 2rem))' }}
        visible={approvingWithDeadlines !== null}
        footer={
          <div className="orientation-dialog-actions">
            <Button
              label="Cancelar"
              onClick={() => setApprovingWithDeadlines(null)}
              text
            />
            <Button
              label="Aprovar com prazos"
              onClick={submitDeadlines}
              disabled={!deadlines['Tema aprovado']}
              loading={isSaving}
              severity="success"
            />
          </div>
        }
      >
        {!deadlines['Tema aprovado'] && (
          <Message severity="warn" text="O prazo da próxima etapa (Tema aprovado) é obrigatório" />
        )}
        <div className="orientation-deadline-grid">
          {['Tema aprovado', 'Projeto de TCC', 'Entrega parcial', 'Versão final', 'Banca'].map(
            (etapa) => (
              <div key={etapa} className="form-group">
                <label>
                  {etapa}
                  {etapa === 'Tema aprovado' && <span className="required">*</span>}
                </label>
                <Calendar
                  value={deadlines[etapa as keyof ApprovalDeadlines]}
                  onChange={(e) =>
                    setDeadlines({
                      ...deadlines,
                      [etapa]: e.value ?? undefined,
                    })
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              </div>
            ),
          )}
        </div>
      </Dialog>
    </div>
  )
}

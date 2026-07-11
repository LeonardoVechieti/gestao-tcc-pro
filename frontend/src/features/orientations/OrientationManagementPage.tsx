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
  completeOrientationStage,
  getProfessorOrientations,
  performOrientationOperation,
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
  | 'parecer'
  | 'reuniao'
  | 'notificacao'
  | 'cancelamento'
  | null
type InfoDialog = 'aluno' | 'proposta' | 'documentos' | 'historico' | null

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

  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}/${month}/${year}` : date
}

function getSummary(orientations: OrientationItem[]) {
  return {
    solicitacoes: orientations.filter((item) => item.status === 'solicitacao_pendente').length,
    temas: orientations.filter((item) => item.status === 'tema_pendente').length,
    ajustes: orientations.filter((item) => item.status === 'ajustes_solicitados').length,
    acompanhamento: orientations.filter((item) => item.status === 'em_acompanhamento').length,
  }
}

function canApproveTheme(orientation: OrientationItem): boolean {
  return ['solicitacao_pendente', 'tema_pendente', 'ajustes_solicitados'].includes(orientation.status)
}

function canRejectOrientation(orientation: OrientationItem): boolean {
  return ['solicitacao_pendente', 'tema_pendente', 'ajustes_solicitados'].includes(orientation.status)
}

function canRequestThemeAdjustments(orientation: OrientationItem): boolean {
  return ['solicitacao_pendente', 'tema_pendente', 'em_acompanhamento'].includes(orientation.status)
}

function canRequestWorkAdjustments(orientation: OrientationItem): boolean {
  return ['em_acompanhamento', 'ajustes_solicitados'].includes(orientation.status)
}

function canManageActiveOrientation(orientation: OrientationItem): boolean {
  return ['em_acompanhamento', 'ajustes_solicitados'].includes(orientation.status)
}

function canForwardToPanel(orientation: OrientationItem): boolean {
  return orientation.status === 'em_acompanhamento' && orientation.progresso === 100
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
  return (
    <button
      className={isSelected ? 'orientation-card is-selected' : 'orientation-card'}
      onClick={onSelect}
      type="button"
    >
      <span>
        <strong>{orientation.aluno}</strong>
        <small>{orientation.titulo}</small>
      </span>
      <Tag severity={statusSeverity[orientation.status]} value={statusLabel[orientation.status]} />
    </button>
  )
}

function StageRow({
  onComplete,
  stage,
}: {
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
      {stage.status === 'em_analise' && (
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
  const [infoDialog, setInfoDialog] = useState<InfoDialog>(null)
  const [modalText, setModalText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [completingStage, setCompletingStage] = useState<CompletingStageState>({
    stageId: null,
    nota: undefined,
  })
  const [approvingWithDeadlines, setApprovingWithDeadlines] = useState<string | null>(null)
  const [deadlines, setDeadlines] = useState<ApprovalDeadlines>({})

  useEffect(() => {
    let cancelled = false

    getProfessorOrientations().then((result) => {
      if (!cancelled) {
        setOrientations(result)
        setSelectedId(result[0]?.id)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => getSummary(orientations ?? []), [orientations])
  const filteredOrientations = useMemo(() => {
    return (orientations ?? []).filter((orientation) => filter === 'todos' || orientation.status === filter)
  }, [filter, orientations])
  const selected = useMemo(
    () => orientations?.find((orientation) => orientation.id === selectedId) ?? filteredOrientations[0],
    [filteredOrientations, orientations, selectedId],
  )
  const selectedStages = useMemo(() => sortOrientationStages(selected?.etapas ?? []), [selected])
  const selectedCurrentStage =
    selectedStages.find((stage) => stage.status !== 'concluida')?.titulo ?? 'Todas as etapas concluídas'

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

      if (modalAction === 'parecer') {
        return performOrientationOperation(orientation, 'parecer', message)
      }

      if (modalAction === 'reuniao') {
        return performOrientationOperation(orientation, 'agendar_reuniao', message)
      }

      if (modalAction === 'notificacao') {
        return performOrientationOperation(orientation, 'notificar_aluno', message)
      }

      if (modalAction === 'cancelamento') {
        return performOrientationOperation(orientation, 'cancelar_orientacao', message)
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
          <p>Acompanhe solicitações, propostas, ajustes, comentários e etapas dos TCCs orientados.</p>
        </div>
      </section>

      <section className="orientation-summary-grid">
        <article>
          <span>Solicitações</span>
          <strong>{summary.solicitacoes}</strong>
        </article>
        <article>
          <span>Temas pendentes</span>
          <strong>{summary.temas}</strong>
        </article>
        <article>
          <span>Ajustes</span>
          <strong>{summary.ajustes}</strong>
        </article>
        <article>
          <span>Em acompanhamento</span>
          <strong>{summary.acompanhamento}</strong>
        </article>
      </section>

      <section className="orientation-workspace">
        <aside className="orientation-list">
          <div className="section-title">
            <h2>Orientandos</h2>
            <Dropdown
              onChange={(event) => setFilter(event.value as OrientationFilter)}
              options={statusOptions}
              value={filter}
            />
          </div>

          <div className="orientation-list-items">
            {filteredOrientations.map((orientation) => (
              <OrientationCard
                isSelected={orientation.id === selected?.id}
                key={orientation.id}
                onSelect={() => setSelectedId(orientation.id)}
                orientation={orientation}
              />
            ))}
          </div>
        </aside>

        {selected ? (
          <main className="orientation-detail">
            <section className="orientation-hero">
              <div>
                <Tag severity={statusSeverity[selected.status]} value={statusLabel[selected.status]} />
                <h2>{selected.titulo}</h2>
                <p>{selected.resumo}</p>
              </div>
              <div className="orientation-meta">
                <span>{selected.aluno}</span>
                <strong>{selected.area}</strong>
                <small>{selected.linhaPesquisa}</small>
              </div>
            </section>

            <section className="orientation-actions">
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
              {canApproveTheme(selected) && (
                <Button
                  disabled={isSaving}
                  icon="pi pi-verified"
                  label="Aprovar tema"
                  loading={isSaving}
                  onClick={() => selected && openDeadlinesModal(selected.id)}
                  outlined
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
            </section>

            <section className="orientation-secondary-actions">
              <Button icon="pi pi-id-card" label="Ver aluno" onClick={() => setInfoDialog('aluno')} outlined />
              <Button icon="pi pi-file" label="Ver proposta" onClick={() => setInfoDialog('proposta')} outlined />
              {canManageActiveOrientation(selected) && (
                <Button icon="pi pi-pencil" label="Editar parecer" onClick={() => setModalAction('parecer')} outlined />
              )}
              {canManageActiveOrientation(selected) && (
                <Button
                  disabled={isSaving}
                  icon="pi pi-lock"
                  label="Finalizar parecer"
                  onClick={() =>
                    runAction((orientation) =>
                      performOrientationOperation(orientation, 'finalizar_parecer', 'Parecer da orientação finalizado.'),
                    )
                  }
                  outlined
                />
              )}
              <Button icon="pi pi-folder" label="Anexos" onClick={() => setInfoDialog('documentos')} outlined />
              {canManageActiveOrientation(selected) && (
                <Button icon="pi pi-calendar-plus" label="Agendar reunião" onClick={() => setModalAction('reuniao')} outlined />
              )}
              {canForwardToPanel(selected) && (
                <Button
                  disabled={isSaving}
                  icon="pi pi-send"
                  label="Encaminhar banca"
                  onClick={() =>
                    runAction((orientation) =>
                      performOrientationOperation(orientation, 'encaminhar_banca', 'TCC encaminhado para etapa de banca.'),
                    )
                  }
                  outlined
                />
              )}
              <Button icon="pi pi-history" label="Histórico" onClick={() => setInfoDialog('historico')} outlined />
              {canManageActiveOrientation(selected) && (
                <Button icon="pi pi-bell" label="Notificar aluno" onClick={() => setModalAction('notificacao')} outlined />
              )}
              {canManageActiveOrientation(selected) && (
                <Button
                  disabled={isSaving}
                  icon="pi pi-ban"
                  label="Cancelar orientação"
                  onClick={() => setModalAction('cancelamento')}
                  outlined
                  severity="danger"
                />
              )}
            </section>

            <section className="orientation-progress-panel">
              <div className="section-title">
                <div>
                  <h2>Etapas obrigatórias</h2>
                  <span>Etapa atual: {selectedCurrentStage}</span>
                </div>
                <Tag severity="info" value={`${selected.progresso}%`} />
              </div>
              <ProgressBar showValue={false} value={selected.progresso} />
              <div className="orientation-stage-list">
                {selectedStages.map((stage) => (
                  <StageRow key={stage.id} onComplete={completeStage} stage={stage} />
                ))}
              </div>
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
                <h2>Acompanhamento</h2>
                <Button icon="pi pi-plus" label="Novo comentário" onClick={() => setModalAction('comentario')} text />
              </div>
              <div className="orientation-comments-list">
                {selected.comentarios.map((comment) => (
                  <article key={comment.id}>
                    <div>
                      <strong>{comment.autor}</strong>
                      <Tag severity={comment.tipo === 'Professor' ? 'info' : 'secondary'} value={comment.tipo} />
                    </div>
                    <p>{comment.mensagem}</p>
                    <small>{formatDateBr(comment.data)}</small>
                  </article>
                ))}
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
              : modalAction === 'parecer'
                ? 'Editar parecer da orientação'
                : modalAction === 'reuniao'
                  ? 'Agendar reunião'
                  : modalAction === 'notificacao'
                    ? 'Notificar aluno'
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
          <div>
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
        header={
          infoDialog === 'aluno'
            ? 'Detalhes do aluno'
            : infoDialog === 'proposta'
              ? 'Proposta completa'
              : infoDialog === 'documentos'
                ? 'Anexos e documentos'
                : 'Histórico da orientação'
        }
        onHide={() => setInfoDialog(null)}
        style={{ width: 'min(42rem, calc(100vw - 2rem))' }}
        visible={Boolean(infoDialog)}
      >
        {selected && (
          <div className="orientation-info-dialog">
            {infoDialog === 'aluno' && (
              <>
                <strong>{selected.aluno}</strong>
                <span>TCC: {selected.titulo}</span>
                <span>Situação: {statusLabel[selected.status]}</span>
                <span>Etapa atual: {selected.etapaAtual}</span>
              </>
            )}
            {infoDialog === 'proposta' && (
              <>
                <strong>{selected.titulo}</strong>
                <span>Área: {selected.area}</span>
                <span>Linha de pesquisa: {selected.linhaPesquisa}</span>
                <p>{selected.resumo}</p>
              </>
            )}
            {infoDialog === 'documentos' && (
              <>
                <strong>Anexos do TCC</strong>
                <span>O backend ainda não possui entidade de documento. Esta área fica pronta para conectar upload, download, aprovação e solicitação de reenvio quando o módulo de documentos for criado.</span>
              </>
            )}
            {infoDialog === 'historico' && (
              <div className="orientation-comments-list">
                {selected.comentarios.map((comment) => (
                  <article key={comment.id}>
                    <div>
                      <strong>{comment.autor}</strong>
                      <Tag severity={comment.tipo === 'Professor' ? 'info' : 'secondary'} value={comment.tipo} />
                    </div>
                    <p>{comment.mensagem}</p>
                    <small>{formatDateBr(comment.data)}</small>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        header="Nota da Banca"
        onHide={() => setCompletingStage({ stageId: null, nota: undefined })}
        style={{ width: 'min(24rem, calc(100vw - 2rem))' }}
        visible={completingStage.stageId !== null}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
            Nota da Banca <span className="required">*</span>
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
        header="Definir Prazos das Etapas"
        onHide={() => setApprovingWithDeadlines(null)}
        style={{ width: 'min(32rem, calc(100vw - 2rem))' }}
        visible={approvingWithDeadlines !== null}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button
              label="Cancelar"
              onClick={() => setApprovingWithDeadlines(null)}
              text
            />
            <Button
              label="Aprovar com Prazos"
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
        <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
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

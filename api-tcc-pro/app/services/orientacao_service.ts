import Aluno from '#models/DAO/aluno'
import Professor from '#models/DAO/professor'
import Tcc from '#models/DAO/tcc'
import TccNotificacao from '#models/DAO/tcc_notificacao'
import TccOrientacaoComentario from '#models/DAO/tcc_orientacao_comentario'
import TccTimeline from '#models/DAO/tcc_timeline'
import TemaTcc from '#models/DAO/tema_tcc'
import GenericResponseException from '#exceptions/generic_response_exception'
import { Uuid } from '../function/uuidv4.js'

type OrientationStatus =
  | 'solicitacao_pendente'
  | 'tema_pendente'
  | 'ajustes_solicitados'
  | 'em_acompanhamento'
  | 'aprovado'
  | 'recusado'
  | 'banca'
  | 'cancelado'

type OrientationSourceType = 'tcc' | 'tema'

type OrientationActionPayload = {
  sourceType?: OrientationSourceType
  mensagem?: string
  autorNome?: string
  operation?: string
}

type ApproveThemeWithDeadlinesPayload = {
  sourceType?: OrientationSourceType
  autorNome?: string
  prazos: {
    'Tema aprovado'?: string
    'Projeto de TCC'?: string
    'Entrega parcial'?: string
    'Versão final'?: string
    'Banca'?: string
  }
}

const requiredStages = [
  'Tema aprovado',
  'Projeto de TCC',
  'Entrega parcial',
  'Versão final',
  'Banca',
]

const stageOrderByTitle = new Map(requiredStages.map((title, index) => [title, index]))

function normalizeTemaStatus(status?: string): OrientationStatus {
  const key = status
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  if (!key || key.includes('aguardando') || key.includes('pendente')) {
    return 'tema_pendente'
  }

  if (key.includes('orientacao_aprovada')) {
    return 'tema_pendente'
  }

  if (key.includes('ajuste') || key.includes('correcao')) {
    return 'ajustes_solicitados'
  }

  if (key.includes('recus')) {
    return 'recusado'
  }

  if (key.includes('cancel')) {
    return 'cancelado'
  }

  if (key.includes('aprov')) {
    return 'em_acompanhamento'
  }

  return 'tema_pendente'
}

function normalizeTccStatus(status?: string, bancaStageStatus?: string): OrientationStatus {
  const key = status
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  // Status expl\u00edcitos que v\u00eam de a\u00e7\u00f5es do sistema t\u00eam prioridade
  if (key?.includes('recus')) {
    return 'recusado'
  }

  if (key?.includes('cancel')) {
    return 'cancelado'
  }

  if (key?.includes('ajuste')) {
    return 'ajustes_solicitados'
  }

  // Verifica o status espec\u00edfico da etapa de Banca
  if (bancaStageStatus === 'concluida') {
    return 'aprovado'
  }

  if (bancaStageStatus === 'em_analise') {
    return 'banca'
  }

  // Fallback para o status expl\u00edcito
  if (key?.includes('concluido') || key?.includes('aprovado')) {
    return 'aprovado'
  }

  if (key?.includes('banca')) {
    return 'banca'
  }

  return 'em_acompanhamento'
}

function calculateProgress(stages: any[]): number {
  if (stages.length === 0) {
    return 0
  }

  const completed = stages.filter((stage) => stage.status === 'concluida').length
  return Math.round((completed / stages.length) * 100)
}

function toDateString(value: any): string {
  if (!value) {
    return 'A definir'
  }

  if (typeof value.toISODate === 'function') {
    return value.toISODate()
  }

  return String(value)
}

function normalizeStageTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getStageOrder(title: string): number {
  const exactOrder = stageOrderByTitle.get(title)
  if (exactOrder !== undefined) {
    return exactOrder
  }

  const normalizedTitle = normalizeStageTitle(title)
  const fuzzyOrder = requiredStages.findIndex((stageTitle) =>
    normalizedTitle.includes(normalizeStageTitle(stageTitle))
  )

  return fuzzyOrder >= 0 ? fuzzyOrder : requiredStages.length
}

export default class OrientacaoService {
  async listByProfessor(uuidProfessor: string) {
    const [professor, alunos, temas, tccs] = await Promise.all([
      Professor.findOrFail(uuidProfessor),
      Aluno.all(),
      TemaTcc.query().where('uuid_professor', uuidProfessor),
      Tcc.query().where('uuid_orientador', uuidProfessor),
    ])

    const alunoPorId = new Map(alunos.map((aluno) => [aluno.uuidAluno, aluno.nome]))
    const temaIds = new Set(temas.map((tema) => tema.uuidTemaTcc))

    for (const tcc of tccs) {
      temaIds.add(tcc.uuidTemaTcc)
    }

    const temasDoProfessor = await TemaTcc.query().whereIn('uuid_tema_tcc', [...temaIds])
    const temaPorId = new Map(temasDoProfessor.map((tema) => [tema.uuidTemaTcc, tema]))
    const tccTemaIds = new Set(tccs.map((tcc) => tcc.uuidTemaTcc))

    const propostas = temas
      .filter((tema) => !tccTemaIds.has(tema.uuidTemaTcc))
      .map(async (tema) => this.buildTemaOrientation(tema, alunoPorId.get(tema.uuidAluno)))

    const orientacoes = tccs.map(async (tcc) =>
      this.buildTccOrientation(tcc, temaPorId.get(tcc.uuidTemaTcc), alunoPorId.get(tcc.uuidAluno))
    )

    return {
      professor: {
        uuidProfessor: professor.uuidProfessor,
        nome: professor.nome,
      },
      orientacoes: await Promise.all([...propostas, ...orientacoes]),
    }
  }

  async approveOrientation(id: string, payload: OrientationActionPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)

    if (tcc) {
      tcc.status = 'em_andamento'
      await tcc.save()
      await this.createSystemComment({ tcc, tema, mensagem: 'Solicitação de orientação aprovada.' })
      return this.buildTccOrientation(tcc, tema)
    }

    tema.status = 'orientacao_aprovada'
    await tema.save()
    await this.createSystemComment({ tema, mensagem: 'Solicitação de orientação aprovada.' })
    return this.buildTemaOrientation(tema)
  }

  async rejectOrientation(id: string, payload: OrientationActionPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)
    const mensagem = payload.mensagem?.trim() || 'Solicitação de orientação recusada.'

    if (tcc) {
      tcc.status = 'recusado'
      await tcc.save()
    }

    tema.status = 'recusado'
    await tema.save()
    await this.createSystemComment({ tcc, tema, mensagem, tipo: 'recusa' })
    return tcc ? this.buildTccOrientation(tcc, tema) : this.buildTemaOrientation(tema)
  }

  async approveTheme(id: string, payload: OrientationActionPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)

    if (tcc || ['aprovado', 'em_andamento', 'banca', 'concluido'].includes(tema.status)) {
      throw new GenericResponseException('Tema já aprovado para acompanhamento', 409)
    }

    tema.status = 'aprovado'
    await tema.save()

    const currentTcc = tcc ?? (await this.findOrCreateTccFromTema(tema))
    currentTcc.status = 'em_andamento'
    await currentTcc.save()
    await this.ensureRequiredStages(currentTcc.uuidTcc)
    await this.createSystemComment({
      tcc: currentTcc,
      tema,
      mensagem: 'Tema aprovado para acompanhamento.',
      tipo: 'aprovacao',
    })

    return this.buildTccOrientation(currentTcc, tema)
  }

  async approveThemeWithDeadlines(
    id: string,
    payload: ApproveThemeWithDeadlinesPayload,
  ) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)

    if (tcc || ['aprovado', 'em_andamento', 'banca', 'concluido'].includes(tema.status)) {
      throw new GenericResponseException('Tema já aprovado para acompanhamento', 409)
    }

    // Validar que próxima etapa tem prazo (obrigatório)
    const proximaEtapa = 'Tema aprovado'
    if (!payload.prazos[proximaEtapa]) {
      throw new GenericResponseException('Prazo da próxima etapa é obrigatório', 400)
    }

    tema.status = 'aprovado'
    await tema.save()

    const currentTcc = tcc ?? (await this.findOrCreateTccFromTema(tema))
    currentTcc.status = 'em_andamento'
    await currentTcc.save()
    await this.ensureRequiredStages(currentTcc.uuidTcc)

    // Atualizar prazos das etapas
    const stages = await TccTimeline.query().where('uuid_tcc', currentTcc.uuidTcc)
    for (const stage of stages) {
      const prazo = payload.prazos[stage.titulo as keyof typeof payload.prazos]
      if (prazo) {
        stage.dataEntrega = prazo as any
        await stage.save()
      }
    }

    await this.createSystemComment({
      tcc: currentTcc,
      tema,
      mensagem: 'Tema aprovado para acompanhamento com prazos definidos.',
      tipo: 'aprovacao',
    })

    return this.buildTccOrientation(currentTcc, tema)
  }

  async requestAdjustments(
    id: string,
    payload: OrientationActionPayload & { adjustmentType?: string }
  ) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)
    const mensagem = payload.mensagem?.trim() || 'Ajustes solicitados pelo professor.'
    const tipo = payload.adjustmentType === 'trabalho' ? 'ajuste_trabalho' : 'ajuste_tema'

    if (tcc) {
      tcc.status = 'ajustes_solicitados'
      await tcc.save()
    }

    tema.status = 'ajustes_solicitados'
    await tema.save()
    await this.createSystemComment({ tcc, tema, mensagem, tipo, autorNome: payload.autorNome })
    return tcc ? this.buildTccOrientation(tcc, tema) : this.buildTemaOrientation(tema)
  }

  async addComment(id: string, payload: OrientationActionPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)
    const mensagem = payload.mensagem?.trim()

    if (!mensagem) {
      throw new GenericResponseException('Mensagem é obrigatória', 400)
    }

    await this.createSystemComment({
      tcc,
      tema,
      mensagem,
      tipo: 'comentario',
      autorNome: payload.autorNome,
    })

    return tcc ? this.buildTccOrientation(tcc, tema) : this.buildTemaOrientation(tema)
  }

  async completeStage(uuidTimeline: string, nota?: number) {
    const timeline = await TccTimeline.findOrFail(uuidTimeline)
    const isBanca = timeline.titulo === 'Banca'
    const tcc = await Tcc.findOrFail(timeline.uuidTcc)
    const tema = await TemaTcc.findOrFail(tcc.uuidTemaTcc)
    // Ordena pela sequência canônica das etapas: created_at pode empatar
    // porque as etapas são criadas em paralelo
    const stages = (await TccTimeline.query().where('uuid_tcc', tcc.uuidTcc)).sort(
      (current, next) => getStageOrder(current.titulo) - getStageOrder(next.titulo)
    )
    const nextStage = stages.find((stage) => stage.status !== 'concluida')

    // Validar que apenas a próxima etapa (em_analise) pode ser concluída
    if (timeline.status !== 'em_analise' || nextStage?.uuidTimeline !== timeline.uuidTimeline) {
      throw new GenericResponseException(
        nextStage
          ? `A próxima etapa a concluir é "${nextStage.titulo}".`
          : 'Todas as etapas já foram concluídas.',
        400,
      )
    }

    // Exigir nota se estiver marcando Banca como concluída
    if (isBanca && nota === undefined) {
      throw new GenericResponseException(
        'Nota é obrigatória ao concluir a Banca',
        400,
      )
    }

    // Validar nota (0-10)
    if (nota !== undefined && (nota < 0 || nota > 10)) {
      throw new GenericResponseException(
        'Nota deve estar entre 0 e 10',
        400,
      )
    }

    timeline.status = 'concluida'
    await timeline.save()

    // Ativar próxima etapa (marcar como em_analise)
    const currentStageIndex = stages.findIndex((s) => s.uuidTimeline === uuidTimeline)
    if (currentStageIndex !== -1 && currentStageIndex < stages.length - 1) {
      const nextStage = stages[currentStageIndex + 1]
      nextStage.status = 'em_analise'
      await nextStage.save()
    }

    // Se todas as etapas estão concluídas, marcar TCC como aprovado
    if (stages.every((stage) => stage.status === 'concluida')) {
      tcc.status = 'aprovado'
      await tcc.save()
    }

    // Se for Banca e tiver nota, criar ou atualizar avaliação
    if (isBanca && nota !== undefined) {
      const Avaliacao = (await import('#models/DAO/avaliacao')).default
      const AvaliacaoRepository = (await import('#repositories/avaliacao_repository')).default
      const avaliacaoRepo = new AvaliacaoRepository()

      let avaliacao = await avaliacaoRepo.findByTccAndProfessor(tcc.uuidTcc)
      if (avaliacao) {
        avaliacao.nota = nota
        avaliacao.publicado = true
        await avaliacaoRepo.update(avaliacao)
      } else {
        await avaliacaoRepo.store(
          Object.assign(new Avaliacao(), {
            uuidAvaliacao: Uuid.generate(),
            uuidTcc: tcc.uuidTcc,
            nota,
            publicado: true,
          }),
        )
      }
    }

    await this.createSystemComment({
      tcc,
      tema,
      mensagem: `Etapa "${timeline.titulo}" marcada como concluída${isBanca ? ` com nota ${nota}` : ''}.`,
      tipo: 'etapa_concluida',
    })

    return this.buildTccOrientation(tcc, tema)
  }

  async updateStageDeadlines(
    uuidTcc: string,
    prazos: Record<string, string>,
  ) {
    const stages = await TccTimeline.query().where('uuid_tcc', uuidTcc)

    if (stages.length === 0) {
      throw new GenericResponseException('Etapas não encontradas', 404)
    }

    // Validar que próxima etapa (em_analise) tem prazo
    const nextStage = stages.find((s) => s.status === 'em_analise')
    if (nextStage && !prazos[nextStage.titulo]) {
      throw new GenericResponseException(
        `Prazo da próxima etapa (${nextStage.titulo}) é obrigatório`,
        400,
      )
    }

    // Atualizar prazos
    for (const stage of stages) {
      const prazo = prazos[stage.titulo]
      if (prazo) {
        stage.dataEntrega = prazo as any
        await stage.save()
      }
    }

    const tcc = await Tcc.findOrFail(uuidTcc)
    const tema = await TemaTcc.findOrFail(tcc.uuidTemaTcc)

    return this.buildTccOrientation(tcc, tema)
  }

  async performOperation(id: string, payload: OrientationActionPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)
    const operation = payload.operation ?? 'comentario'
    const mensagem = payload.mensagem?.trim() || this.defaultOperationMessage(operation)

    if (operation === 'encaminhar_banca' && tcc) {
      tcc.status = 'banca'
      await tcc.save()
    }

    if (operation === 'cancelar_orientacao') {
      if (tcc) {
        tcc.status = 'orientacao_cancelada'
        await tcc.save()
      }
      tema.status = 'orientacao_cancelada'
      await tema.save()
    }

    await this.createSystemComment({
      tcc,
      tema,
      mensagem,
      tipo: operation,
      autorNome: payload.autorNome,
    })

    return tcc ? this.buildTccOrientation(tcc, tema) : this.buildTemaOrientation(tema)
  }

  private async resolveOrientation(id: string, sourceType?: OrientationSourceType) {
    if (sourceType !== 'tema') {
      const tcc = await Tcc.find(id)
      if (tcc) {
        return { tcc, tema: await TemaTcc.findOrFail(tcc.uuidTemaTcc) }
      }
    }

    const tema = await TemaTcc.findOrFail(id)
    const tcc = await Tcc.query().where('uuid_tema_tcc', tema.uuidTemaTcc).first()
    return { tcc, tema }
  }

  private async findOrCreateTccFromTema(tema: TemaTcc): Promise<Tcc> {
    const existing = await Tcc.query().where('uuid_tema_tcc', tema.uuidTemaTcc).first()
    if (existing) {
      return existing
    }

    return Tcc.create({
      uuidTcc: Uuid.generate(),
      uuidAluno: tema.uuidAluno,
      uuidOrientador: tema.uuidProfessor,
      uuidTemaTcc: tema.uuidTemaTcc,
      status: 'em_andamento',
    })
  }

  private async ensureRequiredStages(uuidTcc: string) {
    const existing = await TccTimeline.query().where('uuid_tcc', uuidTcc)
    const existingTitles = new Set(existing.map((stage) => stage.titulo))

    await Promise.all(
      requiredStages
        .filter((titulo) => !existingTitles.has(titulo))
        .map((titulo, index) =>
          TccTimeline.create({
            uuidTimeline: Uuid.generate(),
            uuidTcc,
            titulo,
            descricao: `Etapa obrigatória ${index + 1} do processo de orientação.`,
            status: index === 0 ? 'em_analise' : 'pendente',
          })
        )
    )
  }

  private async buildTemaOrientation(tema: TemaTcc, alunoNome?: string) {
    const comments = await this.findComments(undefined, tema.uuidTemaTcc)
    const status = normalizeTemaStatus(tema.status)
    const stages = this.buildVirtualStages(status)

    return {
      id: tema.uuidTemaTcc,
      sourceType: 'tema',
      uuidTemaTcc: tema.uuidTemaTcc,
      uuidTcc: null,
      aluno: alunoNome ?? 'Aluno não encontrado',
      titulo: tema.titulo,
      area: tema.area ?? 'Área não informada',
      linhaPesquisa: tema.linhaPesquisa ?? 'Linha não informada',
      status,
      prioridade: status === 'ajustes_solicitados' ? 'alta' : 'media',
      atualizadoEm: toDateString(tema.updatedAt),
      resumo: tema.descricao ?? 'Proposta de tema aguardando análise.',
      etapaAtual:
        stages.find((stage) => stage.status !== 'concluida')?.titulo ??
        'Todas as etapas concluídas',
      progresso: calculateProgress(stages),
      etapas: stages,
      comentarios: comments,
    }
  }

  private async buildTccOrientation(tcc: Tcc, tema?: TemaTcc | null, alunoNome?: string) {
    await this.ensureRequiredStages(tcc.uuidTcc)

    const [stages, comments] = await Promise.all([
      TccTimeline.query().where('uuid_tcc', tcc.uuidTcc).orderBy('created_at', 'asc'),
      this.findComments(tcc.uuidTcc, tcc.uuidTemaTcc),
    ])
    const mappedStages = stages
      .map((stage) => ({
        id: stage.uuidTimeline,
        titulo: stage.titulo,
        status: this.normalizeStageStatus(stage.status),
        prazo: toDateString(stage.dataEntrega),
      }))
      .sort((current, next) => getStageOrder(current.titulo) - getStageOrder(next.titulo))

    const bancaStage = mappedStages.find((s) => s.titulo === 'Banca')
    const status = normalizeTccStatus(tcc.status, bancaStage?.status)

    return {
      id: tcc.uuidTcc,
      sourceType: 'tcc',
      uuidTemaTcc: tcc.uuidTemaTcc,
      uuidTcc: tcc.uuidTcc,
      aluno: alunoNome ?? 'Aluno não encontrado',
      titulo: tema?.titulo ?? 'Tema não encontrado',
      area: tema?.area ?? 'Área não informada',
      linhaPesquisa: tema?.linhaPesquisa ?? 'Linha não informada',
      status,
      prioridade: status === 'ajustes_solicitados' ? 'alta' : 'normal',
      atualizadoEm: toDateString(tcc.updatedAt),
      resumo: tema?.descricao ?? 'TCC vinculado ao professor orientador.',
      etapaAtual:
        mappedStages.find((stage) => stage.status !== 'concluida')?.titulo ??
        'Todas as etapas concluídas',
      progresso: calculateProgress(mappedStages),
      etapas: mappedStages,
      comentarios: comments,
    }
  }

  private buildVirtualStages(status: OrientationStatus) {
    return requiredStages.map((titulo, index) => ({
      id: `virtual-${index}`,
      titulo,
      status: status === 'aprovado' ? 'concluida' : index === 0 ? 'em_analise' : 'pendente',
      prazo: 'A definir',
    }))
  }

  private normalizeStageStatus(status: string) {
    if (status === 'concluido') {
      return 'concluida'
    }

    if (status === 'em_andamento') {
      return 'em_analise'
    }

    return status === 'concluida' || status === 'em_analise' ? status : 'pendente'
  }

  private defaultOperationMessage(operation: string): string {
    const messages: Record<string, string> = {
      parecer: 'Parecer da orientação registrado.',
      finalizar_parecer: 'Parecer da orientação finalizado.',
      agendar_reuniao: 'Reunião de acompanhamento solicitada.',
      notificar_aluno: 'Aluno notificado sobre a orientação.',
      encaminhar_banca: 'TCC encaminhado para etapa de banca.',
      cancelar_orientacao: 'Orientação cancelada.',
    }

    return messages[operation] ?? 'Operação registrada na orientação.'
  }

  private async findComments(uuidTcc?: string, uuidTemaTcc?: string) {
    const query = TccOrientacaoComentario.query().orderBy('created_at', 'desc')

    if (uuidTcc && uuidTemaTcc) {
      query.where((builder) => {
        builder.where('uuid_tcc', uuidTcc).orWhere('uuid_tema_tcc', uuidTemaTcc)
      })
    } else if (uuidTcc) {
      query.where('uuid_tcc', uuidTcc)
    } else if (uuidTemaTcc) {
      query.where('uuid_tema_tcc', uuidTemaTcc)
    }

    const comments = await query
    return comments.map((comment) => ({
      id: comment.uuidOrientacaoComentario,
      autor: comment.autorNome,
      tipo: comment.autorTipo,
      mensagem: comment.mensagem,
      data: toDateString(comment.createdAt),
    }))
  }

  private async createSystemComment({
    tcc,
    tema,
    mensagem,
    tipo = 'comentario',
    autorNome = 'Sistema',
  }: {
    tcc?: Tcc | null
    tema?: TemaTcc | null
    mensagem: string
    tipo?: string
    autorNome?: string
  }) {
    const comentario = await TccOrientacaoComentario.create({
      uuidOrientacaoComentario: Uuid.generate(),
      uuidTcc: tcc?.uuidTcc,
      uuidTemaTcc: tema?.uuidTemaTcc,
      autorNome,
      autorTipo: autorNome === 'Sistema' ? 'Sistema' : 'Professor',
      tipo,
      mensagem,
    })

    if (tcc) {
      await TccNotificacao.create({
        uuidTccNotificacao: Uuid.generate(),
        uuidTcc: tcc.uuidTcc,
        tipo,
        descricao: mensagem,
        status: 'pendente',
        linkAcao: '/orientacoes',
      })
    }

    return comentario
  }
}

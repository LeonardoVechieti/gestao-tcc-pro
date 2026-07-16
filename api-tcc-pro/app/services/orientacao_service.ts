import Aluno from '#models/DAO/aluno'
import Professor from '#models/DAO/professor'
import Tcc from '#models/DAO/tcc'
import TccNotificacao from '#models/DAO/tcc_notificacao'
import TccOrientacaoComentario from '#models/DAO/tcc_orientacao_comentario'
import TccTimeline from '#models/DAO/tcc_timeline'
import TemaTcc from '#models/DAO/tema_tcc'
import Usuario from '#models/DAO/usuario'
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

type StudentThemeUpdatePayload = {
  titulo?: string
  descricao?: string
  area?: string
  linhaPesquisa?: string
}

type StudentResponsePayload = OrientationActionPayload & {
  tema?: StudentThemeUpdatePayload
}

type ApproveThemeWithDeadlinesPayload = {
  sourceType?: OrientationSourceType
  autorNome?: string
  prazos?: {
    'Tema aprovado'?: string
    'Projeto de TCC'?: string
    'Entrega parcial'?: string
    'Versão final'?: string
    'Banca'?: string
  }
}

type OrientationStagePayload = {
  id: string
  titulo: string
  status: 'pendente' | 'em_analise' | 'concluida'
  prazo: string
}

type OrientationProfessorPayload = {
  uuidProfessor: string
  nome: string
  email: string
} | null

type NotificationRecipient = 'aluno' | 'professor'

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

  if (!key) {
    return 'solicitacao_pendente'
  }

  if (key.includes('orientacao_aprovada') || key.includes('tema_pendente')) {
    return 'tema_pendente'
  }

  if (key.includes('aguardando') || key.includes('pendente')) {
    return 'solicitacao_pendente'
  }

  if (key.includes('solicitacao')) {
    return 'solicitacao_pendente'
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
      .map(async (tema) =>
        this.buildTemaOrientation(tema, alunoPorId.get(tema.uuidAluno), professor)
      )

    const orientacoes = tccs.map(async (tcc) =>
      this.buildTccOrientation(
        tcc,
        temaPorId.get(tcc.uuidTemaTcc),
        alunoPorId.get(tcc.uuidAluno),
        professor
      )
    )

    return {
      professor: {
        uuidProfessor: professor.uuidProfessor,
        nome: professor.nome,
      },
      orientacoes: await Promise.all([...propostas, ...orientacoes]),
    }
  }

  async listByAluno(uuidAluno: string) {
    const [aluno, temas, tccs] = await Promise.all([
      Aluno.findOrFail(uuidAluno),
      TemaTcc.query().where('uuid_aluno', uuidAluno),
      Tcc.query().where('uuid_aluno', uuidAluno),
    ])

    const temaIds = new Set(temas.map((tema) => tema.uuidTemaTcc))
    const professorIds = new Set<string>()

    for (const tema of temas) {
      if (tema.uuidProfessor) {
        professorIds.add(tema.uuidProfessor)
      }
    }

    for (const tcc of tccs) {
      temaIds.add(tcc.uuidTemaTcc)

      if (tcc.uuidOrientador) {
        professorIds.add(tcc.uuidOrientador)
      }
    }

    const [temasDoAluno, professores] = await Promise.all([
      temaIds.size > 0 ? TemaTcc.query().whereIn('uuid_tema_tcc', [...temaIds]) : [],
      professorIds.size > 0 ? Professor.query().whereIn('uuid_professor', [...professorIds]) : [],
    ])

    const temaPorId = new Map(temasDoAluno.map((tema) => [tema.uuidTemaTcc, tema]))
    const professorPorId = new Map(
      professores.map((professor) => [professor.uuidProfessor, professor])
    )
    const tccTemaIds = new Set(tccs.map((tcc) => tcc.uuidTemaTcc))

    const propostas = temas
      .filter((tema) => !tccTemaIds.has(tema.uuidTemaTcc))
      .map(async (tema) =>
        this.buildTemaOrientation(
          tema,
          aluno.nome,
          tema.uuidProfessor ? professorPorId.get(tema.uuidProfessor) : undefined
        )
      )

    const orientacoes = tccs.map(async (tcc) => {
      const tema = temaPorId.get(tcc.uuidTemaTcc)
      const professorId = tcc.uuidOrientador ?? tema?.uuidProfessor

      return this.buildTccOrientation(
        tcc,
        tema,
        aluno.nome,
        professorId ? professorPorId.get(professorId) : undefined
      )
    })

    return {
      aluno: {
        uuidAluno: aluno.uuidAluno,
        nome: aluno.nome,
      },
      orientacoes: await Promise.all([...propostas, ...orientacoes]),
    }
  }

  async approveOrientation(id: string, payload: OrientationActionPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)

    if (tcc) {
      tcc.status = 'em_andamento'
      await tcc.save()
      await this.createSystemComment({
        tcc,
        tema,
        mensagem: 'Solicitação de orientação aprovada.',
        tipo: 'orientacao_aprovada',
      })
      return this.buildTccOrientation(tcc, tema)
    }

    tema.status = 'orientacao_aprovada'
    await tema.save()
    await this.createSystemComment({
      tema,
      mensagem: 'Solicitação de orientação aprovada.',
      tipo: 'orientacao_aprovada',
    })
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
    await this.syncNextDelivery(currentTcc)
    await this.createSystemComment({
      tcc: currentTcc,
      tema,
      mensagem: 'Tema aprovado para acompanhamento.',
      tipo: 'aprovacao',
    })

    return this.buildTccOrientation(currentTcc, tema)
  }

  async approveThemeWithDeadlines(id: string, payload: ApproveThemeWithDeadlinesPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)
    const prazos = payload.prazos ?? {}

    if (tcc || ['aprovado', 'em_andamento', 'banca', 'concluido'].includes(tema.status)) {
      throw new GenericResponseException('Tema já aprovado para acompanhamento', 409)
    }

    // Validar que próxima etapa tem prazo (obrigatório)
    const proximaEtapa = 'Tema aprovado'
    if (!prazos[proximaEtapa]) {
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
      const prazo = prazos[stage.titulo as keyof typeof prazos]
      if (prazo) {
        stage.dataEntrega = prazo as any
        await stage.save()
      }
    }
    await this.syncNextDelivery(currentTcc, stages)

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

  async addStudentComment(id: string, payload: StudentResponsePayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)
    const mensagem = payload.mensagem?.trim()

    if (!mensagem) {
      throw new GenericResponseException('Mensagem é obrigatória', 400)
    }

    const hasThemeUpdates = this.hasThemeUpdates(payload.tema)

    if (hasThemeUpdates) {
      const latestAdjustment = await this.findLatestAdjustment(tcc, tema)
      const isThemeAdjustment =
        latestAdjustment?.tipo === 'ajuste_tema' ||
        (!latestAdjustment && !tcc && normalizeTemaStatus(tema.status) === 'ajustes_solicitados')

      if (!isThemeAdjustment) {
        throw new GenericResponseException(
          'A proposta só pode ser editada quando o ajuste solicitado for no tema',
          400
        )
      }

      this.mergeThemeUpdates(tema, payload.tema)
    }

    if (tcc) {
      tcc.status =
        normalizeTccStatus(tcc.status) === 'ajustes_solicitados' ? 'em_andamento' : tcc.status
      await tcc.save()
      tema.status = hasThemeUpdates ? 'aprovado' : tema.status
      await tema.save()
    } else {
      tema.status =
        normalizeTemaStatus(tema.status) === 'ajustes_solicitados' ? 'tema_pendente' : tema.status
      await tema.save()
    }

    await this.createSystemComment({
      tcc,
      tema,
      mensagem,
      tipo: 'resposta_aluno',
      autorNome: payload.autorNome ?? 'Aluno',
      autorTipo: 'Aluno',
    })

    const professor = await this.findOrientationProfessor(tcc, tema)
    return tcc
      ? this.buildTccOrientation(tcc, tema, undefined, professor)
      : this.buildTemaOrientation(tema, undefined, professor)
  }

  async completeStage(uuidTimeline: string, nota?: number) {
    const timeline = await TccTimeline.findOrFail(uuidTimeline)
    const isBanca = timeline.titulo === 'Banca'
    const tcc = await Tcc.findOrFail(timeline.uuidTcc)
    const tema = await TemaTcc.findOrFail(tcc.uuidTemaTcc)
    // Ordena pela sequência canônica das etapas: created_at pode empatar
    // porque as etapas são criadas em paralelo
    const queriedStages = await TccTimeline.query().where('uuid_tcc', tcc.uuidTcc)
    const stages = queriedStages.sort(
      (current, next) => getStageOrder(current.titulo) - getStageOrder(next.titulo)
    )
    const nextStage = stages.find((stage) => stage.status !== 'concluida')

    // Validar que apenas a próxima etapa (em_analise) pode ser concluída
    if (timeline.status !== 'em_analise' || nextStage?.uuidTimeline !== timeline.uuidTimeline) {
      throw new GenericResponseException(
        nextStage
          ? `A próxima etapa a concluir é "${nextStage.titulo}".`
          : 'Todas as etapas já foram concluídas.',
        400
      )
    }

    // Exigir nota se estiver marcando Banca como concluída
    if (isBanca && nota === undefined) {
      throw new GenericResponseException('Nota é obrigatória ao concluir a Banca', 400)
    }

    // Validar nota (0-10)
    if (nota !== undefined && (nota < 0 || nota > 10)) {
      throw new GenericResponseException('Nota deve estar entre 0 e 10', 400)
    }

    timeline.status = 'concluida'
    await timeline.save()

    // Ativar próxima etapa (marcar como em_analise)
    const currentStageIndex = stages.findIndex((s) => s.uuidTimeline === uuidTimeline)
    if (currentStageIndex !== -1) {
      stages[currentStageIndex].status = 'concluida'
    }

    if (currentStageIndex !== -1 && currentStageIndex < stages.length - 1) {
      const followingStage = stages[currentStageIndex + 1]
      followingStage.status = 'em_analise'
      await followingStage.save()
    }

    // Se todas as etapas estão concluídas, marcar TCC como aprovado
    if (stages.every((stage) => stage.status === 'concluida')) {
      tcc.status = 'aprovado'
      await tcc.save()
    }
    await this.syncNextDelivery(tcc, stages)

    // Se for Banca e tiver nota, criar ou atualizar avaliação
    if (isBanca && nota !== undefined) {
      if (!tcc.uuidOrientador) {
        throw new GenericResponseException('TCC sem professor orientador vinculado', 400)
      }

      const avaliacaoModule = await import('#models/DAO/avaliacao')
      const avaliacaoRepositoryModule = await import('#repositories/avaliacao_repository')
      const Avaliacao = avaliacaoModule.default
      const AvaliacaoRepository = avaliacaoRepositoryModule.default
      const avaliacaoRepo = new AvaliacaoRepository()

      let avaliacao = await avaliacaoRepo.findByTccAndProfessor(tcc.uuidTcc, tcc.uuidOrientador)
      if (avaliacao) {
        avaliacao.nota = nota
        avaliacao.publicado = true
        await avaliacaoRepo.update(avaliacao)
      } else {
        await avaliacaoRepo.store(
          Object.assign(new Avaliacao(), {
            uuidAvaliacao: Uuid.generate(),
            uuidTcc: tcc.uuidTcc,
            uuidProfessor: tcc.uuidOrientador,
            nota,
            publicado: true,
          })
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

  async updateStageDeadlines(uuidTcc: string, prazos: Record<string, string>) {
    const stages = await TccTimeline.query().where('uuid_tcc', uuidTcc)

    if (stages.length === 0) {
      throw new GenericResponseException('Etapas não encontradas', 404)
    }

    // Validar que próxima etapa (em_analise) tem prazo
    const nextStage = stages.find((s) => s.status === 'em_analise')
    if (nextStage && !prazos[nextStage.titulo]) {
      throw new GenericResponseException(
        `Prazo da próxima etapa (${nextStage.titulo}) é obrigatório`,
        400
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
    await this.syncNextDelivery(tcc, stages)

    return this.buildTccOrientation(tcc, tema)
  }

  async performOperation(id: string, payload: OrientationActionPayload) {
    const { tcc, tema } = await this.resolveOrientation(id, payload.sourceType)
    const operation = payload.operation ?? 'comentario'
    const mensagem = payload.mensagem?.trim() || this.defaultOperationMessage(operation)

    if (operation !== 'cancelar_orientacao') {
      throw new GenericResponseException(
        'Operação não suportada pela modelagem atual de orientação',
        400
      )
    }

    if (tcc) {
      tcc.status = 'orientacao_cancelada'
      await tcc.save()
    }
    tema.status = 'orientacao_cancelada'
    await tema.save()

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

  private hasThemeUpdates(tema?: StudentThemeUpdatePayload): boolean {
    if (!tema) {
      return false
    }

    return ['titulo', 'descricao', 'area', 'linhaPesquisa'].some((field) => {
      const value = tema[field as keyof StudentThemeUpdatePayload]
      return typeof value === 'string' && value.trim().length > 0
    })
  }

  private mergeThemeUpdates(tema: TemaTcc, updates?: StudentThemeUpdatePayload) {
    if (!updates) {
      return
    }

    if (updates.titulo?.trim()) {
      tema.titulo = updates.titulo.trim()
    }

    if (updates.descricao?.trim()) {
      tema.descricao = updates.descricao.trim()
    }

    if (updates.area?.trim()) {
      tema.area = updates.area.trim()
    }

    if (updates.linhaPesquisa?.trim()) {
      tema.linhaPesquisa = updates.linhaPesquisa.trim()
    }
  }

  private async findOrientationProfessor(tcc?: Tcc | null, tema?: TemaTcc | null) {
    const professorId = tcc?.uuidOrientador ?? tema?.uuidProfessor

    if (!professorId) {
      return null
    }

    return Professor.find(professorId)
  }

  private getTimelineDeliveryDate(stage?: TccTimeline | null): string | null {
    if (!stage?.dataEntrega) {
      return null
    }

    if (typeof stage.dataEntrega.toISODate === 'function') {
      return stage.dataEntrega.toISODate()
    }

    return String(stage.dataEntrega)
  }

  private async syncNextDelivery(tcc: Tcc, stages?: TccTimeline[]) {
    const timeline =
      stages ??
      (await TccTimeline.query().where('uuid_tcc', tcc.uuidTcc).orderBy('created_at', 'asc'))
    const sortedTimeline = timeline.sort(
      (current, next) => getStageOrder(current.titulo) - getStageOrder(next.titulo)
    )
    const nextStage = sortedTimeline.find(
      (stage) => this.normalizeStageStatus(stage.status) !== 'concluida'
    )
    tcc.proximaEntrega = this.getTimelineDeliveryDate(nextStage)
    await tcc.save()
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

  private async buildTemaOrientation(
    tema: TemaTcc,
    alunoNome?: string,
    professor?: Professor | null
  ) {
    const comments = await this.findComments(undefined, tema.uuidTemaTcc)
    const status = normalizeTemaStatus(tema.status)
    const etapas: OrientationStagePayload[] = []

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
      etapaAtual: this.getTemaCurrentStage(status),
      progresso: 0,
      etapas,
      comentarios: comments,
      professor: this.formatProfessor(professor),
    }
  }

  private async buildTccOrientation(
    tcc: Tcc,
    tema?: TemaTcc | null,
    alunoNome?: string,
    professor?: Professor | null
  ) {
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
      professor: this.formatProfessor(professor),
    }
  }

  private formatProfessor(professor?: Professor | null): OrientationProfessorPayload {
    if (!professor) {
      return null
    }

    return {
      uuidProfessor: professor.uuidProfessor,
      nome: professor.nome,
      email: professor.email,
    }
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

  private getTemaCurrentStage(status: OrientationStatus): string {
    const labels: Partial<Record<OrientationStatus, string>> = {
      ajustes_solicitados: 'Ajustes solicitados no tema',
      cancelado: 'Orientação cancelada',
      recusado: 'Tema recusado',
      solicitacao_pendente: 'Aguardando aceite de orientação',
      tema_pendente: 'Aguardando análise do tema',
    }

    return labels[status] ?? 'Aguardando aprovação para acompanhamento'
  }

  private defaultOperationMessage(operation: string): string {
    const messages: Record<string, string> = {
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
      categoria: comment.tipo,
      mensagem: comment.mensagem,
      data: toDateString(comment.createdAt),
    }))
  }

  private async findLatestAdjustment(tcc?: Tcc | null, tema?: TemaTcc | null) {
    const query = TccOrientacaoComentario.query()
      .whereIn('tipo', ['ajuste_tema', 'ajuste_trabalho'])
      .orderBy('created_at', 'desc')

    if (tcc?.uuidTcc && tema?.uuidTemaTcc) {
      query.where((builder) => {
        builder.where('uuid_tcc', tcc.uuidTcc).orWhere('uuid_tema_tcc', tema.uuidTemaTcc)
      })
    } else if (tcc?.uuidTcc) {
      query.where('uuid_tcc', tcc.uuidTcc)
    } else if (tema?.uuidTemaTcc) {
      query.where('uuid_tema_tcc', tema.uuidTemaTcc)
    }

    return query.first()
  }

  private async createSystemComment({
    tcc,
    tema,
    mensagem,
    tipo = 'comentario',
    autorNome = 'Sistema',
    autorTipo,
    notificar,
    linkAcao,
  }: {
    tcc?: Tcc | null
    tema?: TemaTcc | null
    mensagem: string
    tipo?: string
    autorNome?: string
    autorTipo?: 'Aluno' | 'Professor' | 'Sistema'
    notificar?: NotificationRecipient | false
    linkAcao?: string
  }) {
    const normalizedAuthorType = autorTipo ?? (autorNome === 'Sistema' ? 'Sistema' : 'Professor')
    const comentario = await TccOrientacaoComentario.create({
      uuidOrientacaoComentario: Uuid.generate(),
      uuidTcc: tcc?.uuidTcc,
      uuidTemaTcc: tema?.uuidTemaTcc,
      autorNome,
      autorTipo: normalizedAuthorType,
      tipo,
      mensagem,
    })

    const recipient =
      notificar === undefined ? this.inferNotificationRecipient(normalizedAuthorType) : notificar

    if (recipient) {
      await this.createNotification({
        tcc,
        tema,
        tipo,
        mensagem,
        recipient,
        linkAcao,
      })
    }

    return comentario
  }

  private inferNotificationRecipient(
    autorTipo: 'Aluno' | 'Professor' | 'Sistema'
  ): NotificationRecipient {
    return autorTipo === 'Aluno' ? 'professor' : 'aluno'
  }

  private async createNotification({
    tcc,
    tema,
    tipo,
    mensagem,
    recipient,
    linkAcao,
  }: {
    tcc?: Tcc | null
    tema?: TemaTcc | null
    tipo: string
    mensagem: string
    recipient: NotificationRecipient
    linkAcao?: string
  }) {
    if (!tcc && !tema) {
      return
    }

    const usuario =
      recipient === 'professor'
        ? await this.findProfessorUsuario(tcc, tema)
        : await this.findAlunoUsuario(tcc, tema)

    await TccNotificacao.create({
      uuidTccNotificacao: Uuid.generate(),
      uuidTcc: tcc?.uuidTcc,
      uuidTemaTcc: tema?.uuidTemaTcc,
      uuidUsuario: usuario?.uuidUsuario,
      tipo,
      descricao: mensagem,
      status: 'pendente',
      linkAcao: linkAcao ?? this.getNotificationLink(recipient),
    })
  }

  private async findAlunoUsuario(tcc?: Tcc | null, tema?: TemaTcc | null) {
    const uuidAluno = tcc?.uuidAluno ?? tema?.uuidAluno

    if (!uuidAluno) {
      return null
    }

    const usuarioPorAluno = await Usuario.query().where('uuid_aluno', uuidAluno).first()
    if (usuarioPorAluno) {
      return usuarioPorAluno
    }

    const aluno = await Aluno.find(uuidAluno)
    return aluno?.email ? Usuario.query().where('email', aluno.email).first() : null
  }

  private async findProfessorUsuario(tcc?: Tcc | null, tema?: TemaTcc | null) {
    const uuidProfessor = tcc?.uuidOrientador ?? tema?.uuidProfessor

    if (!uuidProfessor) {
      return null
    }

    const professor = await Professor.find(uuidProfessor)
    return professor?.email ? Usuario.query().where('email', professor.email).first() : null
  }

  private getNotificationLink(recipient: NotificationRecipient) {
    return recipient === 'professor' ? '/orientacoes' : '/tema'
  }
}

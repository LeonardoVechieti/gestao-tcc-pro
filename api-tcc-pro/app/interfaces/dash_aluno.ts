export interface DashAlunoTemaCard {
  exibir: boolean
  temaAtual?: string
  uuidTema?: string
  areaInteresse?: string
  orientador?: string
  ultimaAtualizacao?: string
  statusAtual?: string
  icone?: string
}

export interface DashAlunoStatusCard {
  exibir: boolean
  statusTcc?: string
  uuidTcc?: string
}

export interface DashAlunoEntregaCard {
  exibir: boolean
  data?: string
}

export interface DashAlunoTimelineItem {
  titulo: string
  data?: string
  status: string
}

export interface DashAlunoAviso {
  tipo: string
  titulo: string
  descricao?: string
  status: string
  linkAcao?: string
}

export interface DashAlunoResponse {
  temaAtual: DashAlunoTemaCard
  statusTcc: DashAlunoStatusCard
  proximaEntrega: DashAlunoEntregaCard
  apresentacao: DashAlunoEntregaCard
  timelineItems: DashAlunoTimelineItem[]
  avisos: DashAlunoAviso[]
}

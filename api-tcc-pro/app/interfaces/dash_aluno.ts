export interface DashAlunoTemaCard {
  exibir: boolean
  temaAtual?: string
  uuidTema?: string
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

export interface DashAlunoResponse {
  temaAtual: DashAlunoTemaCard
  statusTcc: DashAlunoStatusCard
  proximaEntrega: DashAlunoEntregaCard
  apresentacao: DashAlunoEntregaCard
}

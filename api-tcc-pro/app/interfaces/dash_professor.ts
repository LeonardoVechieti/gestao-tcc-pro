export type DashProfessorAvaliacaoStatus = 'pendente' | 'rascunho' | 'concluida'

export interface DashProfessorSummary {
  pendentes: number
  concluidas: number
  rascunhos: number
  proximasApresentacoes: number
}

export interface DashProfessorAvaliacao {
  uuidTcc: string
  titulo: string
  aluno: string
  dataApresentacao?: string
  hora?: string
  status: DashProfessorAvaliacaoStatus
  nota?: number | null
}

export interface DashProfessorBanca {
  uuidAgenda: string
  titulo: string
  aluno: string
  data?: string
  hora?: string
  local?: string
  modalidade?: string
}

export interface DashProfessorAviso {
  tipo: 'avaliacao_pendente' | 'rascunho' | 'banca_proxima' | 'ok'
  title: string
  description: string
  status: string
}

export interface DashProfessorResponse {
  summary: DashProfessorSummary
  avaliacoes: DashProfessorAvaliacao[]
  proximasBancas: DashProfessorBanca[]
  avisos: DashProfessorAviso[]
}

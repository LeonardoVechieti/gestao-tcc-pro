import type { Apresentacao } from './apresentacao.js'

/* Portas do domínio (DIP): o caso de uso depende destas abstrações, não de banco ou HTTP. */
export interface CalendarioFeriados {
  isFeriado(data: string): Promise<boolean>
}

export interface ApresentacoesAgendadas {
  listarNaData(data: string): Promise<Apresentacao[]>
}

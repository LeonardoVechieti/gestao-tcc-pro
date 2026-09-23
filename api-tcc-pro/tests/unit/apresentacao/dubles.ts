import type { AgendamentoError } from '../../../app/domain/apresentacao/agendamento_error.js'
import type { Apresentacao } from '../../../app/domain/apresentacao/apresentacao.js'
import type {
  ApresentacoesAgendadas,
  CalendarioFeriados,
} from '../../../app/domain/apresentacao/portas.js'

/* Dublês em memória: os testes não acessam banco nem a API de feriados. */
export class CalendarioFake implements CalendarioFeriados {
  constructor(private feriados: string[] = []) {}

  async isFeriado(data: string) {
    return this.feriados.includes(data)
  }
}

export class AgendaEmMemoria implements ApresentacoesAgendadas {
  constructor(private apresentacoes: Apresentacao[] = []) {}

  async listarNaData(data: string) {
    return this.apresentacoes.filter((a) => a.horario.data === data)
  }
}

/* Executa uma ação assíncrona que deve ser recusada e devolve o erro. */
export async function capturarRecusa(acao: () => Promise<unknown>): Promise<AgendamentoError> {
  try {
    await acao()
  } catch (erro) {
    return erro as AgendamentoError
  }
  throw new Error('Era esperado que o agendamento fosse recusado')
}

export type CodigoRecusa =
  | 'BANCA_INVALIDA'
  | 'SALA_OBRIGATORIA'
  | 'LINK_OBRIGATORIO'
  | 'FERIADO'
  | 'CONFLITO_PROFESSOR'
  | 'CONFLITO_SALA'
  | 'CONFLITO_ALUNO'

/* Recusa de agendamento com um código estável para a API e o frontend. */
export class AgendamentoError extends Error {
  constructor(
    readonly codigo: CodigoRecusa,
    mensagem: string
  ) {
    super(mensagem)
    this.name = 'AgendamentoError'
  }
}

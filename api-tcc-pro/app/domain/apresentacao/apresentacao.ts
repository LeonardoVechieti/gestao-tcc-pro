import { AgendamentoError } from './agendamento_error.js'
import type { Banca } from './banca.js'
import type { Horario } from './horario.js'

export type Modalidade = 'presencial' | 'virtual'

export type DadosApresentacao = {
  tccId: string
  alunoId: string
  banca: Banca
  horario: Horario
  modalidade: Modalidade
  sala?: string
  link?: string
}

export class Apresentacao {
  readonly status = 'agendada'

  private constructor(private dados: DadosApresentacao) {}

  /* Garante que a apresentação nasce com os dados exigidos pela modalidade. */
  static criar(dados: DadosApresentacao) {
    if (dados.modalidade === 'virtual' && !dados.link) {
      throw new AgendamentoError('LINK_OBRIGATORIO', 'Informe o link da reunião.')
    }
    if (dados.modalidade === 'presencial' && !dados.sala) {
      throw new AgendamentoError('SALA_OBRIGATORIA', 'Informe a sala da apresentação.')
    }
    return new Apresentacao(dados)
  }

  get tccId() {
    return this.dados.tccId
  }
  get alunoId() {
    return this.dados.alunoId
  }
  get banca() {
    return this.dados.banca
  }
  get horario() {
    return this.dados.horario
  }
  get modalidade() {
    return this.dados.modalidade
  }
  get sala() {
    return this.dados.sala
  }
  get link() {
    return this.dados.link
  }
}

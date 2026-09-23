import { AgendamentoError } from './agendamento_error.js'
import { MembroBanca } from './membro_banca.js'

export class Banca {
  constructor(
    readonly orientador: MembroBanca,
    readonly avaliadores: MembroBanca[]
  ) {}

  static formar(membros: MembroBanca[]) {
    const orientadores = membros.filter((m) => m.papel === 'orientador')
    const avaliadores = membros.filter((m) => m.papel === 'avaliador')
    const ids = membros.map((m) => m.professorId)

    if (orientadores.length !== 1) {
      throw new AgendamentoError('BANCA_INVALIDA', 'A banca precisa de exatamente um orientador.')
    }
    if (avaliadores.length < 2) {
      throw new AgendamentoError('BANCA_INVALIDA', 'A banca precisa de pelo menos 2 avaliadores.')
    }
    if (new Set(ids).size !== ids.length) {
      throw new AgendamentoError('BANCA_INVALIDA', 'Um professor não pode aparecer duas vezes na banca.')
    }

    return new Banca(orientadores[0], avaliadores)
  }
}

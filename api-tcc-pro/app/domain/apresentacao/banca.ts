import { MembroBanca } from './membro_banca.js'

export class Banca {
  constructor(
    readonly orientador: MembroBanca,
    readonly avaliadores: MembroBanca[]
  ) {}

  static formar(membros: MembroBanca[]) {
    const orientador = membros.find((m) => m.papel === 'orientador')!
    const avaliadores = membros.filter((m) => m.papel === 'avaliador')
    return new Banca(orientador, avaliadores)
  }
}

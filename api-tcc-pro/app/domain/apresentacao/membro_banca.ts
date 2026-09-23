export type PapelBanca = 'orientador' | 'avaliador'

export class MembroBanca {
  constructor(
    readonly professorId: string,
    readonly nome: string,
    readonly papel: PapelBanca
  ) {}

  static orientador(professorId: string, nome: string) {
    return new MembroBanca(professorId, nome, 'orientador')
  }

  static avaliador(professorId: string, nome: string) {
    return new MembroBanca(professorId, nome, 'avaliador')
  }
}

export const DURACAO_PADRAO_MINUTOS = 60

/* Intervalo ocupado por uma apresentação: data (AAAA-MM-DD), hora de início (HH:mm) e duração. */
export class Horario {
  constructor(
    readonly data: string,
    readonly hora: string,
    readonly duracaoMinutos = DURACAO_PADRAO_MINUTOS
  ) {}

  static de(data: string, hora: string) {
    return new Horario(data, hora)
  }

  get inicioEmMinutos() {
    const [horas, minutos] = this.hora.split(':').map(Number)
    return horas * 60 + minutos
  }

  get fimEmMinutos() {
    return this.inicioEmMinutos + this.duracaoMinutos
  }

  sobrepoe(outro: Horario) {
    return (
      this.data === outro.data &&
      this.inicioEmMinutos < outro.fimEmMinutos &&
      outro.inicioEmMinutos < this.fimEmMinutos
    )
  }
}

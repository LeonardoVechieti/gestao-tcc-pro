import { AgendamentoError } from './agendamento_error.js'
import { Apresentacao, type DadosApresentacao } from './apresentacao.js'
import type { ApresentacoesAgendadas, CalendarioFeriados } from './portas.js'
import { REGRAS_PADRAO, type RegraConflito } from './regras_conflito.js'

/* Caso de uso: valida a apresentação contra o calendário e a agenda antes de confirmar. */
export class AgendarApresentacao {
  constructor(
    private calendario: CalendarioFeriados,
    private agenda: ApresentacoesAgendadas,
    private regras: RegraConflito[] = REGRAS_PADRAO
  ) {}

  async executar(dados: DadosApresentacao) {
    const nova = Apresentacao.criar(dados)

    if (await this.calendario.isFeriado(nova.horario.data)) {
      throw new AgendamentoError('FERIADO', 'Não é possível agendar apresentação em feriado.')
    }

    const noMesmoDia = await this.agenda.listarNaData(nova.horario.data)
    const concorrentes = noMesmoDia.filter((existente) => existente.horario.sobrepoe(nova.horario))
    for (const existente of concorrentes) {
      this.regras.forEach((regra) => regra.verificar(nova, existente))
    }

    return nova
  }
}

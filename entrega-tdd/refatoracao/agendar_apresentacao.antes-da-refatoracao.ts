import { AgendamentoError } from './agendamento_error.js'
import { Apresentacao, type DadosApresentacao } from './apresentacao.js'
import type { ApresentacoesAgendadas, CalendarioFeriados } from './portas.js'

export class AgendarApresentacao {
  constructor(
    private calendario: CalendarioFeriados,
    private agenda: ApresentacoesAgendadas
  ) {}

  async executar(dados: DadosApresentacao) {
    const apresentacao = Apresentacao.criar(dados)

    if (await this.calendario.isFeriado(dados.horario.data)) {
      throw new AgendamentoError('FERIADO', 'Não é possível agendar apresentação em feriado.')
    }

    const noMesmoDia = await this.agenda.listarNaData(dados.horario.data)
    for (const existente of noMesmoDia) {
      if (!existente.horario.sobrepoe(dados.horario)) continue
      if (dados.modalidade === 'presencial' && existente.sala === dados.sala) {
        throw new AgendamentoError('CONFLITO_SALA', `A sala ${dados.sala} já está reservada.`)
      }
      if (existente.alunoId === dados.alunoId) {
        throw new AgendamentoError('CONFLITO_ALUNO', 'O aluno já tem apresentação nesse horário.')
      }
      for (const membro of dados.banca.membros) {
        if (existente.banca.membros.some((m) => m.professorId === membro.professorId)) {
          throw new AgendamentoError(
            'CONFLITO_PROFESSOR',
            `${membro.nome} já participa de outra banca em ${existente.horario.data} às ${existente.horario.hora}.`
          )
        }
      }
    }

    return apresentacao
  }
}

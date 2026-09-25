import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Agenda from '#models/DAO/agenda'
import AgendaParticipante from '#models/DAO/agenda_participante'
import { Apresentacao, type Modalidade } from '#domain/apresentacao/apresentacao'
import { Banca } from '#domain/apresentacao/banca'
import { Horario } from '#domain/apresentacao/horario'
import { MembroBanca, type PapelBanca } from '#domain/apresentacao/membro_banca'
import type { ApresentacoesAgendadas } from '#domain/apresentacao/portas'

const PAPEIS_BANCA: PapelBanca[] = ['orientador', 'avaliador']

export type FiltroApresentacoes = {
  uuidAluno?: string
  emailProfessor?: string
}

/*
 * Adaptador da porta ApresentacoesAgendadas sobre as tabelas agenda/agenda_participante.
 * Uma apresentação é uma agenda cujos participantes têm cargo orientador/avaliador.
 */
export default class ApresentacaoRepository implements ApresentacoesAgendadas {
  async listarNaData(data: string): Promise<Apresentacao[]> {
    const agendas = await this.queryApresentacoes().where('data', data)
    return agendas.flatMap((agenda) => {
      const apresentacao = this.toDomain(agenda)
      return apresentacao ? [apresentacao] : []
    })
  }

  async salvar(apresentacao: Apresentacao): Promise<Agenda> {
    const uuidAgenda = await db.transaction(async (trx) => {
      const agenda = await Agenda.create(
        {
          uuidTcc: apresentacao.tccId,
          uuidProfessor: apresentacao.banca.orientador.professorId,
          modalidade: apresentacao.modalidade,
          data: DateTime.fromISO(apresentacao.horario.data),
          hora: apresentacao.horario.hora,
          local: apresentacao.sala,
          linkReuniao: apresentacao.link,
        },
        { client: trx }
      )

      await AgendaParticipante.createMany(
        apresentacao.banca.membros.map((membro) => ({
          uuidAgenda: agenda.uuidAgenda,
          uuidProfessor: membro.professorId,
          cargo: membro.papel,
        })),
        { client: trx }
      )

      return agenda.uuidAgenda
    })

    return this.queryApresentacoes().where('uuid_agenda', uuidAgenda).firstOrFail()
  }

  async listar(filtro: FiltroApresentacoes = {}): Promise<Agenda[]> {
    const query = this.queryApresentacoes().orderBy('data', 'asc').orderBy('hora', 'asc')

    if (filtro.uuidAluno) {
      query.whereHas('tcc', (tcc) => tcc.where('uuid_aluno', filtro.uuidAluno!))
    }

    if (filtro.emailProfessor) {
      query.whereHas('participantes', (participante) =>
        participante.whereHas('professor', (professor) =>
          professor.where('email', filtro.emailProfessor!)
        )
      )
    }

    return query
  }

  private queryApresentacoes() {
    return Agenda.query()
      .whereHas('participantes', (participante) => participante.whereIn('cargo', PAPEIS_BANCA))
      .preload('participantes', (participante) => participante.preload('professor'))
      .preload('tcc', (tcc) => tcc.preload('aluno').preload('temaTcc'))
  }

  /* Registros gravados antes das regras atuais podem não formar uma apresentação válida. */
  private toDomain(agenda: Agenda): Apresentacao | null {
    const membros = agenda.participantes
      .filter((p) => p.uuidProfessor && PAPEIS_BANCA.includes(p.cargo as PapelBanca))
      .map((p) => new MembroBanca(p.uuidProfessor!, p.professor?.nome ?? '', p.cargo as PapelBanca))
    const orientador = membros.find((m) => m.papel === 'orientador')

    if (!orientador || !agenda.data || !agenda.hora) {
      return null
    }

    try {
      return Apresentacao.criar({
        tccId: agenda.uuidTcc,
        alunoId: agenda.tcc?.uuidAluno ?? '',
        banca: new Banca(
          orientador,
          membros.filter((m) => m.papel === 'avaliador')
        ),
        horario: Horario.de(agenda.data.toISODate()!, agenda.hora.slice(0, 5)),
        modalidade: agenda.modalidade as Modalidade,
        sala: agenda.local ?? undefined,
        link: agenda.linkReuniao ?? undefined,
      })
    } catch {
      return null
    }
  }
}

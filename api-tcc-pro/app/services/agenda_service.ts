import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import AgendaRepository from '../repositories/agenda_repository.js'
import ApresentacaoRepository, {
  type FiltroApresentacoes,
} from '../repositories/apresentacao_repository.js'
import FeriadoService from './feriado_service.js'
import Agenda from '#models/DAO/agenda'
import Professor from '#models/DAO/professor'
import Tcc from '#models/DAO/tcc'
import GenericResponseException from '#exceptions/generic_response_exception'
import { AgendarApresentacao } from '#domain/apresentacao/agendar_apresentacao'
import type { Modalidade } from '#domain/apresentacao/apresentacao'
import { Banca } from '#domain/apresentacao/banca'
import { Horario } from '#domain/apresentacao/horario'
import { MembroBanca } from '#domain/apresentacao/membro_banca'

export type AgendarApresentacaoInput = {
  uuidTcc: string
  avaliadores: string[]
  data: string
  hora: string
  modalidade: Modalidade
  sala?: string
  link?: string
}

@inject()
export default class AgendaService {
  constructor(
    private agendaRepository: AgendaRepository,
    private feriadoService: FeriadoService,
    private apresentacaoRepository: ApresentacaoRepository
  ) {}

  async createOrUpdate(payload: Agenda): Promise<Agenda> {
    if (!payload.data) {
      throw new Error('Data da agenda é obrigatória.')
    }

    let dateString: string

    if (typeof payload.data === 'string') {
      dateString = payload.data
    } else if (DateTime.isDateTime(payload.data)) {
      dateString = payload.data.toISODate() ?? payload.data.toString()
    } else {
      dateString = String(payload.data)
    }

    const isHoliday = await this.feriadoService.isHoliday(dateString)
    if (isHoliday) {
      throw new Error('Não é possível criar ou atualizar agenda em um feriado.')
    }

    if (payload.uuidAgenda) {
      const agenda = await this.agendaRepository.show(payload.uuidAgenda)
      agenda.merge(payload)
      return await agenda.save()
    }

    return await this.agendaRepository.store(payload)
  }

  /*
   * Carrega TCC e professores, monta a banca e delega as regras ao domínio
   * (AgendarApresentacao). Aqui só existe tradução entre banco e domínio.
   */
  async agendarApresentacao(input: AgendarApresentacaoInput): Promise<Agenda> {
    const tcc = await Tcc.query().where('uuid_tcc', input.uuidTcc).preload('orientador').first()
    if (!tcc) {
      throw new GenericResponseException('TCC não encontrado', 404)
    }
    if (!tcc.orientador) {
      throw new GenericResponseException('TCC sem professor orientador vinculado', 400)
    }

    const professores = await Professor.query().whereIn('uuid_professor', input.avaliadores)
    const professorPorId = new Map(professores.map((p) => [p.uuidProfessor, p]))
    const avaliadores = input.avaliadores.map((uuidProfessor) => {
      const professor = professorPorId.get(uuidProfessor)
      if (!professor) {
        throw new GenericResponseException('Avaliador não encontrado', 404)
      }
      return MembroBanca.avaliador(professor.uuidProfessor, professor.nome)
    })

    const banca = Banca.formar([
      MembroBanca.orientador(tcc.orientador.uuidProfessor, tcc.orientador.nome),
      ...avaliadores,
    ])

    const agendar = new AgendarApresentacao(this.feriadoService, this.apresentacaoRepository)
    const apresentacao = await agendar.executar({
      tccId: tcc.uuidTcc,
      alunoId: tcc.uuidAluno,
      banca,
      horario: Horario.de(input.data, input.hora),
      modalidade: input.modalidade,
      sala: input.sala,
      link: input.link,
    })

    return this.apresentacaoRepository.salvar(apresentacao)
  }

  async listarApresentacoes(filtro: FiltroApresentacoes): Promise<Agenda[]> {
    return this.apresentacaoRepository.listar(filtro)
  }
}

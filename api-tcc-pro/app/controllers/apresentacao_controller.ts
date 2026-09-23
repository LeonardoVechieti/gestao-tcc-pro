import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AgendaService from '#services/agenda_service'
import { extractRoleCodes } from '#services/auth_service'
import { AgendarApresentacaoValidator } from '#validators/agenda/apresentacao_validator'
import { AgendamentoError } from '#domain/apresentacao/agendamento_error'
import Agenda from '#models/DAO/agenda'
import Usuario from '#models/DAO/usuario'

const ROLES_QUE_AGENDAM = ['ROLE_DASH_COORDENADOR', 'ROLE_MENU_ADM']

@inject()
export default class ApresentacaoController {
  constructor(private agendaService: AgendaService) {}

  async store({ request, response }: HttpContext) {
    const roles = await this.rolesDoUsuario(request)
    if (!roles.some((role) => ROLES_QUE_AGENDAM.includes(role))) {
      return response.forbidden({ message: 'Apenas a coordenação pode agendar apresentações.' })
    }

    const payload = await AgendarApresentacaoValidator.validate(request.all())
    try {
      const agenda = await this.agendaService.agendarApresentacao(payload)
      return response.created(this.toResponse(agenda))
    } catch (error) {
      if (error instanceof AgendamentoError) {
        return response.unprocessableEntity({ codigo: error.codigo, message: error.message })
      }
      throw error
    }
  }

  /* Coordenação vê todas; aluno vê as suas; professor vê as bancas de que participa. */
  async index({ request }: HttpContext) {
    const usuario = this.usuarioLogado(request)
    const roles = await this.rolesDoUsuario(request)
    const filtro = roles.some((role) => ROLES_QUE_AGENDAM.includes(role))
      ? {}
      : usuario.uuidAluno
        ? { uuidAluno: usuario.uuidAluno }
        : { emailProfessor: usuario.email }

    const agendas = await this.agendaService.listarApresentacoes(filtro)
    return agendas.map((agenda) => this.toResponse(agenda))
  }

  private usuarioLogado(request: HttpContext['request']): Usuario {
    return (request as any).user
  }

  private async rolesDoUsuario(request: HttpContext['request']) {
    const usuario = this.usuarioLogado(request)
    await usuario.load('perfil', (perfil) =>
      perfil.preload('perfilRoles', (perfilRole) => perfilRole.preload('role'))
    )
    return extractRoleCodes(usuario)
  }

  private toResponse(agenda: Agenda) {
    return {
      uuidAgenda: agenda.uuidAgenda,
      uuidTcc: agenda.uuidTcc,
      tituloTcc: agenda.tcc?.temaTcc?.titulo ?? null,
      aluno: agenda.tcc?.aluno
        ? { uuidAluno: agenda.tcc.aluno.uuidAluno, nome: agenda.tcc.aluno.nome }
        : null,
      data: agenda.data?.toISODate() ?? null,
      hora: agenda.hora?.slice(0, 5) ?? null,
      modalidade: agenda.modalidade,
      sala: agenda.local ?? null,
      link: agenda.linkReuniao ?? null,
      banca: agenda.participantes.map((participante) => ({
        uuidProfessor: participante.uuidProfessor,
        nome: participante.professor?.nome ?? null,
        papel: participante.cargo,
      })),
    }
  }
}

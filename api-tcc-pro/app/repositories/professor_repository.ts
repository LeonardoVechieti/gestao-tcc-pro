import Professor from '#models/DAO/professor'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import TemaTcc from '#models/DAO/tema_tcc'
import Tcc from '#models/DAO/tcc'
import Avaliacao from '#models/DAO/avaliacao'
import Agenda from '#models/DAO/agenda'
import GenericResponseException from '#exceptions/generic_response_exception'

export default class ProfessorRepository {
  async store(data: Professor): Promise<Professor> {
    await this.ensureUniqueEmail(data.email)
    return await Professor.create(data)
  }

  async show(id: string): Promise<Professor> {
    return await Professor.query().where('uuidProfessor', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Professor> | Professor[]> {
    const query = Professor.query()

    if (data.nome) {
      query.where('nome', data.nome)
    }

    if (data.filterNome) {
      query.where('nome', 'ILIKE', `%${data.filterNome}%`)
    }

    if (data.filterEmail) {
      query.where('email', 'ILIKE', `%${data.filterEmail}%`)
    }

    if (data.area) {
      query.whereRaw('areas_interesse::text ILIKE ?', [`%${data.area}%`])
    }

    if (data.linhaPesquisa) {
      query.whereRaw('linhas_pesquisa::text ILIKE ?', [`%${data.linhaPesquisa}%`])
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    }

    return await query
  }

  async update(data: Professor): Promise<Professor> {
    const model = await Professor.findOrFail(data.uuidProfessor)

    await this.ensureUniqueEmail(data.email, model.uuidProfessor)

    if (data.email && data.email !== model.email) {
      await this.ensureProfessorHasNoUsage(
        model.uuidProfessor,
        'Não é possível alterar o e-mail de um professor que já possui vínculo no fluxo de TCC.'
      )
    }

    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    await this.ensureProfessorHasNoUsage(
      id,
      'Não é possível remover um professor vinculado a tema, TCC, agenda ou avaliação. Inative o cadastro para preservar o histórico.'
    )
    const professor = await Professor.findOrFail(id)
    await professor.delete()
  }

  async researchOptions(): Promise<{ areas: string[]; lines: string[] }> {
    const professors = await Professor.query().select('areas_interesse', 'linhas_pesquisa')
    const areaSet = new Set<string>()
    const lineSet = new Set<string>()

    for (const professor of professors) {
      if (Array.isArray(professor.areasInteresse)) {
        professor.areasInteresse.forEach((area) => {
          if (area) {
            areaSet.add(area)
          }
        })
      }

      if (Array.isArray(professor.linhasPesquisa)) {
        professor.linhasPesquisa.forEach((line) => {
          if (line) {
            lineSet.add(line)
          }
        })
      }
    }

    return {
      areas: Array.from(areaSet).sort(),
      lines: Array.from(lineSet).sort(),
    }
  }

  private async ensureUniqueEmail(email?: string | null, ignoredUuid?: string) {
    const normalizedEmail = email?.trim()

    if (!normalizedEmail) {
      return
    }

    const query = Professor.query().where('email', normalizedEmail)

    if (ignoredUuid) {
      query.whereNot('uuidProfessor', ignoredUuid)
    }

    const existingProfessor = await query.first()

    if (existingProfessor) {
      throw new GenericResponseException('Já existe um professor cadastrado com este e-mail.', 409)
    }
  }

  private async ensureProfessorHasNoUsage(uuidProfessor: string, message: string) {
    const [tema, tcc, avaliacao, agenda] = await Promise.all([
      TemaTcc.query().where('uuidProfessor', uuidProfessor).first(),
      Tcc.query().where('uuidOrientador', uuidProfessor).first(),
      Avaliacao.query().where('uuidProfessor', uuidProfessor).first(),
      Agenda.query().where('uuidProfessor', uuidProfessor).first(),
    ])

    if (tema || tcc || avaliacao || agenda) {
      throw new GenericResponseException(message, 409)
    }
  }
}

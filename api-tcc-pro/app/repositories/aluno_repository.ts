import Aluno from '#models/DAO/aluno'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import TemaTcc from '#models/DAO/tema_tcc'
import Tcc from '#models/DAO/tcc'
import Usuario from '#models/DAO/usuario'
import GenericResponseException from '#exceptions/generic_response_exception'

export default class AlunoRepository {
  async store(data: Aluno): Promise<Aluno> {
    await this.ensureUniqueIdentity(data)
    return await Aluno.create(data)
  }

  async show(id: string): Promise<Aluno> {
    return await Aluno.query().where('uuidAluno', id).firstOrFail()
  }

  async index(data: any): Promise<ModelPaginatorContract<Aluno> | Aluno[]> {
    const query = Aluno.query()

    if (data.nome) {
      query.where('nome', data.nome)
    }

    if (data.filterNome) {
      query.where('nome', 'ILIKE', `%${data.filterNome}%`)
    }

    if (data.filterEmail) {
      query.where('email', 'ILIKE', `%${data.filterEmail}%`)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    }

    return await query
  }

  async update(data: Aluno): Promise<Aluno> {
    const model = await Aluno.findOrFail(data.uuidAluno)

    await this.ensureUniqueIdentity(data, model.uuidAluno)

    if (data.matricula && data.matricula !== model.matricula) {
      await this.ensureAlunoHasNoAcademicHistory(
        model.uuidAluno,
        'Não é possível alterar a matrícula de um aluno que já possui vínculo acadêmico no TCC.'
      )
    }

    if (data.email && data.email !== model.email) {
      const linkedUser = await Usuario.query().where('uuidAluno', model.uuidAluno).first()

      if (linkedUser) {
        throw new GenericResponseException(
          'Não é possível alterar o e-mail de um aluno vinculado a usuário de acesso.',
          409
        )
      }
    }

    model.merge(data)
    return await model.save()
  }

  async delete(id: string): Promise<void> {
    await this.ensureAlunoHasNoUsage(id)
    const aluno = await Aluno.findOrFail(id)
    await aluno.delete()
  }

  private async ensureUniqueIdentity(data: Aluno, ignoredUuid?: string) {
    if (data.email?.trim()) {
      const emailQuery = Aluno.query().where('email', data.email.trim())

      if (ignoredUuid) {
        emailQuery.whereNot('uuidAluno', ignoredUuid)
      }

      const existingEmail = await emailQuery.first()

      if (existingEmail) {
        throw new GenericResponseException('Já existe um aluno cadastrado com este e-mail.', 409)
      }
    }

    if (data.matricula?.trim()) {
      const matriculaQuery = Aluno.query().where('matricula', data.matricula.trim())

      if (ignoredUuid) {
        matriculaQuery.whereNot('uuidAluno', ignoredUuid)
      }

      const existingMatricula = await matriculaQuery.first()

      if (existingMatricula) {
        throw new GenericResponseException('Já existe um aluno cadastrado com esta matrícula.', 409)
      }
    }
  }

  private async ensureAlunoHasNoAcademicHistory(uuidAluno: string, message: string) {
    const [tema, tcc] = await Promise.all([
      TemaTcc.query().where('uuidAluno', uuidAluno).first(),
      Tcc.query().where('uuidAluno', uuidAluno).first(),
    ])

    if (tema || tcc) {
      throw new GenericResponseException(message, 409)
    }
  }

  private async ensureAlunoHasNoUsage(uuidAluno: string) {
    const [usuario, tema, tcc] = await Promise.all([
      Usuario.query().where('uuidAluno', uuidAluno).first(),
      TemaTcc.query().where('uuidAluno', uuidAluno).first(),
      Tcc.query().where('uuidAluno', uuidAluno).first(),
    ])

    if (usuario || tema || tcc) {
      throw new GenericResponseException(
        'Não é possível remover um aluno vinculado a usuário, tema ou TCC. Inative o cadastro para preservar o histórico.',
        409
      )
    }
  }
}

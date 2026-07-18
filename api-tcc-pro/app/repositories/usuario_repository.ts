import Usuario from '#models/DAO/usuario'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

function normalizeEmail(email?: string | null): string | undefined {
  const normalizedEmail = email?.trim().toLowerCase()
  return normalizedEmail || undefined
}

export default class UsuarioRepository {
  async show(id: string): Promise<Usuario> {
    return await Usuario.query()
      .preload('perfil', (perfilQuery) => {
        perfilQuery.preload('perfilRoles', (perfilRoleQuery) => perfilRoleQuery.preload('role'))
      })
      .preload('aluno')
      .where('uuidUsuario', id)
      .firstOrFail()
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedEmail) {
      return null
    }

    return await Usuario.query()
      .preload('perfil', (perfilQuery) => {
        perfilQuery.preload('perfilRoles', (perfilRoleQuery) => perfilRoleQuery.preload('role'))
      })
      .preload('aluno')
      .whereRaw('LOWER(email) = ?', [normalizedEmail])
      .first()
  }

  async create(payload: Partial<Usuario>): Promise<Usuario> {
    const data = { ...payload }
    const normalizedEmail = normalizeEmail(data.email)

    if (normalizedEmail) {
      data.email = normalizedEmail
    }

    return await Usuario.create(data)
  }

  async update(uuidUsuario: string, payload: Partial<Usuario>): Promise<Usuario> {
    const model = await Usuario.findOrFail(uuidUsuario)
    const data = { ...payload }
    const normalizedEmail = normalizeEmail(data.email)

    if (data.email !== undefined && normalizedEmail) {
      data.email = normalizedEmail
    }

    model.merge(data)
    await model.save()
    return this.show(model.uuidUsuario)
  }

  async index(data: any): Promise<ModelPaginatorContract<Usuario> | Usuario[]> {
    const query = Usuario.query().preload('perfil').preload('aluno')

    if (data.nome) {
      query.where('nome', data.nome)
    }

    if (data.filterNome) {
      query.where('nome', 'ILIKE', `%${data.filterNome}%`)
    }

    if (data.filterEmail) {
      query.where('email', 'ILIKE', `%${data.filterEmail}%`)
    }

    if (data.ativo !== undefined) {
      query.where('ativo', data.ativo)
    }

    if (data.sortColumn) {
      query.orderBy(data.sortColumn, data.sortDirection)
    }

    if (data.pageNumber) {
      return await query.paginate(data.pageNumber, data.pageSize)
    }

    return await query
  }
}

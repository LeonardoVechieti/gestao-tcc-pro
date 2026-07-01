import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import PerfilRole from './perfil_role.js'
export default class Perfil extends BaseModel {
  static get table() {
    return 'perfil'
  }

  @column({ isPrimary: true })
  declare uuidPerfil: string

  @column()
  declare nomePerfil?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => PerfilRole, {
    localKey: 'uuidPerfil',
    foreignKey: 'uuidPerfil',
    onQuery(query) {
      if (!query.isRelatedSubQuery) {
        query.preload('role')
      }
    },
  })
  declare perfilRoles: relations.HasMany<typeof PerfilRole>
}

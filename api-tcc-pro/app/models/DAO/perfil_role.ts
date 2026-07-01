import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Role from './role.js'

export default class PerfilRole extends BaseModel {
  static get table() {
    return 'perfil_role'
  }

  @column({ isPrimary: true })
  declare uuidPerfil: string

  @column({ isPrimary: true })
  declare uuidRole: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Role, {
    localKey: 'uuidRole',
    foreignKey: 'uuidRole',
  })
  declare role: relations.BelongsTo<typeof Role>
}

import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Tcc from './tcc.js'
import TemaTcc from './tema_tcc.js'
import Usuario from './usuario.js'

export default class TccNotificacao extends BaseModel {
  static get table() {
    return 'tcc_notificacao'
  }

  @column({ isPrimary: true })
  declare uuidTccNotificacao: string

  @column()
  declare uuidTcc?: string | null

  @column()
  declare uuidTemaTcc?: string | null

  @column()
  declare uuidUsuario?: string | null

  @column()
  declare tipo: string

  @column()
  declare descricao?: string

  @column()
  declare status: string

  @column()
  declare linkAcao?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Tcc, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare tcc: relations.BelongsTo<typeof Tcc>

  @belongsTo(() => TemaTcc, {
    localKey: 'uuidTemaTcc',
    foreignKey: 'uuidTemaTcc',
  })
  declare temaTcc: relations.BelongsTo<typeof TemaTcc>

  @belongsTo(() => Usuario, {
    localKey: 'uuidUsuario',
    foreignKey: 'uuidUsuario',
  })
  declare usuario: relations.BelongsTo<typeof Usuario>
}

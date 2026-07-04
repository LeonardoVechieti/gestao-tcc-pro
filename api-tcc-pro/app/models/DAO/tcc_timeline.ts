import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Tcc from './tcc.js'

export default class TccTimeline extends BaseModel {
  static get table() {
    return 'tcc_timeline'
  }

  @column({ isPrimary: true })
  declare uuidTimeline: string

  @column()
  declare uuidTcc: string

  @column()
  declare titulo: string

  @column()
  declare descricao?: string

  @column.date()
  declare dataEntrega?: DateTime | null

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Tcc, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare tcc: relations.BelongsTo<typeof Tcc>
}

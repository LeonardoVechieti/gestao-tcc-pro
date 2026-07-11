import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Tcc from './tcc.js'
import TemaTcc from './tema_tcc.js'

export default class TccOrientacaoComentario extends BaseModel {
  static get table() {
    return 'tcc_orientacao_comentario'
  }

  @column({ isPrimary: true })
  declare uuidOrientacaoComentario: string

  @column()
  declare uuidTcc?: string | null

  @column()
  declare uuidTemaTcc?: string | null

  @column()
  declare autorNome: string

  @column()
  declare autorTipo: string

  @column()
  declare tipo: string

  @column()
  declare mensagem: string

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
}

import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Tcc from './tcc.js'
import Professor from './professor.js'

export default class Avaliacao extends BaseModel {
  static get table() {
    return 'avaliacao'
  }

  @column({ isPrimary: true })
  declare uuidAvaliacao: string

  @column()
  declare uuidTcc: string

  @column()
  declare uuidProfessor?: string | null

  @column()
  declare nota?: number

  @column()
  declare criterioGeral?: string

  @column()
  declare criteriosEspecificos?: any

  @column()
  declare parecer?: string

  @column()
  declare aptoCorrecoes: boolean

  @column()
  declare publicado: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Tcc, {
    localKey: 'uuidTcc',
    foreignKey: 'uuid_tcc',
  })
  declare tcc: relations.BelongsTo<typeof Tcc>

  @belongsTo(() => Professor, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuid_professor',
  })
  declare professor: relations.BelongsTo<typeof Professor>
}

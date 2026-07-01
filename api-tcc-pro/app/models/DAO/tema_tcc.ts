import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Aluno from './aluno.js'
import Professor from './professor.js'
import Tcc from './tcc.js'

export default class TemaTcc extends BaseModel {
  static get table() {
    return 'tema_tcc'
  }

  @column({ isPrimary: true })
  declare uuidTemaTcc: string

  @column()
  declare uuidAluno: string

  @column()
  declare uuidProfessor?: string | null

  @column()
  declare titulo: string

  @column()
  declare descricao?: string

  @column()
  declare area?: string

  @column()
  declare linhaPesquisa?: string

  @column()
  declare tags?: any

  @column()
  declare ativo: boolean

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Aluno, {
    localKey: 'uuidAluno',
    foreignKey: 'uuid_aluno',
  })
  declare aluno: relations.BelongsTo<typeof Aluno>

  @belongsTo(() => Professor, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuid_professor',
  })
  declare professor: relations.BelongsTo<typeof Professor>

  @hasMany(() => Tcc, {
    localKey: 'uuidTemaTcc',
    foreignKey: 'uuid_tema_tcc',
  })
  declare tccs: relations.HasMany<typeof Tcc>
}

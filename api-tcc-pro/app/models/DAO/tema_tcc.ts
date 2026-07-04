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

  @column({
    prepare: (value: unknown) => (value === undefined ? value : JSON.stringify(value)),
  })
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
    foreignKey: 'uuidAluno',
  })
  declare aluno: relations.BelongsTo<typeof Aluno>

  @belongsTo(() => Professor, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuidProfessor',
  })
  declare professor: relations.BelongsTo<typeof Professor>

  @hasMany(() => Tcc, {
    localKey: 'uuidTemaTcc',
    foreignKey: 'uuidTemaTcc',
  })
  declare tccs: relations.HasMany<typeof Tcc>
}

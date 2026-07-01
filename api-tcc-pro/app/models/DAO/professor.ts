import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Agenda from './agenda.js'
import Avaliacao from './avaliacao.js'
import Tcc from './tcc.js'
import TemaTcc from './tema_tcc.js'

export default class Professor extends BaseModel {
  static get table() {
    return 'professor'
  }

  @column({ isPrimary: true })
  declare uuidProfessor: string

  @column()
  declare nome: string

  @column()
  declare email: string

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Tcc, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuid_orientador',
  })
  declare orientacoes: relations.HasMany<typeof Tcc>

  @hasMany(() => TemaTcc, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuid_professor',
  })
  declare temaTccs: relations.HasMany<typeof TemaTcc>

  @hasMany(() => Avaliacao, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuid_professor',
  })
  declare avaliacoes: relations.HasMany<typeof Avaliacao>

  @hasMany(() => Agenda, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuid_professor',
  })
  declare agendas: relations.HasMany<typeof Agenda>
}

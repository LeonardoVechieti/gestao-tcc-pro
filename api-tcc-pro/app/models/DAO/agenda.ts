import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Tcc from './tcc.js'
import Professor from './professor.js'
import AgendaParticipante from './agenda_participante.js'

export default class Agenda extends BaseModel {
  static get table() {
    return 'agenda'
  }

  @column({ isPrimary: true })
  declare uuidAgenda: string

  @column()
  declare uuidTcc: string

  @column()
  declare uuidProfessor?: string | null

  @column()
  declare modalidade: string

  @column.date()
  declare data?: DateTime | null

  @column()
  declare hora?: string | null

  @column()
  declare linkReuniao?: string

  @column()
  declare local?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Tcc, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare tcc: relations.BelongsTo<typeof Tcc>

  @belongsTo(() => Professor, {
    localKey: 'uuidProfessor',
    foreignKey: 'uuidProfessor',
  })
  declare professor: relations.BelongsTo<typeof Professor>

  @hasMany(() => AgendaParticipante, {
    localKey: 'uuidAgenda',
    foreignKey: 'uuidAgenda',
  })
  declare participantes: relations.HasMany<typeof AgendaParticipante>
}

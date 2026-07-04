import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Agenda from './agenda.js'
import Usuario from './usuario.js'

export default class AgendaParticipante extends BaseModel {
  static get table() {
    return 'agenda_participante'
  }

  @column({ isPrimary: true })
  declare uuidAgendaParticipante: string

  @column()
  declare uuidAgenda: string

  @column()
  declare uuidUsuario: string

  @column()
  declare cargo?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Agenda, {
    localKey: 'uuidAgenda',
    foreignKey: 'uuidAgenda',
  })
  declare agenda: relations.BelongsTo<typeof Agenda>

  @belongsTo(() => Usuario, {
    localKey: 'uuidUsuario',
    foreignKey: 'uuidUsuario',
  })
  declare usuario: relations.BelongsTo<typeof Usuario>
}

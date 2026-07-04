import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Aluno from './aluno.js'
import Professor from './professor.js'
import TemaTcc from './tema_tcc.js'
import Agenda from './agenda.js'
import Avaliacao from './avaliacao.js'
import TccNotificacao from './tcc_notificacao.js'
import TccTimeline from './tcc_timeline.js'

export default class Tcc extends BaseModel {
  static get table() {
    return 'tcc'
  }

  @column({ isPrimary: true })
  declare uuidTcc: string

  @column()
  declare uuidAluno: string

  @column()
  declare uuidOrientador?: string | null

  @column()
  declare uuidTemaTcc: string

  @column()
  declare proximaEntrega?: string | null

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
    localKey: 'uuidOrientador',
    foreignKey: 'uuidOrientador',
  })
  declare orientador: relations.BelongsTo<typeof Professor>

  @belongsTo(() => TemaTcc, {
    localKey: 'uuidTemaTcc',
    foreignKey: 'uuidTemaTcc',
  })
  declare temaTcc: relations.BelongsTo<typeof TemaTcc>

  @hasMany(() => TccTimeline, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare timelines: relations.HasMany<typeof TccTimeline>

  @hasMany(() => TccNotificacao, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare notificacoes: relations.HasMany<typeof TccNotificacao>

  @hasMany(() => Avaliacao, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare avaliacoes: relations.HasMany<typeof Avaliacao>

  @hasMany(() => Agenda, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare agendas: relations.HasMany<typeof Agenda>
}

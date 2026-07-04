import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Perfil from './perfil.js'
import Aluno from './aluno.js'
import TccNotificacao from './tcc_notificacao.js'
import AgendaParticipante from './agenda_participante.js'

export default class Usuario extends BaseModel {
  static get table() {
    return 'usuario'
  }

  @column({ isPrimary: true })
  declare uuidUsuario: string

  @column()
  declare nome?: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare ativo: boolean

  @column()
  declare emailVerified: boolean

  @column()
  declare uuidPerfil?: string | null

  @column()
  declare uuidAluno?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Perfil, {
    localKey: 'uuidPerfil',
    foreignKey: 'uuidPerfil',
  })
  declare perfil: relations.BelongsTo<typeof Perfil>

  @belongsTo(() => Aluno, {
    localKey: 'uuidAluno',
    foreignKey: 'uuidAluno',
  })
  declare aluno: relations.BelongsTo<typeof Aluno>

  @hasMany(() => TccNotificacao, {
    localKey: 'uuidUsuario',
    foreignKey: 'uuid_usuario',
  })
  declare notificacoes: relations.HasMany<typeof TccNotificacao>

  @hasMany(() => AgendaParticipante, {
    localKey: 'uuidUsuario',
    foreignKey: 'uuid_usuario',
  })
  declare agendaParticipantes: relations.HasMany<typeof AgendaParticipante>
}

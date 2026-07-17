import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Tcc from './tcc.js'
import Aluno from './aluno.js'
import Usuario from './usuario.js'

export default class TccDocumento extends BaseModel {
  static get table() {
    return 'tcc_documento'
  }

  @column({ isPrimary: true })
  declare uuidTccDocumento: string

  @column()
  declare uuidTcc: string

  @column()
  declare uuidAluno: string

  @column()
  declare uuidUsuario: string

  @column()
  declare nome: string

  @column()
  declare tipo: string

  @column()
  declare tamanho: number

  @column()
  declare comentario?: string

  @column({ columnName: 'conteudo_base64' })
  declare conteudoBase64: string

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Tcc, {
    localKey: 'uuidTcc',
    foreignKey: 'uuidTcc',
  })
  declare tcc: relations.BelongsTo<typeof Tcc>

  @belongsTo(() => Aluno, {
    localKey: 'uuidAluno',
    foreignKey: 'uuidAluno',
  })
  declare aluno: relations.BelongsTo<typeof Aluno>

  @belongsTo(() => Usuario, {
    localKey: 'uuidUsuario',
    foreignKey: 'uuidUsuario',
  })
  declare usuario: relations.BelongsTo<typeof Usuario>
}

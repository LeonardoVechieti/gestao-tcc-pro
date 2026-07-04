import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as relations from '@adonisjs/lucid/types/relations'
import Tcc from './tcc.js'
import TemaTcc from './tema_tcc.js'
import Usuario from './usuario.js'

export default class Aluno extends BaseModel {
  static get table() {
    return 'aluno'
  }

  @column({ isPrimary: true })
  declare uuidAluno: string

  @column()
  declare nome: string

  @column()
  declare matricula: string

  @column()
  declare curso?: string

  @column()
  declare email: string

  @column()
  declare telefone?: string

  @column()
  declare observacao?: string

  @column()
  declare semestre?: string

  @column()
  declare situacao?: string

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Tcc, {
    localKey: 'uuidAluno',
    foreignKey: 'uuidAluno',
  })
  declare tccs: relations.HasMany<typeof Tcc>

  @hasMany(() => TemaTcc, {
    localKey: 'uuidAluno',
    foreignKey: 'uuidAluno',
  })
  declare temaTccs: relations.HasMany<typeof TemaTcc>

  @hasMany(() => Usuario, {
    localKey: 'uuidAluno',
    foreignKey: 'uuidAluno',
  })
  declare usuarios: relations.HasMany<typeof Usuario>
}

import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Role extends BaseModel {
  static get table() {
    return 'role'
  }

  @column({ isPrimary: true })
  declare uuidRole: string

  @column()
  declare codRole?: string

  @column()
  declare desRole: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

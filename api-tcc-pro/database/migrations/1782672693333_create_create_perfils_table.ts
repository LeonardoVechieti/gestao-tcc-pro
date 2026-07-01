import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'perfil'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_perfil').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('nome_perfil').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

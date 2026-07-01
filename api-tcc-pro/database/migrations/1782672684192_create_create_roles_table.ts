import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_role').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('cod_role').notNullable()
      table.string('des_role').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

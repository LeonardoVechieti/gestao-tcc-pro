import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'perfil_role'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('uuid_perfil')
        .notNullable()
        .references('uuid_perfil')
        .inTable('perfil')
        .onDelete('CASCADE')
      table
        .uuid('uuid_role')
        .notNullable()
        .references('uuid_role')
        .inTable('role')
        .onDelete('CASCADE')
      table.primary(['uuid_perfil', 'uuid_role'])
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

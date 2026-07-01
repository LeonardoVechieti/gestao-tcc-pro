import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'agenda_participante'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('uuid_agenda_participante')
        .primary()
        .defaultTo(this.raw('gen_random_uuid()'))
        .notNullable()
      table
        .uuid('uuid_agenda')
        .notNullable()
        .references('uuid_agenda')
        .inTable('agenda')
        .onDelete('CASCADE')
      table
        .uuid('uuid_usuario')
        .notNullable()
        .references('uuid_usuario')
        .inTable('usuario')
        .onDelete('CASCADE')
      table.string('cargo', 150).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

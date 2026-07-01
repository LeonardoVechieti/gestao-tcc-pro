import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'agenda'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_agenda').primary().defaultTo(this.raw('gen_random_uuid()')).notNullable()
      table.uuid('uuid_tcc').notNullable().references('uuid_tcc').inTable('tcc').onDelete('CASCADE')
      table
        .uuid('uuid_professor')
        .nullable()
        .references('uuid_professor')
        .inTable('professor')
        .onDelete('SET NULL')
      table.string('modalidade', 50).notNullable().defaultTo('presencial')
      table.date('data').nullable()
      table.time('hora').nullable()
      table.string('link_reuniao', 2048).nullable()
      table.string('local', 255).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
// modalidade (presencial, online, híbrido)

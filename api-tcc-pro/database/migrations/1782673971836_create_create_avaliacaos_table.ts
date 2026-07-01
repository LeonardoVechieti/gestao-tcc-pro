import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'avaliacao'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_avaliacao').primary().defaultTo(this.raw('gen_random_uuid()')).notNullable()
      table.uuid('uuid_tcc').notNullable().references('uuid_tcc').inTable('tcc').onDelete('CASCADE')
      table
        .uuid('uuid_professor')
        .nullable()
        .references('uuid_professor')
        .inTable('professor')
        .onDelete('SET NULL')
      table.decimal('nota', 5, 2).nullable()
      table.text('criterio_geral').nullable()
      table.jsonb('criterios_especificos').nullable()
      table.text('parecer').nullable()
      table.boolean('apto_correcoes').notNullable().defaultTo(false)
      table.boolean('publicado').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

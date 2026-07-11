import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tcc_orientacao_comentario'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('uuid_orientacao_comentario')
        .primary()
        .defaultTo(this.raw('gen_random_uuid()'))
        .notNullable()
      table.uuid('uuid_tcc').nullable().references('uuid_tcc').inTable('tcc').onDelete('CASCADE')
      table
        .uuid('uuid_tema_tcc')
        .nullable()
        .references('uuid_tema_tcc')
        .inTable('tema_tcc')
        .onDelete('CASCADE')
      table.string('autor_nome', 255).notNullable()
      table.string('autor_tipo', 50).notNullable().defaultTo('Professor')
      table.string('tipo', 100).notNullable().defaultTo('comentario')
      table.text('mensagem').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

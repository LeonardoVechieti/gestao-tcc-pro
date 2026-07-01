import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tema_tcc'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_tema_tcc').primary().defaultTo(this.raw('gen_random_uuid()')).notNullable()
      table
        .uuid('uuid_aluno')
        .notNullable()
        .references('uuid_aluno')
        .inTable('aluno')
        .onDelete('CASCADE')
      table
        .uuid('uuid_professor')
        .nullable()
        .references('uuid_professor')
        .inTable('professor')
        .onDelete('SET NULL')
      table.string('titulo', 255).notNullable()
      table.text('descricao').nullable()
      table.string('area', 150).nullable()
      table.string('linha_pesquisa', 150).nullable()
      table.jsonb('tags').nullable()
      table.boolean('ativo').notNullable().defaultTo(true)
      table.string('status', 100).notNullable().defaultTo('pendente')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

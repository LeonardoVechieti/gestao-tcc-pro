import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tcc'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_tcc').primary().defaultTo(this.raw('gen_random_uuid()')).notNullable()
      table
        .uuid('uuid_aluno')
        .notNullable()
        .references('uuid_aluno')
        .inTable('aluno')
        .onDelete('CASCADE')
      table
        .uuid('uuid_orientador')
        .nullable()
        .references('uuid_professor')
        .inTable('professor')
        .onDelete('SET NULL')
      table
        .uuid('uuid_tema_tcc')
        .notNullable()
        .references('uuid_tema_tcc')
        .inTable('tema_tcc')
        .onDelete('CASCADE')
      table.date('proxima_entrega').nullable()
      table.string('status', 100).notNullable().defaultTo('pendente')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

//uuid_tcc
// uuid_aluno
// uuid_orientador
// uuid_tema_tcc
//proxima_entrega
// status

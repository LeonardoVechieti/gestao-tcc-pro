import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tcc_documento'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('uuid_tcc_documento')
        .primary()
        .defaultTo(this.raw('gen_random_uuid()'))
        .notNullable()
      table.uuid('uuid_tcc').notNullable().references('uuid_tcc').inTable('tcc')
      table.uuid('uuid_aluno').notNullable().references('uuid_aluno').inTable('aluno')
      table.uuid('uuid_usuario').notNullable().references('uuid_usuario').inTable('usuario')
      table.string('nome', 254).notNullable()
      table.string('tipo', 254).notNullable()
      table.bigInteger('tamanho').notNullable()
      table.text('comentario').nullable()
      table.text('conteudo_base64').notNullable()
      table.boolean('ativo').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

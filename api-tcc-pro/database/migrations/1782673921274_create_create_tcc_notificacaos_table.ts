import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tcc_notificacao'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('uuid_tcc_notificacao')
        .primary()
        .defaultTo(this.raw('gen_random_uuid()'))
        .notNullable()
      table.uuid('uuid_tcc').notNullable().references('uuid_tcc').inTable('tcc').onDelete('CASCADE')
      table
        .uuid('uuid_usuario')
        .nullable()
        .references('uuid_usuario')
        .inTable('usuario')
        .onDelete('SET NULL')
      table.string('tipo', 100).notNullable().defaultTo('info')
      table.text('descricao').nullable()
      table.string('status', 100).notNullable().defaultTo('pendente')
      table.string('link_acao', 2048).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
// tipo (info, alerta, aviso, pendencia, aprovacao, reprovacao)

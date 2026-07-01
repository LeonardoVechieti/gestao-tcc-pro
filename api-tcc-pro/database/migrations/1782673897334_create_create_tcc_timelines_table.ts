import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tcc_timeline'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_timeline').primary().defaultTo(this.raw('gen_random_uuid()')).notNullable()
      table.uuid('uuid_tcc').notNullable().references('uuid_tcc').inTable('tcc').onDelete('CASCADE')
      table.string('titulo', 255).notNullable()
      table.text('descricao').nullable()
      table.date('data_entrega').nullable()
      table.string('status', 50).notNullable().defaultTo('pendente')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
// status (concluido, em_andamento, pendente, atrasado , agendado, cancelado)

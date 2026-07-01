import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'aluno'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_aluno').primary().defaultTo(this.raw('gen_random_uuid()')).notNullable()
      table.string('nome', 254).notNullable()
      table.string('matricula', 100).notNullable().unique()
      table.string('curso', 150).nullable()
      table.string('email', 254).notNullable().unique()
      table.string('telefone', 50).nullable()
      table.text('observacao').nullable()
      table.string('semestre', 50).nullable()
      table.string('situacao', 100).nullable()
      table.boolean('ativo').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

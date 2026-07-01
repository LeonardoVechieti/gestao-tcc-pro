import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'usuario'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('uuid_usuario').primary().defaultTo(this.raw('gen_random_uuid()')).notNullable()
      table.string('nome').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.boolean('ativo').notNullable().defaultTo(true)
      table.boolean('email_verified').notNullable().defaultTo(false)
      table
        .uuid('uuid_perfil')
        .nullable()
        .references('uuid_perfil')
        .inTable('perfil')
        .onDelete('SET NULL')
      table
        .uuid('uuid_aluno')
        .nullable()
        .references('uuid_aluno')
        .inTable('aluno')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

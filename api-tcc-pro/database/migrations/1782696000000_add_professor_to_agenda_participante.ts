import { BaseSchema } from '@adonisjs/lucid/schema'

/*
 * Membros de banca são professores, e nem todo professor tem usuário. Permite que o
 * participante da agenda seja um professor (uuid_professor) em vez de um usuário.
 */
export default class extends BaseSchema {
  protected tableName = 'agenda_participante'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid('uuid_professor')
        .nullable()
        .references('uuid_professor')
        .inTable('professor')
        .onDelete('CASCADE')
      table.uuid('uuid_usuario').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uuid_professor')
    })
    // Participantes de banca gravados só com professor não têm usuário e bloqueariam o NOT NULL.
    this.defer(async (db) => {
      await db.from(this.tableName).whereNull('uuid_usuario').delete()
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('uuid_usuario').notNullable().alter()
    })
  }
}

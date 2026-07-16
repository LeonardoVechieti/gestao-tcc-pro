import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'professor'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Store as JSON so we can keep an array of strings (areas / linhas)
      table.json('areas_interesse').nullable()
      table.json('linhas_pesquisa').nullable()
    })
  }

  async down() {
    await this.schema.raw(`ALTER TABLE "${this.tableName}" DROP COLUMN IF EXISTS "areas_interesse"`)
    await this.schema.raw(`ALTER TABLE "${this.tableName}" DROP COLUMN IF EXISTS "linhas_pesquisa"`)
  }
}
